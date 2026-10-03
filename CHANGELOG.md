# Changelog

This log records notable project changes. Dates use the Asia/Jakarta time zone.

## 2026-10-03

### Four-decimal per-share prices

- Enabled up to four decimal places in stock buy/sell price inputs and API validation, with a minimum price of 0.0001 IDR and rejection of excess precision.
- Added migration `0005_concerned_ego.sql` to widen trade prices to `numeric(16, 4)` without rewriting trade history or reducing integer capacity.
- Displayed recorded prices, average cost, market prices, and watchlist prices with exactly four localized decimal places. Cash totals retain two-decimal precision; trade gross calculations multiply full-precision quantities and prices before rounding.
- Updated bilingual field guidance and migration documentation, and added calculation, formatting, validation, and migration-regression tests.
- With user approval, created and archive-validated a new private Supabase backup and applied migration 0005 through the Session pooler with certificate/hostname verification. All 15 application tables retained their row counts and financial values; the previous five migration records were unchanged.

Verification: 176 automated tests, TypeScript checking, and the production build passed. An isolated PostgreSQL-compatible check applied all six migrations, verified unchanged legacy values across 15 tables, and exercised actual buy/edit/sale handlers, four-decimal storage, invalid-input rollback, and cash accounting. Mocked browser checks passed in English and Indonesian for price formatting, trailing zeros, edit prefills, input precision, failed-save recovery, and mobile dialog bounds. Supabase readiness checks passed with all 15 tables and six recorded migrations; real investment, account-summary, dashboard, and net-worth GET endpoints returned HTTP 200. No sample trades were written to the live database. The backup archive was listed successfully; a full restore rehearsal was not performed.

### Dependency and TypeScript updates

- Committed the existing upgrades to Next.js 16.3.8, Drizzle ORM 0.45.3, Drizzle Kit 0.31.11, and Vitest 5.0.3, with their matching npm lockfile.
- Committed the existing Next.js TypeScript configuration updates: `react-jsx` and generated development types in the include paths.
- Updated setup documentation for Node.js 22.12+ (22.x) or 24.x, reflecting Vitest 5's runtime requirements, and documented lockfile-based installation.

Verification: the lockfile's root dependencies matched `package.json`; 157 automated tests, TypeScript checking, and the production build passed on Node.js 22.17.1. No application behavior, database schema, or financial records were changed by this dependency commit.

### Record CRUD and repository-wide usability review

- Completed stock-trade editing and watchlist metadata editing. Added visible Edit/Delete controls, a portfolio-to-history management shortcut, per-share prices, record-specific confirmations, and previous/new/projected cash previews.
- Added account, budget, goal, debt/receivable, and recurring-schedule edit/delete controls. Account editing uses the real opening balance; changing metadata never overwrites current calculated cash or invents progress/payments.
- Added contribution/payment history dialogs, strict metadata validation, PostgreSQL integer limits, duplicate-record feedback, and guards against deleting linked history or lowering recorded totals. Preserved legacy settled debt semantics without fabricating payment history.
- Validated edited trades across both affected accounts, chronological holdings/cash, and current allocations. Consolidated trade cash/history validation; invalid changes roll back without leaving orphan instruments.
- Made recurring execution atomic with date bounds and same-day duplicate protection; exposed optional end dates and transfers in recurring forms.
- Kept editing drafts mounted during background data refreshes and retained loaded records on refresh failure, with visible status/errors. Extended bilingual management guidance and permanent-deletion explanations.
- Reviewed all twelve views against Nielsen's ten heuristics and documented implemented behavior, intentionally read-only summaries/histories, and remaining gaps in `docs/usability.md`. No new migration or live financial-data mutation was needed.

Verification: 157 automated tests, TypeScript checking, and a production build passed. Isolated PostgreSQL-compatible API checks covered nine CRUD/protection scenario groups plus existing investment/planning regression flows. Mocked browser checks covered all twelve views in both languages at 1440/768/375 px and CRUD/recovery/history workflows; 86 targeted axe view/dialog scans reported no violations after animations settled, with no uncaught browser errors. These are targeted checks, not complete usability or accessibility certification. Existing package/lockfile/TypeScript configuration changes were left untouched.

