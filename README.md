# Finance Tracker

Finance Tracker is a personal-finance web app for recording, understanding, and planning money in Indonesian rupiah (IDR). It keeps balances, budgets, reports, forecasts, and repayment status tied to the same transaction history.

## Features

- Accounts with opening balances, income, expenses, and transfers.
- Searchable and paginated transaction history with edit and delete actions.
- Monthly budgets, optional rollover, reports, and month-over-month spending insights.
- Financial goals with account-linked contributions.
- Debts and receivables with partial payments and repayment history.
- Recurring transactions, payday cash-flow forecasts, and account reconciliation.
- English and Indonesian user interface localization.

## Stack

- Next.js 15, React 19, TypeScript, Tailwind CSS, and Radix UI.
- PostgreSQL on Supabase, Drizzle ORM, and Drizzle Kit.
- Recharts and Vitest.

## Run locally

1. Install Node.js 20 or later and create a Supabase project.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` and copy the **Transaction pooler** URL from Supabase Connect:

   ```env
   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[POOLER-HOST]:6543/postgres?sslmode=require
   ```

4. Back up your database. Temporarily set `DATABASE_URL` to Supabase **Direct connection**, then run:

   ```bash
   npm run db:migrate
   ```

5. Restore the Transaction pooler URL and start the app:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Build the production application. |
| `npm run start` | Run the production build. |
| `npm test` | Run financial calculation tests. |
| `npm run db:generate` | Generate a migration after a schema change. |
| `npm run db:migrate` | Apply existing Drizzle migrations. |

## Data rules

- Account balance = opening balance + income - expenses - outgoing transfers + incoming transfers.
- Transfers do not change the total dashboard balance.
- Budget use includes only expenses in its selected period.
- Goal contributions are allocations; they do not reduce the source account until a cash transaction is recorded.
- Debt and receivable payments create cash transactions to keep balances and payment history consistent.

## Project structure

```text
src/app/          Next.js pages and API routes
src/components/   User interface components
src/db/           Drizzle database connection and schema
src/lib/          Financial calculations, validation, and shared types
drizzle/          Database migrations
docs/             Development documentation
```

## Notes

- The app currently has no authentication or per-user data isolation. Do not make it public before those controls exist.
- Review and back up financial data before running a migration.
- See [the development guide](docs/development.md), [the changelog](CHANGELOG.md), and [the task list](todo.md).
