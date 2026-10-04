# To do

## Completed

- [x] Install the `design-principle` and Taste Skill (`design-taste-frontend`) into the Codex skill set and define their Finance Tracker usage in `AGENTS.md`.
- [x] Replace Twelve Data with server-side Yahoo Finance daily IDX closes without a market-data API key, preserving trade history and saved prices on failure.
- [x] Validate .JK/IDR/Jakarta quote metadata, exclude unfinished daily bars, show price sources, and distinguish provider errors from database errors in both languages.
- [x] Verify direct Yahoo BNBR/BBCA reads, real BNBR quote refresh with unchanged financial ledger, automated provider/refresh tests, and mocked bilingual desktop/mobile recovery flows.
- [x] Support four-decimal per-share trade prices in forms, validation, calculations, and localized investment displays while keeping cash totals at cent precision.
- [x] Generate migration 0005 and verify legacy-value preservation, four-decimal API persistence, bilingual browser behavior, and automated regression tests without live database changes.
- [x] Back up Supabase and apply migration 0005 for four-decimal trade prices with user approval, verifying schema readiness and unchanged financial values.

- [x] Publish the private GitHub repository and push the verified dependency, lockfile, and TypeScript updates.
- [x] Update Node.js development/test prerequisites for the checked-in Next.js 16 and Vitest 5 versions.

- [x] Complete investment trade and watchlist CRUD with discoverable Edit/Delete actions and cash-impact previews.
- [x] Add account, budget, goal, debt/receivable, and recurring-schedule edit/delete UI with bilingual feedback.
- [x] Protect linked contribution/payment history, recorded totals, brokerage cash/holdings, and allocated cash during edits.
- [x] Display contribution/payment history and reject repeated or inactive recurring execution atomically.
- [x] Preserve form drafts through successful/failed background data refreshes and expose refresh status.
- [x] Review all twelve views against Nielsen's ten heuristics and document source-record versus derived-view management.
- [x] Verify CRUD/rollback flows in isolated PostgreSQL-compatible fixtures and bilingual desktop/tablet/mobile interaction/accessibility checks without live data mutations.

- [x] Support fractional stock lots/shares and decimal trade prices, with strict precision validation and localized formatting.
- [x] Keep stock cash totals, full-position sales, and partial-sale cost allocations stable with scaled integer/cent arithmetic.
- [x] Back up Supabase and apply migration 0004, verifying unchanged financial row counts and values.
- [x] Align the database schema and baseline migrations.
- [x] Calculate balances and budgets from transactions.
- [x] Add server-side validation for financial records.
- [x] Add pagination, recurring transactions, forecasting, budget rollover, reconciliation, and financial planning workflows.
- [x] Move the database connector from Neon to Supabase.
- [x] Document the project, development workflow, and Supabase setup.
- [x] Add English and Indonesian application localization.
- [x] Apply Nielsen's ten heuristics to primary financial workflows and document their mapping.
- [x] Add persistent field labels, recovery guidance, saving/loading feedback, and success notifications.
- [x] Move transaction filtering and matching totals to database queries across all pages.
- [x] Add confirmations for transaction/schedule deletion and recurring-payment recording.
- [x] Improve mobile navigation, keyboard focus, language persistence, and financial visual hierarchy.
- [x] Test filter validation, client-request feedback, bilingual messages, and localized insights.
- [x] Align the sidebar and main header divider heights.
- [x] Add IDX stock portfolios, buy/sell history, fee-aware weighted-average cost, and realized/unrealized gains.
- [x] Add watchlists, validated daily-close updates, partial-failure feedback, and a protected scheduled price job.
- [x] Integrate stock cash flows into balances, cash history, forecasting, and reconciliation without treating buys/sales as consumption.
- [x] Add net worth without double-counting allocations and mark missing stock valuations as incomplete.
- [x] Add read-only monthly-payment simulations with comparison invalidation after data/input changes.
- [x] Add a financial calendar combining recurring schedules, debt/receivable deadlines, and fund targets.
- [x] Add account-linked sinking funds, allocation/release history, suggested savings, and atomic linked expense recording.
- [x] Expand forecast schedule occurrences through payday and exclude already-recorded payments.
- [x] Add investment/planning calculation, strict input, provider-payload, and bilingual message tests.
- [x] Verify migrations and financial API workflows in an isolated PostgreSQL database without changing Supabase data.
- [x] Add explicit migration progress, read-only schema readiness checks, and guarded legacy adoption with a backup prerequisite.
- [x] Test schema verification and isolated migration recovery, rejection, rollback, and rerun behavior.
- [x] Create a Supabase project and configure `DATABASE_URL`.
- [x] Back up the existing database, adopt verified legacy migration history, and apply the investment/planning migration with user approval.
- [x] Verify all 15 Supabase application tables, unchanged legacy data/sequences, and real dashboard/investment/planning GET endpoints.

## Next

- [ ] Add safe correction/reversal workflows for goal contributions and debt payments without breaking linked cash history.
- [ ] Add a complete reconciliation-history browser to the interface.
- [ ] Decide and enforce the desired overdraft/allocated-cash policy consistently for ordinary transactions and trade-funding edits.
- [ ] Standardize remaining GET handlers on safe structured API errors.
- [ ] Replace the unsupported `next lint` script with a configured lint command.
- [ ] Make the isolated API and mocked browser regression fixtures reproducible in CI.

- [ ] Rehearse restoring the private backup into a separate database and configure protected off-device backups.
- [ ] Move legacy transactions from the `Uncategorized account` to the correct account.
- [ ] Add authentication and per-user data isolation before publishing the app.
- [ ] Add CSV import and export for user backups.
- [ ] Test the workflows with representative users and assistive technologies.
- [ ] Add recoverable deletion or undo for financial records.
- [ ] Persist transaction filters when navigating away or sharing a view.
- [ ] Verify Yahoo Finance access and permitted data usage in the intended deployment environment.
- [ ] Set `CRON_SECRET`, deploy the price schedule, and verify authenticated daily execution.
- [ ] Review legacy investment opening balances so they represent cash rather than stock value.
- [ ] Add dividend, stock-split, and other corporate-action handling.
- [ ] Add a safe correction/reversal workflow for sinking-fund expenses and immutable fund history.
- [ ] Verify concurrent writes and larger portfolios against a staging PostgreSQL database.
