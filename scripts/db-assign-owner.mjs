import { config } from "dotenv"
import pg from "pg"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"
import { databaseConnectionOptions } from "../src/db/connection.mjs"
import { ownedTables } from "./auth-tables.mjs"

export async function assignLegacyOwner(client, email, apply = false) {
  await client.query("BEGIN")
  try {
    await client.query("SET LOCAL lock_timeout = '5s'")
    await client.query("SET LOCAL statement_timeout = '60s'")
    const { rows: users } = await client.query(
      "SELECT id, email_confirmed_at FROM auth.users WHERE lower(email) = lower($1) FOR SHARE",
      [email],
    )
    if (users.length !== 1 || !users[0].email_confirmed_at)
      throw new Error(
        "Owner must be exactly one existing, confirmed Supabase Auth user. No data was assigned.",
      )
    await client.query(
      `LOCK TABLE ${ownedTables.map((name) => `public.${name}`).join(", ")} IN SHARE ROW EXCLUSIVE MODE`,
    )
    const counts = {}
    const collisions = await client.query(
      "SELECT 1 FROM stock_watchlist legacy JOIN stock_watchlist owned ON owned.symbol = legacy.symbol AND owned.user_id = $1 WHERE legacy.user_id IS NULL LIMIT 1",
      [users[0].id],
    )
    if (collisions.rowCount)
      throw new Error("Owner already has a watchlist ticker present in legacy data. Resolve the duplicate notes before assigning. No data was assigned.")
    for (const table of ownedTables) {
      const { rows } = await client.query(
        `SELECT count(*)::int AS count FROM public.${table} WHERE user_id IS NULL`,
      )
      counts[table] = rows[0].count
      if (apply)
        await client.query(
          `UPDATE public.${table} SET user_id = $1 WHERE user_id IS NULL`,
          [users[0].id],
        )
    }
    await client.query(apply ? "COMMIT" : "ROLLBACK")
    return counts
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  }
}

async function main() {
  config({ quiet: true })
  const args = process.argv.slice(2)
  const email = args.find((arg) => arg.startsWith("--email="))?.slice(8)
  if (
    !email ||
    args.some((arg) => arg !== "--apply" && !arg.startsWith("--email="))
  )
    throw new Error(
      "Usage: npm run db:assign-owner -- --email=owner@example.com [--apply]",
    )
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing")
  const client = new pg.Client({
    ...databaseConnectionOptions(
      process.env.DATABASE_URL,
      process.env.DATABASE_CA_CERT,
    ),
    connectionTimeoutMillis: 15000,
  })
  try {
    await client.connect()
    const counts = await assignLegacyOwner(
      client,
      email,
      args.includes("--apply"),
    )
    console.log(
      args.includes("--apply")
        ? "Ownership assigned. Financial values are unchanged."
        : "Preview only. No rows changed. Add --apply after reviewing counts and backing up.",
    )
    console.table(counts)
  } finally {
    await client.end()
  }
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
)
  main().catch((error) => {
    console.error(
      error.code ? `Owner assignment failed (${error.code}).` : error.message,
    )
    process.exitCode = 1
  })
