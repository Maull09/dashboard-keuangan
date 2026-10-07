import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import pg from "pg"
import { assignLegacyOwner } from "./db-assign-owner.mjs"
import { schemaIssues, loadSnapshot, readDatabaseSchema } from "./db-schema.mjs"
import { verifyAuthReadiness } from "./auth-readiness.mjs"

const testUrl = process.env.AUTH_TEST_DATABASE_URL
const userA = "00000000-0000-4000-8000-000000000001"
const userB = "00000000-0000-4000-8000-000000000002"

describe.skipIf(!testUrl)("PostgreSQL ownership policies", () => {
  let client
  let accountA
  let accountB
  let legacyId

  async function asUser(id, action) {
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE")
    try {
      await client.query("SET LOCAL ROLE finance_user")
      if (id) await client.query("SELECT set_config('app.user_id', $1, true)", [id])
      const result = await action()
      await client.query("COMMIT")
      return result
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    }
  }

  beforeAll(async () => {
    const url = new URL(testUrl)
    if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_auth_test"))
      throw new Error("Use a disposable local database ending in _auth_test")
    client = new pg.Client({ connectionString: testUrl })
    await client.connect()
    const existing = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
    if (existing.rowCount) throw new Error("Auth tests require an empty disposable database")
    const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8")).entries
    for (const migration of journal) {
      if (migration.idx === 6) {
        legacyId = (await client.query("INSERT INTO accounts (name, type, initial_balance) VALUES ('Legacy', 'bank', 12345) RETURNING id")).rows[0].id
        await client.query("INSERT INTO stock_instruments (symbol, name) VALUES ('BBRI', 'BBRI')")
        await client.query("INSERT INTO stock_watchlist (symbol, note) VALUES ('BBRI', 'Legacy note')")
      }
      await client.query("BEGIN")
      for (const statement of readFileSync(`drizzle/${migration.tag}.sql`, "utf8").split("--> statement-breakpoint"))
        await client.query(statement)
      await client.query("COMMIT")
    }
    await client.query("CREATE SCHEMA auth; CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, email_confirmed_at timestamptz)")
    await client.query("INSERT INTO auth.users VALUES ($1, 'owner@example.test', now()), ($2, 'other@example.test', now())", [userA, userB])
    accountA = (await asUser(userA, () => client.query("INSERT INTO accounts (name, type) VALUES ('A', 'bank') RETURNING id, user_id"))).rows[0]
    accountB = (await asUser(userB, () => client.query("INSERT INTO accounts (name, type) VALUES ('B', 'bank') RETURNING id, user_id"))).rows[0]
    await client.query("INSERT INTO stock_instruments (symbol, name) VALUES ('BBCA', 'BBCA')")
  }, 30000)

  afterAll(async () => { await client?.end() })

  it("applies migrations without losing legacy amounts or watchlist notes", async () => {
    expect((await client.query("SELECT initial_balance, user_id FROM accounts WHERE id = $1", [legacyId])).rows[0]).toEqual({ initial_balance: 12345, user_id: null })
    expect((await client.query("SELECT note FROM stock_watchlist")).rows[0].note).toBe("Legacy note")
    expect(schemaIssues(loadSnapshot("0008"), await readDatabaseSchema(client))).toEqual([])
  })

  it("automatically assigns new rows and isolates reads, updates, and deletes", async () => {
    expect(accountA.user_id).toBe(userA)
    expect(accountB.user_id).toBe(userB)
    await asUser(userB, async () => {
      expect((await client.query("SELECT id FROM accounts")).rows).toEqual([{ id: accountB.id }])
      expect((await client.query("UPDATE accounts SET name = 'stolen' WHERE id = $1", [accountA.id])).rowCount).toBe(0)
      expect((await client.query("DELETE FROM accounts WHERE id = $1", [accountA.id])).rowCount).toBe(0)
    })
  })

  it("rejects forged ownership and foreign accounts", async () => {
    await expect(asUser(userB, () => client.query("INSERT INTO accounts (name, type, user_id) VALUES ('forged', 'bank', $1)", [userA]))).rejects.toMatchObject({ code: "42501" })
    await expect(asUser(userB, () => client.query("INSERT INTO transactions (type, amount, category, date, account_id) VALUES ('expense', 100, 'food', '2026-10-07', $1)", [accountA.id]))).rejects.toMatchObject({ code: "42501" })
    await expect(asUser(userB, () => client.query("INSERT INTO transactions (type, amount, category, date, account_id, destination_account_id) VALUES ('transfer', 100, 'transfer', '2026-10-07', $1, $2)", [accountB.id, accountA.id]))).rejects.toMatchObject({ code: "42501" })
  })

  it("isolates watchlist notes while allowing the same ticker for two users", async () => {
    await asUser(userA, () => client.query("INSERT INTO stock_watchlist (symbol, note) VALUES ('BBCA', 'A note')"))
    await asUser(userB, async () => {
      await client.query("INSERT INTO stock_watchlist (symbol, note) VALUES ('BBCA', 'B note')")
      expect((await client.query("SELECT note FROM stock_watchlist")).rows).toEqual([{ note: "B note" }])
    })
  })

  it("does not retain the previous user on a reused connection", async () => {
    await asUser(userA, () => client.query("SELECT * FROM accounts"))
    await asUser(null, async () => {
      expect((await client.query("SELECT * FROM accounts")).rowCount).toBe(0)
    })
    expect((await client.query("SELECT current_user")).rows[0].current_user).toBe("postgres")
  })

  it("detects disabled ownership enforcement during readiness checks", async () => {
    await verifyAuthReadiness(client)
    await client.query("BEGIN; ALTER TABLE accounts DISABLE ROW LEVEL SECURITY")
    try { await expect(verifyAuthReadiness(client)).rejects.toThrow("accounts") }
    finally { await client.query("ROLLBACK") }
  })

  it("keeps ownership mandatory even when a legacy permissive policy exists", async () => {
    await client.query("CREATE POLICY legacy_open ON accounts FOR ALL TO PUBLIC USING (true) WITH CHECK (true)")
    try {
      const result = await asUser(userB, () => client.query("SELECT id FROM accounts"))
      expect(result.rows).toEqual([{ id: accountB.id }])
    } finally { await client.query("DROP POLICY legacy_open ON accounts") }
  })

  it("refuses conflicting legacy watchlist notes before changing ownership", async () => {
    await asUser(userA, () => client.query("INSERT INTO stock_watchlist (symbol, note) VALUES ('BBRI', 'New owner note')"))
    try {
      await expect(assignLegacyOwner(client, "owner@example.test", true)).rejects.toThrow("duplicate notes")
      expect((await client.query("SELECT user_id FROM accounts WHERE id=$1", [legacyId])).rows[0].user_id).toBeNull()
    } finally {
      await asUser(userA, () => client.query("DELETE FROM stock_watchlist WHERE symbol='BBRI'"))
    }
  })

  it("previews and assigns legacy data only to a verified owner", async () => {
    await expect(assignLegacyOwner(client, "missing@example.test", true)).rejects.toThrow("confirmed")
    const preview = await assignLegacyOwner(client, "owner@example.test")
    expect(preview.accounts).toBe(1)
    expect((await client.query("SELECT user_id FROM accounts WHERE id=$1", [legacyId])).rows[0].user_id).toBeNull()
    const applied = await assignLegacyOwner(client, "owner@example.test", true)
    expect(applied).toEqual(preview)
    expect((await client.query("SELECT user_id, initial_balance FROM accounts WHERE id=$1", [legacyId])).rows[0]).toEqual({ user_id: userA, initial_balance: 12345 })
    expect((await assignLegacyOwner(client, "owner@example.test", true)).accounts).toBe(0)
    expect((await client.query("SELECT user_id FROM accounts WHERE id=$1", [accountB.id])).rows[0].user_id).toBe(userB)
  })
})
