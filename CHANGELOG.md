# Changelog

This log records notable project changes. Dates use the Asia/Jakarta time zone.

## 2026-10-03

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
