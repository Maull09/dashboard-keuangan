import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import pg from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { eq } from "drizzle-orm"
import { transactions } from "../src/db/schema"
import { readLedger, readReservations } from "../src/lib/server/ledger"
import { readBalanceLedger, readReservedCash, accountSummaryQuery, goalSummaryQuery, debtSummaryQuery } from "../src/lib/server/financial-queries"
import { readBudgets } from "../src/lib/server/budget-queries"
import { readDashboardLedger } from "../src/lib/server/dashboard-queries"
import { readTransactionPage } from "../src/lib/server/transaction-queries"
import { readLatestPrices } from "../src/lib/server/market-queries"
import { tradeCashChange } from "../src/lib/investments"
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
    expect(schemaIssues(loadSnapshot("0010"), await readDatabaseSchema(client))).toEqual([])
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

  it("keeps optimized SQL totals, pagination, prices and joins equivalent under RLS", async () => {
    await asUser(userA, async () => {
      await client.query("SAVEPOINT query_fixture")
      try {
        let queryCount = 0
        const connection = drizzle(client, { logger: { logQuery() { queryCount++ } } })
        async function singleQuery(action) {
          const before = queryCount
          const result = await action()
          expect(queryCount - before).toBe(1)
          return result
        }
        const accountId = (await client.query("INSERT INTO accounts(name, type, initial_balance) VALUES ('Query fixture', 'investment', 10000) RETURNING id")).rows[0].id
        const targetId = (await client.query("INSERT INTO accounts(name, type, initial_balance) VALUES ('Transfer target', 'bank', 1000) RETURNING id")).rows[0].id
        await client.query("INSERT INTO transactions(type, amount, category, date, account_id, destination_account_id) VALUES ('income', 1000, 'Salary', '2026-04-01', $1, null), ('expense', 200, 'Food', '2026-09-02', $1, null), ('expense', 50, 'Food', '2026-10-02', $1, null), ('expense', 70, 'Food', '2026-10-02', $1, null), ('transfer', 500, 'Transfer', '2026-10-03', $1, $2), ('income', 600, 'Salary', '2027-01-01', $1, null)", [accountId, targetId])
        await client.query("INSERT INTO stock_instruments(symbol, name) VALUES ('TEST', 'Fixture')")
        await client.query("INSERT INTO stock_trades(account_id, symbol, side, shares, price, fees, date) VALUES ($1, 'TEST', 'buy', 3.1234, 789.1234, 20, '2026-04-02'), ($1, 'TEST', 'sell', 1.1234, 890.2345, 10, '2026-10-03'), ($1, 'TEST', 'buy', 0.0001, 50, 0, '2026-10-04')", [accountId])
        await client.query("INSERT INTO stock_prices(symbol, price, date) VALUES ('TEST', 800, '2026-09-01'), ('TEST', 900, '2026-10-01')")
        await client.query("INSERT INTO budgets(category, budget, period_start, rollover_enabled) VALUES ('Food', 500, '2026-09-01', true), ('Food', 400, '2026-10-01', true), ('Empty', 100, '2026-10-01', false)")
        const goalId = (await client.query("INSERT INTO goals(title, target_amount, current_amount, target_date) VALUES ('Fixture goal', 1000, 10, '2027-01-01') RETURNING id")).rows[0].id
        await client.query("INSERT INTO goal_contributions(goal_id, account_id, amount, date) VALUES ($1, $2, 50, '2026-10-01'), ($1, $2, 70, '2026-10-02')", [goalId, accountId])
        const fundId = (await client.query("INSERT INTO sinking_funds(name, account_id, target_amount, target_date) VALUES ('Fixture fund', $1, 1000, '2027-01-01') RETURNING id", [accountId])).rows[0].id
        await client.query("INSERT INTO sinking_fund_entries(fund_id, kind, amount, date) VALUES ($1, 'allocate', 200, '2026-10-01'), ($1, 'release', 40, '2026-10-02')", [fundId])
        const debtId = (await client.query("INSERT INTO debts(type, name, amount, due_date) VALUES ('utang', 'Fixture debt', 1000, '2026-10-01') RETURNING id")).rows[0].id
        const transactionId = (await client.query("SELECT id FROM transactions WHERE account_id=$1 AND type='expense' LIMIT 1", [accountId])).rows[0].id
        await client.query("INSERT INTO debt_payments(debt_id, account_id, amount, date, transaction_id) VALUES ($1, $2, 300, '2026-10-01', $3), ($1, $2, 200, '2026-10-02', $3)", [debtId, accountId, transactionId])

        const oldLedger = await readLedger(connection)
        const newLedger = await singleQuery(() => readBalanceLedger(connection))
        expect(newLedger.summaries).toEqual(oldLedger.summaries.toSorted((a, b) => a.id - b.id))
        expect(newLedger.cashBalance).toBe(oldLedger.cashBalance)
        for (const id of [accountId, targetId]) {
          const expected = oldLedger.summaries.filter((row) => row.id === id)
          expect((await readLedger(connection, [id])).summaries).toEqual(expected)
          expect(await accountSummaryQuery(connection, [id])).toEqual(expected)
        }
        expect((await readReservedCash(connection)).reserved).toEqual((await readReservations(connection)).reserved)
        expect((await readReservedCash(connection, [accountId])).reserved).toEqual((await readReservations(connection, [accountId])).reserved)
        expect((await readReservations(connection, [targetId])).entries).toEqual([])
        expect((await goalSummaryQuery(connection)).find((row) => row.id === goalId).currentAmount).toBe(130)
        expect((await debtSummaryQuery(connection)).find((row) => row.id === debtId)).toMatchObject({ paidAmount: 500, remaining: 500 })
        const budgetRows = await singleQuery(() => readBudgets(connection, '2026-10-01', '2026-11-01', '2026-09-01'))
        expect(budgetRows.find((row) => row.category === 'Food')).toMatchObject({ spent: 120, carryover: 300, effectiveBudget: 700 })
        expect(budgetRows.find((row) => row.category === 'Empty')).toMatchObject({ spent: 0, carryover: 0 })

        const dashboard = await singleQuery(() => readDashboardLedger(connection, { historyStart: '2026-05-01', historyEnd: '2026-11-01', previousStart: '2026-09-01', periodEnd: '2026-11-01', recentStart: '2026-10-01', today: '2026-10-07' }))
        expect(dashboard.cashBalance).toBe(oldLedger.cashBalance)
        expect(dashboard.transactions.find((row) => row.date === '2026-10-02')).toMatchObject({ amount: 120 })
        expect(dashboard.transactions.some((row) => row.date === '2027-01-01')).toBe(false)
        expect(dashboard.openingChange).toBe(1000 + tradeCashChange(oldLedger.trades.find((trade) => trade.date === '2026-04-02')))
        expect(await singleQuery(() => readLatestPrices(connection, ['TEST', 'BBCA', 'TEST']))).toMatchObject([{ symbol: 'TEST', price: 900, date: '2026-10-01' }])
        expect(await readLatestPrices(connection, [])).toEqual([])
        const page = await singleQuery(() => readTransactionPage(connection, eq(transactions.accountId, accountId), 100, 2))
        expect(page).toMatchObject({ page: 3, total: 6, totalPages: 3, limit: 2, summary: { income: 1600, expense: 320 } })
        expect(page.items).toHaveLength(2)
        expect(page.items[0]).toMatchObject({ category: 'Food', date: '2026-09-02', accountId })
        const expectedPage = oldLedger.transactions
          .filter((row) => row.accountId === accountId)
          .toSorted((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
          .slice(4, 6)
        expect(page.items).toEqual(JSON.parse(JSON.stringify(expectedPage)))
        expect(await readTransactionPage(connection, eq(transactions.accountId, -1), 2, 25)).toMatchObject({ items: [], page: 1, total: 0, totalPages: 1 })

        await client.query("SELECT set_config('app.user_id', $1, true)", [userB])
        expect((await readLedger(connection, [accountId])).summaries).toEqual([])
        expect(await accountSummaryQuery(connection, [accountId])).toEqual([])
        expect((await readReservations(connection, [accountId])).reserved.size).toBe(0)
        expect((await readReservedCash(connection, [accountId])).reserved.size).toBe(0)
        expect((await readBalanceLedger(connection)).summaries.map((row) => row.id)).toEqual([accountB.id])
        expect(await readBudgets(connection, '2026-10-01', '2026-11-01', '2026-09-01')).toEqual([])
        expect(await goalSummaryQuery(connection)).toEqual([])
        expect(await debtSummaryQuery(connection)).toEqual([])
        expect((await readTransactionPage(connection, undefined, 1, 25)).total).toBe(0)
        expect((await readDashboardLedger(connection, { historyStart: '2026-05-01', historyEnd: '2026-11-01', previousStart: '2026-09-01', periodEnd: '2026-11-01', recentStart: '2026-10-01', today: '2026-10-07' })).cashBalance).toBe(0)
      } finally {
        await client.query("ROLLBACK TO SAVEPOINT query_fixture")
      }
    })
  })
})