### Decimal stock quantities and prices

- Removed the whole-lot restriction from stock forms, API validation, and database constraints. Lots support six decimal places, shares four, and prices two; existing integer inputs remain valid.
- Added migration `0004_clumsy_jane_foster.sql` with fixed-precision numeric trade columns and numeric precision/scale verification in the migration runner.
- Localized fractional quantities, added English/Indonesian precision hints, and explicitly enabled currency fractions so browsers do not round average cost to whole IDR. Invalid or incomplete forms no longer enter decimal arithmetic or enable submission.
- Rounded stock gross values and proportional sale cost allocations half-up to 0.01 IDR, replacing whole-rupiah partial-sale rounding. Used scaled integers for quantities and cent sums for stock cash, portfolio totals, and cash-history validation; final sales leave no quantity/cost residue.
- Created and archive-validated a private pre-migration backup, applied migration 0004 to Supabase, and verified unchanged values and row counts across all 15 application tables. No sample stock trades were written to the live database.

Verification: 125 automated tests, TypeScript checking, and a production build passed. Isolated PostgreSQL checks covered all five migrations, preservation of legacy trades, numeric schema checks, decimal API round trips, full-position sales, oversell rollback, excess-precision rejection, and 100 one-cent buys ending at exactly zero cash. Mocked browser checks covered English/Indonesian quantity and average-cost formatting, decimal form steps, excess-precision prevention, failed-submission input retention, and 375 px dialog bounds. Real investment, account-summary, dashboard, and net-worth GET endpoints returned HTTP 200; Supabase readiness checks passed with all 15 tables and five migrations.

### Database migration recovery (17:55 Asia/Jakarta)

- Replaced the migration CLI wrapper with a plain Node.js runner using the official Drizzle migrator, explicit progress/success reporting, and post-migration schema verification.
- Added a read-only `npm run db:migrate -- --check` command and guarded adoption of the verified nine-table legacy schema when migration history is empty. Normal migration refuses to replay initial SQL over existing application tables.
- Required a custom-format backup for explicit legacy adoption, locked affected tables/history during verification, and recorded exact migration hashes/timestamps without replaying legacy SQL. Baseline adoption and pending migration application are separate transactions.
- Added schema-verification tests and recovery documentation covering connection methods, PostgreSQL backup-tool versions, verified TLS, and safe retry behavior. Ignored local backup archives in Git.
- With the user's approval, created and archive-validated a private backup, adopted migrations 0000–0002, and applied migration 0003 to Supabase. All 15 application tables and four migration records passed verification; row counts, data digests, and serial sequence values were unchanged across all nine legacy tables.

Verification: 107 automated tests, TypeScript checking, and a production build passed. Isolated PostgreSQL checks covered fresh migration, no-op reruns, successful legacy adoption, repeat-adoption rejection, and mismatched-schema rollback. Normal migration and read-only checks passed on Supabase. Seven real application GET endpoints returned HTTP 200, including dashboard, accounts, investments, net worth, sinking funds, and calendar. Backup tooling used the official Supabase CA with certificate and hostname verification; archive listing was checked, but a full restore rehearsal was not performed.

### Investments and planning expansion

