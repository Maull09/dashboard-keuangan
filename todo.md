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

## Next

- [ ] Create a Supabase project and add its connection URL to `DATABASE_URL`.
- [ ] Back up the database and run `npm run db:migrate`.
- [ ] Move legacy transactions from the `Uncategorized account` to the correct account.
- [ ] Add authentication and per-user data isolation before publishing the app.
- [ ] Add CSV import and export for user backups.
- [ ] Test the workflows with representative users and assistive technologies.
- [ ] Add recoverable deletion or undo for financial records.
- [ ] Persist transaction filters when navigating away or sharing a view.
- [ ] Expand forecast schedule occurrences through payday and exclude already-recorded payments.
