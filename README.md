# Finance Tracker

Finance Tracker is a personal-finance web app for recording, understanding, and planning money in Indonesian rupiah (IDR). It keeps balances, budgets, reports, forecasts, and repayment status tied to the same transaction history.

## Features

- Accounts with opening balances, income, expenses, and transfers.
- Searchable and paginated transaction history with database-wide type, account, and date-range filters, matching totals, and edit/delete actions.
- Monthly budgets, optional rollover, reports, and month-over-month spending insights.
- Financial goals with account-linked contributions.
- Debts and receivables with partial payments and repayment history.
- Recurring transactions, payday cash-flow forecasts, and account reconciliation.
- English and Indonesian user interface localization.
- Consistent loading/error feedback, guided forms, destructive-action confirmations, responsive navigation, and a bilingual Quick guide.

## Stack

- Next.js, React 19, TypeScript, Tailwind CSS, and Radix UI.
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

| Command               | Purpose                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| `npm run dev`         | Start the development server.                                          |
| `npm run build`       | Build the production application.                                      |
| `npm run start`       | Run the production build.                                              |
| `npm test`            | Run calculation, validation, localization, and request-feedback tests. |
| `npm run db:generate` | Generate a migration after a schema change.                            |
| `npm run db:migrate`  | Apply existing Drizzle migrations.                                     |

## Data rules

- Account balance = opening balance + income - expenses - outgoing transfers + incoming transfers.
- Transfers do not change the total dashboard balance.
- Budget use includes only expenses in its selected period.
- Goal contributions are allocations; they do not reduce the source account until a cash transaction is recorded.
- Debt and receivable payments create cash transactions to keep balances and payment history consistent.

## Using the interface

Start by adding an account and its opening balance, then record your income, expenses, or transfers. Use the navigation to review budgets, goals, debts, reports, and recurring schedules. **Quick guide** in the header explains the main workflows.

The transaction filters search all matching records, not just the current page. **This month** selects the current period; **Clear filters** returns to the complete history. Reports and budgets have their own month selectors.

Choose **English** or **Bahasa Indonesia** at the bottom of the navigation. Your choice is remembered in this browser; amounts remain in IDR. Browser Back and Forward navigate between views.

See [the usability guide](docs/usability.md) for the Nielsen heuristic mapping, financial-action behavior, and remaining usability work.

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
