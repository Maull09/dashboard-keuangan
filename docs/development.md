# Development guide

## Prerequisites

- Node.js 20 or later and npm.
- A Supabase project.

## Environment

Create `.env` in the repository root. In Supabase, open **Connect** and copy the connection string that matches your use case.

```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[POOLER-HOST]:6543/postgres?sslmode=require
```

Use the **Transaction pooler** URL for serverless deployments. Use the **Direct connection** URL temporarily when running database migrations. Copy the URL exactly from Supabase; pooler hosts and usernames are project-specific. Do not commit `.env` or expose it with a `NEXT_PUBLIC_` prefix.

## Commands

```bash
npm install
npm run dev
npm run build
npm test
npm run db:generate
npm run db:migrate
```

`db:generate` creates a Drizzle migration after a schema change. `db:migrate` applies existing migrations. Back up financial data before applying a migration.

## Database

Drizzle schema definitions are in `src/db/schema.ts`; generated migrations are in `drizzle/`. The first migration preserves legacy transactions by assigning them to an `Uncategorized account`. Move them to their real account after migrating.

Migration `0003_wild_ultimo.sql` adds stock portfolios, price history, watchlists, and sinking funds. Apply it before running this version, since cash queries now include the stock ledger. Optional daily pricing uses `TWELVE_DATA_API_KEY` and `CRON_SECRET`; see [investment and planning setup](investments-and-planning.md).

## Troubleshooting

- **Cannot connect to the database:** verify that `DATABASE_URL` comes from Supabase Connect, is URL-encoded where required, and uses SSL.
- **Migration fails:** make sure `DATABASE_URL` temporarily uses Supabase Direct connection and targets the intended database.
- **Build fails:** run `npm install`, then retry `npm run build`.
- **Tests fail:** run `npm test` to identify the failed financial scenario.
