# Database migrations and recovery

`npm run db:migrate` uses the official Drizzle migrator through a plain Node.js runner. It prints pending migration names, verifies the required schema afterward, and exits unsuccessfully on connection, migration, or readiness errors. It does not infer migration history from the presence of an account table.

## Normal workflow

1. Confirm that `DATABASE_URL` in `.env` targets the intended database.
2. Back up existing financial data and stop application writes during migration work.
3. Prefer Supabase Direct connection or the Session pooler (port 5432) for migrations and backups. Use the Session pooler when the direct host is unreachable on an IPv4-only network.
4. Run `npm run db:migrate`.
5. Run `npm run db:migrate -- --check` before restarting the app.

The read-only check validates required tables, columns, types, nullability, defaults, serial sequences, primary/foreign keys, enum values, and the presence of required named checks/indexes. It also requires the latest migration timestamp in history. It does not compare every catalog property, check expression, index expression, RLS policy, or permission.

Generating migrations is not applying them. An account endpoint can succeed while the dashboard fails because `stock_trades` has not been created. This version expects 15 application tables and migration `0005_concerned_ego`, including four-decimal numeric trade quantities/prices with their declared precision and scale. Migration 0005 widens only the trade price column from `numeric(14, 2)` to `numeric(16, 4)`; back up before applying it.

## Existing legacy tables with empty migration history

This recovery is only for the nine-table schema represented by `0002_uneven_killer_shrike`. It is not a general-purpose way to mark arbitrary SQL as applied.

1. Confirm the database identity and suspend other schema/data changes.
2. Create a PostgreSQL **custom-format** backup covering both `public` and `drizzle`, using `pg_dump` of the same or a newer major version than the server. For PostgreSQL 17, use version 17 or newer, not 16.
3. Validate the archive with `pg_restore --list`. A full restore rehearsal in a separate database provides stronger assurance; never rehearse over the original database.
4. Keep the backup private. Local `backups/` is ignored by Git, but ignored files are not encrypted or stored remotely. Copy important backups to protected storage.
5. Run the explicit recovery once:

   ```bash
   npm run db:migrate -- --baseline=0002 --backup=backups/your-validated-backup.dump
   npm run db:migrate -- --check
   ```

The runner requires an existing non-empty custom archive. It checks the archive header; the operator must verify the archive contents and that it belongs to the intended database. It locks legacy tables and migration history, rejects non-empty history or a mismatched legacy schema, and records the exact hashes/timestamps for migrations 0000–0002 without replaying their SQL. Unexpected public tables are rejected during legacy adoption.

Baseline adoption is one transaction. Pending SQL is then applied in a separate Drizzle transaction. If the new migration fails, a verified baseline can remain recorded; fix the reported cause and rerun normal migration. Do not rerun baseline adoption or delete the history table.

Neither adoption nor migration 0003 updates existing financial rows. Migration 0003 creates the six investment/sinking-fund tables and their constraints/indexes.

## Connection and certificate errors

Copy credentials from Supabase Connect and URL-encode password characters when necessary. Never include the connection URL or credentials in bug reports. The migration runner reports PostgreSQL/connection error codes without logging query parameters or the URL.

For verified TLS, download the project CA from Supabase **Database settings → SSL configuration**. Use `sslmode=verify-full` with an URL-encoded `sslrootcert` file path in the connection URL, and `PGSSLMODE=verify-full` plus `PGSSLROOTCERT` for PostgreSQL backup tools. Do not disable certificate or hostname verification to work around a missing CA. See [Supabase SSL configuration](https://supabase.com/docs/guides/platform/ssl-enforcement) and [connection methods](https://supabase.com/docs/guides/database/connecting-to-postgres).

A failed command is not proof that no migration ran: check the schema/history before retrying. Do not use forced schema pushes, drop user tables, or manually fabricate migration entries.
