# Finance Tracker

Know where you stand. Plan what comes next.

Finance Tracker is a personal-finance web app for recording, understanding, and planning money in Indonesian rupiah (IDR). It connects accounts, everyday transactions, budgets, savings goals, investments, debts, and forecasts to the same financial history. A local AI assistant helps explain the records and prepare transaction drafts for review.

![Finance Tracker dashboard showing demo account balances, monthly cash flow, and daily trends](docs/images/product/dashboard.webp)

All product images show the original interface with fictional demo data. The AI responses are prepared examples, and the stock symbols and prices are fictional. The interface supports English and Indonesian; these screenshots use English.

[Product tour](#product-tour) · [Example workflow](#an-everyday-expense-to-a-complete-financial-picture) · [Run locally](#run-locally) · [Data rules](#data-rules) · [Architecture](#architecture)

## The problem

An account balance alone does not show how much is already reserved for a goal, whether spending is close to a budget limit, or how unpaid debt changes net worth. Keeping purchases, savings, stocks, and repayments in separate records also makes it harder to explain why a balance changed.

Finance Tracker brings those records together. You can trace cash changes to transactions, review budget use for a selected month, reserve money for upcoming needs, and combine assets and liabilities into a net-worth view. Planning and AI explanations use those records while keeping actual financial changes explicit.

## Who it is for

The product is designed for individuals managing personal finances in IDR, including people who track several bank or cash accounts, save toward specific goals, hold IDX stocks, or plan around recurring income and bills. English and Indonesian copy, visible calculation inputs, and a built-in Quick guide support everyday use on desktop and mobile.

## Product tour

### Dashboard and accounts

Start with cash across accounts, income and expenses for the selected month, and the share of income left after expenses. Daily cash flow, balance history, spending categories, and month-over-month comparisons help explain the figures. Accounts can represent bank balances, cash, or investment-account cash, with editable opening balances and details.

The dashboard links directly to transactions, budgets, financial health, and net worth. A transfer moves cash between accounts while preserving total cash. Stock holdings are valued separately from brokerage cash.

### Transactions

Record income, expenses, or transfers against their accounts. Search the full history, including categories and notes, and filter by type, account, group, and date range. Matching totals cover all filtered records, including records outside the current page. Groups collect transactions for an activity such as a trip while preserving each record's spending category.

Edit or delete eligible records with visible feedback. For AI-generated entries, review the amount, account, date, and category on Transactions before confirming. **Read receipt** uploads an image and prepares one expense draft from its final total.

![Transaction history showing a saved IDR 75,000 lunch expense, categories, accounts, and matching totals](docs/images/product/transactions.webp)

### Monthly budgets

Set a spending limit for each category and review the amount spent, amount remaining, and progress toward the limit. Budget use follows recorded expenses in the selected month. Edit a limit when your plan changes and enable rollover where needed.

In the demo, Food spending is IDR 1,275,000 against an updated IDR 1,800,000 limit, leaving IDR 525,000. The total budget and remaining amount update from the same records.

![Monthly budgets showing category progress, spending limits, and remaining Food budget](docs/images/product/budget.webp)

### Financial goals

Set a target amount and date, then allocate contributions from an account. Each goal shows saved money, progress, remaining amount, and time until its target date. Contribution history keeps the source account and allocation history readable.

The demo Emergency fund reaches IDR 6,500,000 of its IDR 10,000,000 target, or 65%. Contributions reserve existing cash. They do not reduce the account's cash balance until an actual cash transaction is recorded.

![Financial goals showing Emergency fund and Travel fund progress with account-linked contributions](docs/images/product/goals.webp)

### Investments

Track IDX stock purchases and sales, brokerage cash, fees, cost basis, and realized or unrealized gains. Portfolio, Watchlist, and Trade history tabs separate current holdings from instruments you follow and the transactions that created those holdings. Correcting a trade recalculates holdings and cash. Invalid share or cash histories are rejected.

Fractional lots and shares are supported. Per-share prices and average cost use four decimal places, while cash accounting uses cent precision. Daily closes include their quote date and source. In the demo, fictional holdings worth IDR 6,900,000 have an IDR 6,300,000 cost basis and an IDR 600,000 unrealized gain.

![Investment portfolio showing fictional demo holdings, brokerage cash, valuations, and gains](docs/images/product/investments.webp)

### AI assistant and receipt drafts

Ask questions about recorded balances, spending, budgets, goals, debts, or financial health. The assistant can read permitted financial context and prepare editable transaction drafts. Conversations and pending drafts are saved, so you can return to them after reloading.

Chat and receipt extraction use Ollama through LangChain and LangGraph. Receipt images are stored in a private Supabase bucket. Unknown receipt amounts, dates, or accounts remain blank for review. Model tools cannot write financial transactions. Only the explicit **Confirm transaction** action on Transactions records an approved draft.

![AI assistant conversation with a demo question about the remaining Food budget and its example response](docs/images/product/ai-assistant.webp)

### Contextual AI insights

Financial pages generate a short explanation when their data is ready. Insights follow the selected month, active filters, language, and valid analysis inputs. **Reanalyse** requests another analysis, while **Discuss with AI** opens its saved conversation.

A separate worker calculates aggregates under the signed-in user's ownership policies and sends the model aggregate figures and recognized category labels. Page insights do not send account names, transaction descriptions, counterparties, or stock symbols. They explain the records without changing them, and the page remains usable while analysis is waiting or unavailable.

![Dashboard AI insights explaining updated income, spending, cash, and remaining budget using demo data](docs/images/product/ai-insights.webp)

### Net worth

Combine cash, priced stocks, outstanding receivables, and unpaid debt. The breakdown distinguishes allocated from unallocated cash and keeps account balances visible. Savings allocations remain part of cash assets, preventing goals and sinking funds from being counted twice.

The demo totals IDR 19,275,000 from IDR 13,375,000 cash, IDR 6,900,000 stocks, IDR 500,000 receivables, and IDR 1,500,000 debt. Missing stock prices produce an incomplete total with a labeled known subtotal.

![Net-worth view showing cash accounts, stock valuations, receivables, debt, and allocated cash](docs/images/product/net-worth.webp)

### Planning, repayments, and financial health

| Capability | What you can do |
| --- | --- |
| Debts and receivables | Record partial repayments, inspect payment history, and keep the linked cash transactions consistent with outstanding amounts. |
| Recurring schedules and reconciliation | Plan income, expenses, and transfers with optional end dates, record due entries manually, project payday balances, and reconcile accounts. |
| Financial calendar | Review recurring cash-flow dates, debt deadlines, and sinking-fund targets in one monthly calendar. |
| Sinking funds | Reserve account cash for expected expenses, review allocation/release history, calculate suggested monthly savings, and record a linked expense when the money is spent. |
| Expense calculator | Explore dated planned incomes and expenses alongside recorded cash and recurring cash flow, without posting transactions. |
| Reports | Review monthly cash flow, category distributions, and spending changes using the selected reporting period. |
| Financial health | Review calculated ratios, formulas, transaction behavior, missing inputs, and a heuristic score. Current-month results are provisional; analysis inputs do not change financial records. |

## An everyday expense to a complete financial picture

The screenshots follow one connected demo. Opening cash is IDR 13,450,000, with IDR 8,000,000 income and IDR 3,200,000 expenses for the month.

1. Save an IDR 75,000 lunch expense to Main account. Cash becomes IDR 13,375,000 and monthly expenses become IDR 3,275,000.
2. Update the Food limit to IDR 1,800,000. Its recorded IDR 1,275,000 spending leaves IDR 525,000 available in that budget.
3. Allocate IDR 500,000 to Emergency fund. Its progress reaches 65%. Total reserved cash becomes IDR 8,250,000 while total cash stays IDR 13,375,000.
4. Ask the AI assistant about the Food budget and review contextual insights against the updated records.
5. Review net worth. Cash plus IDR 6,900,000 stocks and IDR 500,000 receivables, less IDR 1,500,000 debt, totals IDR 19,275,000.

## What connects the product

Financial views share the same records. Transactions feed balances, budgets, and reports. Stock trades feed holdings and brokerage cash, and repayments update outstanding debt and their linked cash entries. Goals and sinking funds reserve cash, and forecasts show proposed changes without recording them.

Authentication uses Supabase email/password signup, email confirmation, cookie sessions, and sign in/out. Financial APIs verify the user, and PostgreSQL ownership policies restrict each user's records. Guided forms, visible loading/error feedback, protected histories, and explicit delete confirmations make the consequence of an action clear.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS, and Radix UI.
- PostgreSQL on Supabase, Drizzle ORM, and Drizzle Kit.
- Recharts and Vitest 5.
- Ollama, LangChain, and LangGraph for chat, receipt drafts, and AI explanations.
- BullMQ and a separate persistent Redis queue for automatic page insights, plus optional Redis caching for financial API reads.

## Run locally

1. Install Node.js 22.12+ (22.x) or Node.js 24.x and create a Supabase project. These versions support both the application and its Vitest 5 tests.
2. Install dependencies:

   ```bash
   npm ci
   ```

3. Create `.env` and copy the **Transaction pooler** URL from Supabase Connect:

   ```env
   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[POOLER-HOST]:6543/postgres?sslmode=verify-full
   DATABASE_CA_CERT="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
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

Open [http://localhost:3000](http://localhost:3000). Configure Supabase email confirmation and redirect URLs using the [authentication setup guide](docs/authentication.md), then create an account and sign in. Existing financial data must be explicitly assigned to its confirmed owner after applying migrations `0006_auth_ownership` and `0007_auth_policies`.

Apply all existing migrations, including the AI tables and ownership policies through migration 0013. Earlier migrations `0003_wild_ultimo.sql`, `0004_clumsy_jane_foster.sql`, and `0005_concerned_ego.sql` add investment/sinking-fund tables, decimal stock quantities/prices, and four-decimal trade prices. Generating migrations does not apply them to Supabase.

If application tables already exist but migration history is empty, normal migration stops without replaying old SQL. Follow the [database migration and recovery guide](docs/database-migrations.md) to back up and adopt the verified legacy schema. The runner reports pending migrations and verifies the resulting schema instead of treating a silent exit as success.

### AI assistant and automatic insights

Chat and receipt extraction require a reachable Ollama model. Add the server-only configuration to the ignored `.env` file and follow the [AI assistant setup guide](docs/ai-assistant.md), including the private receipt bucket and its ownership policies.

```env
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=qwen3.5:9b
INSIGHTS_REDIS_URL=redis://127.0.0.1:6380
```

Automatic page insights also require the queue and a separate worker. With Docker running, start them in addition to the web app.

```bash
docker compose up -d insights-redis
npm run worker:insights
```

Keep the worker running in a separate terminal or supervised process with the same database, queue, and model configuration as the app. See [worker setup and deployment](docs/development.md#automatic-ai-insight-worker) for the queue lifecycle and hosting requirements. Chat and receipt extraction do not require this insight worker. This implementation uses Ollama's OpenAI-compatible interface without an OpenAI account or API key.

The optional financial-read cache uses a separate `REDIS_URL` and Redis service. See [cache setup](docs/development.md#local-redis-cache). The evicting cache must not be reused as the insight queue.

### Optional daily stock prices

Daily prices use Yahoo Finance through `yahoo-finance2` on the server. Tickers such as `BNBR` map to `BNBR.JK`; `TWELVE_DATA_API_KEY` is no longer used. Install the updated dependencies and restart the app. No database migration is needed for this provider switch.

Only the scheduled job needs a server-only secret in `.env` and your deployment environment:

```env
CRON_SECRET=your_generated_long_random_secret
```

Quotes are completed daily closes, not live prices. Opening Investments requests an update; `vercel.json` also schedules a protected update at 13:30 UTC daily (20:30 Asia/Jakarta) on Vercel. Other hosts need their own scheduler. Yahoo access can be delayed, throttled, blocked, or changed without notice; review Yahoo's data-use terms before deployment or redistribution. Failed updates preserve saved quotes and display a market-data error rather than a misleading database warning.

See [investment and planning setup](docs/investments-and-planning.md) for provider coverage, scheduling, migration steps, and limitations.

## Commands

| Command               | Purpose                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| `npm run dev`         | Start the development server.                                          |
| `npm run build`       | Build the production application.                                      |
| `npm run start`       | Run the production build.                                              |
| `npm run lint`        | Run the configured ESLint checks.                                      |
| `npx tsc --noEmit`    | Check TypeScript without emitting application files.                   |
| `npm test`            | Run calculation, validation, localization, and request-feedback tests. |
| `npm run worker:insights` | Run the automatic AI insight queue worker. |
| `npm run db:generate` | Generate a migration after a schema change.                            |
| `npm run db:migrate`  | Apply existing Drizzle migrations.                                     |
| `npm run db:migrate -- --check` | Check schema readiness and latest migration history without writes. |
| `npm run db:check` | Run the read-only database schema and RLS readiness check. |
| `npm run db:assign-owner -- --email=owner@example.com` | Preview assignment of legacy unowned rows to a confirmed user. |

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

For stocks, create an account of type **Investment**, fund it with cash, and record actual buys/sells in **Investments**. **Net worth** combines cash and current stock valuations. **Expense calculator** pulls current recorded cash, projects recurring calendar income/expenses, and includes several dated planned incomes/expenses without recording them; **Financial calendar** shows planned dates; **Sinking funds** reserves money for expected expenses.

Use **Edit** and **Delete** on individual financial records. In Investments, **Manage trades** opens **Trade history**, where you can correct the ticker, account, side, quantity, price, fees, date, or note. Saving recalculates cash, holdings, and gains; invalid share/cash histories are rejected. Watchlist editing changes the company name and note, not the ticker.

Goals and debts offer **Contribution history** and **Payment history**. Those histories and their linked cash transactions are protected from independent edits/deletion. Targets/totals cannot fall below recorded progress. Accounts linked to financial records cannot be deleted. Sinking-fund history is also protected. Deletion of an eligible record is permanent; there is no undo. Derived views such as net worth, reports, forecasts, and calendar events are managed through their source records rather than edited directly.

Background refreshes keep the last loaded records and in-progress forms visible while displaying update status; failed refreshes show an error and retry control. Four-decimal trade prices require migration 0005; back up and migrate the database before recording them.

The transaction filters search all matching records, not just the current page. **This month** selects the current period; **Clear filters** returns to the complete history. Reports and budgets have their own month selectors.

Choose **English** or **Bahasa Indonesia** at the bottom of the navigation. Your choice is remembered in this browser; amounts remain in IDR. Browser Back and Forward navigate between views.

See [the usability guide](docs/usability.md) for the Nielsen heuristic mapping, financial-action behavior, and remaining usability work.

## Architecture

The browser uses Next.js pages and authenticated API routes. Server-side financial queries and validation use Drizzle/PostgreSQL, while Supabase supplies authentication and private receipt storage. PostgreSQL remains the source of truth. An optional Redis cache accelerates successful financial reads with user-separated revision keys.

Chat and receipt requests reach Ollama through LangChain/LangGraph. Automatic page insights run through BullMQ and a long-running worker using a separate Redis queue. The worker reads user-scoped aggregates, releases the database during inference, and saves the explanation. Daily stock prices enter through the server-side Yahoo Finance integration.

| Layer | Responsibility |
| --- | --- |
| Next.js / React | Public landing and auth pages, private dashboard, forms, charts, navigation, and localization. |
| Next.js APIs | Identity verification, input validation, financial calculations, and explicit write operations. |
| PostgreSQL / Drizzle | Financial records, ownership policies, protected histories, AI conversations, and drafts. |
| Supabase Auth / Storage | Email confirmation and cookie sessions, plus private receipt images. |
| Ollama / LangChain / LangGraph | Tool-selected chat context, receipt extraction, draft decisions, and financial explanations. |
| Redis / BullMQ worker | Optional financial-read cache and a separate persistent queue for automatic insights. |

### Project structure

```text
src/app/          Next.js pages and API routes
src/components/   User interface components
src/db/           Drizzle database connection and schema
src/lib/          Financial calculations, validation, and shared types
src/lib/ai/       Model access, tools, drafts, and queued insight contracts
src/lib/server/   User-scoped financial queries
drizzle/          Database migrations
scripts/          Migration runner, schema checks, and insight worker
tests/            Unit, component, API, and optional integration tests
docs/             Focused setup and development documentation
docs/images/      Product screenshots used in this README
```

## Current scope and limitations

- Records are entered manually, through reviewed AI drafts, or through guarded recurring recording. Bank synchronization and automatic transaction imports are outside the current product.
- Market values use completed daily closes, not live trading quotes. Provider failures and missing prices are visible. A known net-worth subtotal can be incomplete.
- AI explanations and receipt extraction can be incorrect. Review the records and draft fields. Financial calculations and explicit confirmation remain application responsibilities.
- Financial health uses a heuristic score and visible formulas. Missing data can leave components unavailable, and the current month remains provisional.
- Deployment requires configured Supabase authentication and ownership policies. AI also needs connectivity to Ollama, and automatic insights need a persistent worker host.
- Review and back up financial data before running a migration.
- Local Brag video outputs, isolated preview apps, and render caches are ignored by Git. The product screenshots in `docs/images/product/` remain tracked so this README displays correctly on GitHub.
- See [the development guide](docs/development.md), [the changelog](CHANGELOG.md), and [the task list](todo.md).