- Added IDX stock portfolios, buy/sell records, brokerage cash accounts, whole-lot quantities, fees, weighted-average cost, realized/unrealized gains, and watchlists.
- Added validated Twelve Data daily-close retrieval, visible quote dates, 15-minute caching, partial-error/pending feedback, and a secret-protected daily Vercel price job. Missing prices remain visibly incomplete; no fabricated market values are used.
- Added net worth combining cash, valued stocks, receivables, and debts without counting goal/fund allocations twice.
- Added read-only monthly-payment simulations, input/data-change invalidation, and monthly comparison results.
- Added a month-selectable financial calendar for unrecorded recurring occurrences, debt/receivable deadlines, and sinking-fund targets.
- Added account-linked sinking funds with allocation/release/spending history, suggested monthly savings, and atomic linked expense recording. Allocations do not move cash; spending reduces cash exactly once.
- Integrated stock cash flows into account summaries, dashboard cash history, forecasts, and reconciliation. Stock trading does not inflate ordinary income/expense or budget totals.
- Expanded weekly/monthly forecast occurrences, respecting start/end dates and already-recorded payments.
- Added six database tables and migration `0003_wild_ultimo.sql`, strict API input validation, conflict/rollback safeguards, and protection for linked fund expenses.
- Added English/Indonesian feature copy and contextual Quick guide topics. Fixed narrow/tablet action wrapping and made scrollable investment/projection tables keyboard-focusable.
- Updated setup, data semantics, limitations, progress documentation, and provider/scheduler requirements.

Verification: 95 automated tests across ten files, TypeScript checking, migration/schema generation consistency, and a production build passed. An isolated PostgreSQL check applied all four migrations and exercised the actual financial API handlers, including invalid-trade rollback, cash/valuation consistency, fund spending, simulation non-mutation, price upserts/caching, quota-failure preservation, and the cron guard. Mocked browser checks covered all five new views at 1440, 768, and 375 px, trade-input recovery, cancellation, simulation invalidation, calendar navigation, mobile dialog bounds, and both languages. Targeted axe scans reported no WCAG A/AA violations on those view/width combinations; no uncaught browser errors were observed.

No migration was applied to the user's Supabase database, no real financial records were changed in verification, and no live market-data account was configured. Live quote retrieval and deployment scheduling require the user's environment setup. Work was committed locally on `feat/investments-planning`; no Git remote is configured for pushing.

### Added

- Bilingual Quick guide, persistent field labels and hints, shared loading/error/empty states, retry controls, and success notifications.
- Database-wide transaction search, inclusive date/type/account filters, matching totals, translated category matching, and filter-validation tests.
- Record-specific deletion confirmations and confirmation before recording a recurring payment.
- Client-request feedback tests, bilingual message checks, and English spending-insight coverage.
- A usability guide mapping the implementation to Nielsen's ten heuristics and documenting remaining work.

### Changed

- Reshaped the dashboard and finance views around clearer financial hierarchy, consistent forms, explicit primary actions, and a restrained teal/slate visual system.
- Made mobile navigation a focus-managed dialog, added a skip-to-content link and keyboard focus styles, and enabled Back/Forward navigation between views.
- Form failures preserve input and show localized recovery guidance; duplicate submission is disabled while saving.
- Goal contributions now accept an explicit amount and source account with suggested amounts and a remaining-target limit.
- Reconciliation explains that comparisons do not adjust balances; forecasts distinguish estimates from recorded transactions.
- Fixed persisted-language initialization and localized built-in categories and spending insights without changing stored financial data.

### Verification

- TypeScript checking, 25 automated tests, and a production build passed during this iteration.
- Mocked browser checks covered all seven views and desktop/mobile behavior; targeted axe checks on the desktop dashboard and mobile transaction view reported no WCAG A/AA violations. See the usability guide for the verification scope and remaining work.

### Fixed

- Aligned the sidebar brand divider with the main header by giving both areas the same 64 px height.
- Verified equal divider positions at 768 px and 1440 px in both languages, the 375 px mobile drawer, and TypeScript checking.

## 2026-10-02

### Added

- Recurring income and expense schedules, cash-flow forecasting, budget rollover, selectable reporting periods, and spending insights.
- Account-linked goal contributions, partial debt and receivable payments, account reconciliation, transaction pagination, and automated financial calculation tests.
- English and Indonesian application localization with a persistent language selector.

### Changed

- Balances and budgets are calculated from transaction history and opening balances.
- The database connector now uses the standard PostgreSQL driver with Supabase.
- The README and development guide cover the product, local setup, migrations, and Supabase configuration.
