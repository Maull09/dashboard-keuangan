# Development guide

## Prerequisites

- Node.js 22.12+ (22.x) or Node.js 24.x, with npm. Next.js 16 supports Node.js 20.9+, but the checked-in Vitest 5 dependency requires a newer runtime for development and tests.
- A Supabase project.

## Environment

Create `.env` in the repository root. In Supabase, open **Connect** and copy the connection string that matches your use case.

```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[POOLER-HOST]:6543/postgres?sslmode=require
```

Use the **Transaction pooler** URL for serverless deployments. Use the **Direct connection** URL or **Session pooler** (port 5432) for migrations and backups. The Session pooler supports IPv4-only networks. Copy the URL from Supabase; pooler hosts and usernames are project-specific. Do not commit `.env` or expose it with a `NEXT_PUBLIC_` prefix.

## Commands

Use `npm ci` to install the exact versions in the committed lockfile. Use `npm install` when intentionally updating dependencies, and commit the manifest and lockfile together.

```bash
npm install
npm run dev
npm run build
npm test
npm run db:generate
npm run db:migrate
npm run db:migrate -- --check
```

`db:generate` creates a Drizzle migration after a schema change. `db:migrate` applies existing migrations and verifies required schema objects. `--check` is read-only. Back up financial data before applying a migration; see the [migration and recovery guide](database-migrations.md) if existing tables have no migration history.

## Database

Drizzle schema definitions are in `src/db/schema.ts`; generated migrations are in `drizzle/`. The first migration preserves legacy transactions by assigning them to an `Uncategorized account`. Move them to their real account after migrating.

Migration `0003_wild_ultimo.sql` adds stock portfolios, price history, watchlists, and sinking funds. Apply it before running this version, since cash queries now include the stock ledger. Daily prices use Yahoo Finance; scheduled refreshes use `CRON_SECRET`; see [investment and planning setup](investments-and-planning.md).

Migration `0004_clumsy_jane_foster.sql` enables decimal trade quantities/prices and removes the whole-lot constraint. Existing trade values are preserved. Cash and partial-sale cost allocations now use cent precision; API validation rejects excess input precision instead of silently truncating it.

Migration `0005_concerned_ego.sql` widens trade prices from `numeric(14, 2)` to `numeric(16, 4)`, preserving existing values and integer capacity. Apply it before recording four-decimal prices. Per-share prices display four decimal places; cash totals still round to two. Migration generation alone does not update Supabase.

Migration `0006_lonely_shockwave.sql` changes the default source label for newly stored stock prices to Yahoo Finance. Existing price rows keep their original source label.

## Troubleshooting

- **Cannot connect to the database:** verify that `DATABASE_URL` comes from Supabase Connect, is URL-encoded where required, and uses SSL.
- **Missing `stock_trades`:** run `npm run db:migrate -- --check`, then follow the [migration and recovery guide](database-migrations.md). Successful account queries do not prove that all feature tables exist.
- **Migration fails:** make sure the connection targets the intended database. Use Direct connection or the Session pooler for migration work. Do not force schema pushes, drop application tables, or invent migration history to suppress an error.
- **Build fails:** run `npm install`, then retry `npm run build`.
- **Tests fail:** run `npm test` to identify the failed financial scenario.
