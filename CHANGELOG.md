# Changelog

This log records notable project changes. Dates use the Asia/Jakarta time zone.

## 2026-10-03

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
