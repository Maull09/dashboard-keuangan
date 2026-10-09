# Development guide

## Prerequisites

- Node.js 22.12+ (22.x) or Node.js 24.x, with npm. Next.js 16 supports Node.js 20.9+, but the checked-in Vitest 5 dependency requires a newer runtime for development and tests.
- A Supabase project.

## Environment

Create `.env` in the repository root. In Supabase, open **Connect** and copy the connection string that matches your use case.

```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[POOLER-HOST]:6543/postgres?sslmode=verify-full
DATABASE_CA_CERT="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Use the **Transaction pooler** URL for serverless deployments. Use the **Direct connection** URL or **Session pooler** (port 5432) for migrations and backups. The Session pooler supports IPv4-only networks. Copy the URL from Supabase; pooler hosts and usernames are project-specific. Do not commit `.env` or expose it with a `NEXT_PUBLIC_` prefix.

The two `NEXT_PUBLIC_SUPABASE_*` values come from the same project's API settings and are intentionally public. Never use a secret/service-role key in their place. Set them before building, since Next.js embeds public variables into the client bundle. See [authentication setup](authentication.md) for email confirmation, ownership migration, and session verification.

## Local Redis cache

Start the cache with Docker Desktop running:

```bash
docker compose up -d redis
docker compose exec redis redis-cli ping
```

Add `REDIS_URL=redis://127.0.0.1:6379` to your local `.env`, apply migration
`0011_redis_api_cache` with `npm run db:migrate`, then restart the application.
Follow the [migration guide](database-migrations.md) and back up existing financial
data before migrating. The migration adds cache revision metadata and triggers;
it preserves existing financial records and amounts. Redis binds only to the
local loopback address, limits memory to 128 MB, and does not persist cached data.
Stop it with `docker compose stop redis`.

Authenticated financial GET endpoints cache successful JSON results for 60 seconds.
Keys separate users, origins, paths, query parameters, and the Jakarta calendar
date. Authentication and PostgreSQL ownership checks still run on every request.
Database triggers change a user's cache revision in the same transaction as each
financial write; shared market data changes a global revision. Old entries then
become unreachable and expire naturally, including after writes made while Redis
was unavailable. Cache writes happen only after the database transaction commits.

The `X-Finance-Cache` response header reports `HIT`, `MISS`, or `BYPASS`.
Responses retain `Cache-Control: private, no-store` for browsers and proxies.
Without `REDIS_URL`, the app reads PostgreSQL directly. Redis failures also use
live database reads, with one-second connection/command timeouts. PostgreSQL
remains authoritative; mutations, failed responses, and cookie-setting responses
are never cached. For hosted Redis, use an authenticated `rediss://` URL as
recommended in the [Redis connection guide](https://redis.io/docs/latest/develop/clients/nodejs/connect/).
Keep `REDIS_URL` server-only and out of source control.

For the real Redis integration tests, set `REDIS_TEST_URL=redis://127.0.0.1:6379`
when running `npm test`. To also verify transactional invalidation against
PostgreSQL, provide the disposable local `AUTH_TEST_DATABASE_URL` described in
the [authentication verification guide](authentication.md#verification).

## Commands

Test files live in `tests/`, grouped by the matching application modules (`lib/`, `db/`, `components/`, `app/`) and operational scripts (`scripts/`). Application imports use the existing `@/` alias. Run `npm test` for the full suite or, for example, `npx vitest run tests/lib/ai` for one module. Integration test environment requirements remain as described above and in the focused setup documents.

Use `npm ci` to install the exact versions in the committed lockfile. Use `npm install` when intentionally updating dependencies, and commit the manifest and lockfile together.

```bash
npm install
npm run dev
npm run lint
npm run build
npm test
npm run db:generate
npm run db:migrate
npm run db:check
```

`db:generate` creates a Drizzle migration after a schema change. `db:migrate` applies existing migrations and verifies required schema objects. `db:check` is read-only. Back up financial data before applying a migration; see the [migration and recovery guide](database-migrations.md) if existing tables have no migration history.

## Database

Drizzle schema definitions are in `src/db/schema.ts`; generated migrations are in `drizzle/`. The first migration preserves legacy transactions by assigning them to an `Uncategorized account`. Move them to their real account after migrating.

Migration `0003_wild_ultimo.sql` adds stock portfolios, price history, watchlists, and sinking funds. Apply it before running this version, since cash queries now include the stock ledger. Daily pricing uses Yahoo Finance without an API key; the scheduled endpoint still requires `CRON_SECRET`. See [investment and planning setup](investments-and-planning.md).

Migration `0004_clumsy_jane_foster.sql` enables decimal trade quantities/prices and removes the whole-lot constraint. Existing trade values are preserved. Cash and partial-sale cost allocations now use cent precision; API validation rejects excess input precision instead of silently truncating it.

Migration `0005_concerned_ego.sql` widens trade prices from `numeric(14, 2)` to `numeric(16, 4)`, preserving existing values and integer capacity. Apply it before recording four-decimal prices. Per-share prices display four decimal places; cash totals still round to two. Migration generation alone does not update Supabase.

Switching daily prices from Twelve Data to Yahoo Finance requires updated npm dependencies and an application restart, not another migration. The price writer explicitly stores `Yahoo Finance` as its source; historical quotes keep their source until that same ticker/date is successfully refreshed. The historical database source default is unchanged. The old Twelve Data environment key can be removed locally; it is no longer read by the app.

## Troubleshooting

- **Cannot connect to the database:** verify that `DATABASE_URL` comes from Supabase Connect, is URL-encoded where required, and uses SSL. For a project CA that is not in the host trust store, set `DATABASE_CA_CERT` to the PEM value from Supabase; multiline, escaped `\n`, and single-line PEM values are supported.
- **Missing `stock_trades`:** run `npm run db:migrate -- --check`, then follow the [migration and recovery guide](database-migrations.md). Successful account queries do not prove that all feature tables exist.
- **Migration fails:** make sure the connection targets the intended database. Use Direct connection or the Session pooler for migration work. Do not force schema pushes, drop application tables, or invent migration history to suppress an error.
- **Build fails:** run `npm install`, then retry `npm run build`.
- **Lint fails:** run `npm run lint` to identify the reported source file and rule. Next.js 16 uses the ESLint CLI rather than `next lint`.
- **Tests fail:** run `npm test` to identify the failed financial scenario.
