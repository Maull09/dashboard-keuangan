import { config } from "dotenv"
import { readFileSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"
import pg from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { readMigrationFiles } from "drizzle-orm/migrator"
import { databaseConnectionOptions } from "../src/db/connection.mjs"
import { verifyAuthReadiness } from "./auth-readiness.mjs"
import {
  loadSnapshot,
  quoteIdentifier,
  readDatabaseSchema,
  schemaIssues,
} from "./db-schema.mjs"

export async function readMigrationHistory(client) {
  const result = await client.query(
    "SELECT to_regclass('drizzle.__drizzle_migrations') AS history_table",
  )
  if (!result.rows[0].history_table) return []
  return (
    await client.query(
      "SELECT hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at",
    )
  ).rows
}

export async function baselineLegacySchema(client, migrations) {
  const snapshot = loadSnapshot("0002")
  await client.query("BEGIN")
  try {
    await client.query("SET LOCAL lock_timeout = '5s'")
    await client.query("SET LOCAL statement_timeout = '60s'")
    await client.query(
      `LOCK TABLE ${Object.values(snapshot.tables)
        .map((table) => "public." + quoteIdentifier(table.name))
        .join(", ")} IN SHARE ROW EXCLUSIVE MODE`,
    )
    await client.query("CREATE SCHEMA IF NOT EXISTS drizzle")
    await client.query(
      "CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint)",
    )
    await client.query(
      "LOCK TABLE drizzle.__drizzle_migrations IN ACCESS EXCLUSIVE MODE",
    )
    if ((await readMigrationHistory(client)).length)
      throw new Error("Baseline refused: migration history is no longer empty.")
    const issues = schemaIssues(snapshot, await readDatabaseSchema(client), {
      strictTables: true,
    })
    if (issues.length) throw new Error("Baseline refused: " + issues.join("; "))
    for (const migration of migrations.slice(0, 3))
      await client.query(
        "INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)",
        [migration.hash, migration.folderMillis],
      )
    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  }
}

export async function runMigrations(
  client,
  { check = false, baseline = false, backup } = {},
) {
  const journal = JSON.parse(
    readFileSync("drizzle/meta/_journal.json", "utf8"),
  ).entries
  const migrations = readMigrationFiles({ migrationsFolder: "drizzle" })
  const latestPrefix = String(journal.at(-1).idx).padStart(4, "0")
  const latestSnapshot = loadSnapshot(latestPrefix)
  let history = await readMigrationHistory(client)
  if (check) {
    const issues = schemaIssues(
      latestSnapshot,
      await readDatabaseSchema(client),
    )
    if (issues.length)
      throw new Error("Database is not ready: " + issues.join("; "))
    if (!history.some((row) => Number(row.created_at) === journal.at(-1).when))
      throw new Error("Schema exists but the latest migration is not recorded.")
    await verifyAuthReadiness(client)
    console.log(
      `Database check passed: ${Object.keys(latestSnapshot.tables).length} application tables; ${history.length} recorded migrations.`,
    )
    return
  }
  if (baseline) {
    if (history.length)
      throw new Error(
        "Baseline refused: migration history is not empty. Run npm run db:migrate normally.",
      )
    if (
      !backup ||
      !statSync(backup).isFile() ||
      statSync(backup).size < 100 ||
      readFileSync(backup).subarray(0, 5).toString("ascii") !== "PGDMP"
    )
      throw new Error(
        "Baseline requires an existing PostgreSQL custom-format backup: --backup=<path>.",
      )
    if (journal[2]?.tag !== "0002_uneven_killer_shrike")
      throw new Error(
        "The supported legacy baseline is missing from the migration journal.",
      )
    await baselineLegacySchema(client, migrations)
    history = await readMigrationHistory(client)
    console.log(
      "Verified legacy schema and recorded baseline migrations 0000–0002. Existing financial rows were not modified.",
    )
  } else if (!history.length) {
    const actual = await readDatabaseSchema(client)
    const applicationTables = new Set(
      Object.values(latestSnapshot.tables).map((table) => table.name),
    )
    if (
      actual.columns.some((column) => applicationTables.has(column.table_name))
    )
      throw new Error(
        "Existing application tables have no migration history. No migrations were applied. Back up this database and explicitly adopt the verified legacy schema with --baseline=0002 --backup=<path>.",
      )
  }
  const lastTimestamp = Math.max(
    0,
    ...history.map((row) => Number(row.created_at)),
  )
  if (lastTimestamp > journal.at(-1).when)
    throw new Error(
      "Database migration history is newer than this checkout. Use the matching repository version.",
    )
  const pending = journal.filter((entry) => entry.when > lastTimestamp)
  console.log(
    pending.length
      ? "Applying: " + pending.map((entry) => entry.tag).join(", ")
      : "No pending migrations.",
  )
  await migrate(drizzle(client), { migrationsFolder: "drizzle" })
  const issues = schemaIssues(latestSnapshot, await readDatabaseSchema(client))
  if (issues.length)
    throw new Error(
      "Migration finished but schema verification failed: " + issues.join("; "),
    )
  const completed = await readMigrationHistory(client)
  await verifyAuthReadiness(client)
  if (!completed.some((row) => Number(row.created_at) === journal.at(-1).when))
    throw new Error(
      "The latest migration was not recorded. Database setup is incomplete.",
    )
  console.log(
    `Migration successful: ${pending.length} applied; ${Object.keys(latestSnapshot.tables).length} application tables verified.`,
  )
}

async function main() {
  config({ quiet: true })
  const args = process.argv.slice(2)
  if (
    args.some(
      (argument) =>
        argument !== "--check" &&
        argument !== "--baseline=0002" &&
        !argument.startsWith("--backup="),
    )
  )
    throw new Error(
      "Usage: npm run db:migrate -- [--check | --baseline=0002 --backup=<path>]",
    )
  if (
    args.includes("--check") &&
    args.some((argument) => argument !== "--check")
  )
    throw new Error(
      "--check is read-only and cannot be combined with baseline options.",
    )
  if (
    args.some((argument) => argument.startsWith("--backup=")) &&
    !args.includes("--baseline=0002")
  )
    throw new Error("--backup is only valid with --baseline=0002.")
  if (!process.env.DATABASE_URL)
    throw new Error(
      "DATABASE_URL is missing. Configure .env for the intended database.",
    )
  const client = new pg.Client({
    ...databaseConnectionOptions(
      process.env.DATABASE_URL,
      process.env.DATABASE_CA_CERT,
    ),
    connectionTimeoutMillis: 15000,
    query_timeout: 60000,
  })
  try {
    await client.connect()
    await runMigrations(client, {
      check: args.includes("--check"),
      baseline: args.includes("--baseline=0002"),
      backup: args
        .find((argument) => argument.startsWith("--backup="))
        ?.slice(9),
    })
  } finally {
    await client.end()
  }
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  main().catch((error) => {
    const code = error.code ?? error.cause?.code
    console.error(
      code
        ? `Database migration failed (${code}). No success was reported. Check connection, permissions, schema conflicts, or timeouts.`
        : error.message,
    )
    process.exitCode = 1
  })
}
