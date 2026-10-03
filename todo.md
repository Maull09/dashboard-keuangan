# To do

## Completed

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

## Next

- [ ] Create a Supabase project and add its connection URL to `DATABASE_URL`.
- [ ] Back up the database and run `npm run db:migrate`.
- [ ] Move legacy transactions from the `Uncategorized account` to the correct account.
- [ ] Add authentication and per-user data isolation before publishing the app.
- [ ] Add CSV import and export for user backups.
- [ ] Test the workflows with representative users and assistive technologies.
- [ ] Add recoverable deletion or undo for financial records.
- [ ] Persist transaction filters when navigating away or sharing a view.
- [ ] Configure an IDX-entitled `TWELVE_DATA_API_KEY` and verify actual daily prices.
- [ ] Set `CRON_SECRET`, deploy the price schedule, and verify authenticated daily execution.
- [ ] Review legacy investment opening balances so they represent cash rather than stock value.
- [ ] Add dividend, stock-split, and other corporate-action handling.
- [ ] Add a safe correction/reversal workflow for sinking-fund expenses and immutable fund history.
- [ ] Verify concurrent writes and larger portfolios against a staging PostgreSQL database.
