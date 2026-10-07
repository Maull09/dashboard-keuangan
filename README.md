# Finance Tracker

Finance Tracker is a personal-finance web app for recording, understanding, and planning money in Indonesian rupiah (IDR). It keeps balances, budgets, reports, forecasts, and repayment status tied to the same transaction history.

## Features

- Accounts with editable opening balances and details, income, expenses, transfers, and guarded deletion.
- Searchable and paginated transaction history with database-wide type, account, and date-range filters, matching totals, and edit/delete actions.
- Monthly budgets, optional rollover, reports, and month-over-month spending insights.
- Editable monthly budgets, goals, debts/receivables, and recurring schedules, with explicit delete confirmations.
- Financial goals with account-linked contributions and a readable contribution history.
- Debts and receivables with partial payments and a readable repayment history.
- Recurring transactions with optional end dates, transfers, guarded manual recording, payday forecasts, and account reconciliation.
- IDX stock portfolios with editable buy/sell records, fees, weighted-average cost, realized/unrealized gains, and an editable watchlist.
- Decimal stock quantities and purchase/sale prices: fractional lots and shares are supported, with four-decimal per-share prices and average cost, and cent-precision cash accounting.
- Daily stock closes from Yahoo Finance, with manual refresh and a protected scheduled job.
- Net worth combining cash, stock valuations, receivables, and unpaid debts without counting allocations twice.
- Read-only simulations comparing scheduled cash flow with an extra monthly installment.
- A monthly financial calendar for recurring income/payments, debt deadlines, and sinking-fund targets.
- Account-linked sinking funds with allocation/release history, suggested monthly savings, and linked expense recording.
- English and Indonesian user interface localization.
- Consistent loading/error feedback, guided forms, destructive-action confirmations, responsive navigation, and a bilingual Quick guide.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS, and Radix UI.
- PostgreSQL on Supabase, Drizzle ORM, and Drizzle Kit.
- Recharts and Vitest 5.

## Run locally

1. Install Node.js 22.12+ (22.x) or Node.js 24.x and create a Supabase project. These versions support both the application and its Vitest 5 tests.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` and copy the **Transaction pooler** URL from Supabase Connect:

   ```env
   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[POOLER-HOST]:6543/postgres?sslmode=require
   ```

4. Back up any existing database. Temporarily use Supabase **Direct connection** or the **Session pooler** (port 5432, useful on IPv4-only networks), then run:

   ```bash
   npm run db:migrate
   npm run db:migrate -- --check
   ```

5. Restore the Transaction pooler URL and start the app:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

Existing installations also need migrations `0003_wild_ultimo.sql` through `0006_lonely_shockwave.sql` before starting this version. They add investment/sinking-fund tables, decimal stock quantities/prices, and the Yahoo Finance price-source default; generating migrations does not apply them to Supabase.

If application tables already exist but migration history is empty, normal migration stops without replaying old SQL. Follow the [database migration and recovery guide](docs/database-migrations.md) to back up and adopt the verified legacy schema. The runner reports pending migrations and verifies the resulting schema instead of treating a silent exit as success.

### Optional scheduled daily prices

Add these server-only variables to `.env` and your deployment environment, then restart the app:

```env
CRON_SECRET=your_generated_long_random_secret
```

Yahoo Finance pricing needs no API key. Quotes are daily values, not live prices, and availability is not guaranteed. Opening Investments requests an update; `vercel.json` also schedules a protected update at 13:30 UTC daily (20:30 Asia/Jakarta) on Vercel. Other hosts need their own scheduler.

See [investment and planning setup](docs/investments-and-planning.md) for provider coverage, scheduling, migration steps, and limitations.

## Commands

| Command               | Purpose                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| `npm run dev`         | Start the development server.                                          |
| `npm run build`       | Build the production application.                                      |
| `npm run start`       | Run the production build.                                              |
| `npm test`            | Run calculation, validation, localization, and request-feedback tests. |
| `npm run db:generate` | Generate a migration after a schema change.                            |
| `npm run db:migrate`  | Apply existing Drizzle migrations.                                     |
| `npm run db:migrate -- --check` | Check schema readiness and latest migration history without writes. |

## Data rules

- Cash balance = opening cash + income - expenses - outgoing transfers + incoming transfers - stock purchases and fees + net stock-sale proceeds.
- Transfers do not change the total dashboard balance.
- Budget use includes only expenses in its selected period.
- Goal contributions are allocations; they do not reduce the source account until a cash transaction is recorded.
- Debt and receivable payments create cash transactions to keep balances and payment history consistent.
- Stock trades change cash and holdings, not consumption budgets or ordinary income/expense totals. Buy fees enter the cost basis; sale fees reduce proceeds.
- An investment account's opening balance is brokerage cash, not the value of owned stocks.
- Net worth = cash + priced stocks + outstanding receivables - outstanding debts. Missing stock prices make the total incomplete, with a separately labeled known subtotal.
- Sinking-fund allocations reserve existing cash; spending posts one actual expense. Simulations and calendar reminders do not post transactions.

## Using the interface

Start by adding an account and its opening balance, then record your income, expenses, or transfers. Use the navigation to review budgets, goals, debts, reports, and recurring schedules. **Quick guide** in the header explains the main workflows.

For stocks, create an account of type **Investment**, fund it with cash, and record actual buys/sells in **Investments**. **Net worth** combines cash and current stock valuations. **Simulation** lets you preview an extra monthly payment; **Financial calendar** shows planned dates; **Sinking funds** reserves money for expected expenses.

Use **Edit** and **Delete** on individual financial records. In Investments, **Manage trades** opens **Trade history**, where you can correct the ticker, account, side, quantity, price, fees, date, or note. Saving recalculates cash, holdings, and gains; invalid share/cash histories are rejected. Watchlist editing changes the company name and note, not the ticker.

Goals and debts offer **Contribution history** and **Payment history**. Those histories and their linked cash transactions are protected from independent edits/deletion. Targets/totals cannot fall below recorded progress. Accounts linked to financial records cannot be deleted. Sinking-fund history is also protected. Deletion of an eligible record is permanent; there is no undo. Derived views such as net worth, reports, forecasts, and calendar events are managed through their source records rather than edited directly.

Background refreshes keep the last loaded records and in-progress forms visible while displaying update status; failed refreshes show an error and retry control. Four-decimal trade prices require migration 0005; back up and migrate the database before recording them.

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
scripts/          Verified migration runner and schema checks
docs/             Development documentation
```

## Notes

- The app currently has no authentication or per-user data isolation. Do not make it public before those controls exist.
- Review and back up financial data before running a migration.
- See [the development guide](docs/development.md), [the changelog](CHANGELOG.md), and [the task list](todo.md).
