# Usability improvements

This iteration applies [Jakob Nielsen's ten usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) to the main Finance Tracker workflows. It is an implementation checklist, not a claim of a complete usability or accessibility audit.

## Visual direction

The interface follows a practical bookkeeping direction: white surfaces, slate text, teal primary actions, and separate warning and destructive colors. Amounts use tabular figures, transaction columns are right-aligned, and every view has a clear title, explanation, and primary action. Financial status is communicated with text as well as color.

## Heuristic mapping

| Heuristic                                                  | Implementation                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Visibility of system status                             | Separate loading, empty, and error states; disabled saving controls; refresh indicators; localized success notifications. Failed requests never appear as an empty account or transaction history.                                                              |
| 2. Match between system and the real world                 | Plain financial terms, IDR amount previews, readable dates, translated built-in categories, and explanations of transfers, allocations, and estimated balances.                                                                                                 |
| 3. User control and freedom                                | Cancel and close actions, dismissible help, transaction editing, filter reset, and browser Back/Forward navigation between views. Form input remains available after a failed save.                                                                             |
| 4. Consistency and standards                               | Shared page headings, fields, notices, buttons, and dialog structure; English and Indonesian copy across accounts, transactions, budgets, goals, debts, planning, and reports.                                                                                  |
| 5. Error prevention                                        | Prevent repeated submissions, distinct source/destination accounts for transfers, amount limits for contributions and repayments, invalid date-range feedback, and confirmations before deleting or recording a recurring payment.                              |
| 6. Recognition rather than recall                          | Persistent field labels, explicit required indicators, account and category selectors, record details in confirmations, and visible budget, goal, and repayment progress.                                                                                       |
| 7. Flexibility and efficiency of use                       | Debounced database search, server-side filters and totals across all matching transactions, pagination, a current-month shortcut, reset controls, and suggested contribution amounts. English category searches match existing Indonesian category identifiers. |
| 8. Aesthetic and minimalist design                         | Clear page hierarchy, restrained color, readable spacing, a scrollable transaction table on small screens, and reduced-motion CSS. Help is available without taking over the dashboard.                                                                         |
| 9. Help users recognize, diagnose, and recover from errors | Localized network, input, missing-record, conflict, and service-error guidance; retry controls; retained form values; no raw database errors in the interface.                                                                                                  |
| 10. Help and documentation                                 | A bilingual Quick guide explains accounts, transactions, budgets, goals, forecasting, and reconciliation. Contextual hints clarify actions before money-related records are submitted.                                                                          |

## Important behavior

- Transaction totals apply to the entire filtered result, not just the visible page. Both source and destination accounts match an account filter for transfers.
- Switching views uses URL fragments such as `#transactions`. The browser's Back and Forward actions navigate between views. Filters are local to the transaction view and reset when it is unmounted.
- Goal contributions allocate money to a goal without reducing account balance. They are not cash transfers.
- Recurring schedules are recorded manually with **Record now**. Confirmation explains that this creates a real transaction and changes the selected account's balance.
- Forecasts are estimates based on existing schedules, not automatic transactions or guarantees. Unscheduled spending is not included.
- Reconciliation stores a comparison; it does not automatically adjust the account balance.
- Deletion is permanent in the current application. Confirmations explain its effect; there is no undo or soft-delete feature.
- Language preference is stored locally in the browser. User-entered names and descriptions are not translated.

## Verification and follow-up

Automated tests cover financial calculations, transaction-filter validation, translated category matching, bilingual message parity, and client-request error handling. Run `npm test`, `npx tsc --noEmit`, and `npm run build` after changes.

Browser checks should cover desktop and mobile widths, all twelve views, keyboard navigation, dialog focus and overflow, form recovery, language persistence, and empty/error states. Use mocked API responses for mutation tests; do not create or delete real financial data just to verify the interface.

Further work includes representative-user usability testing, a full assistive-technology audit, saved or shareable filters, and a recoverable deletion workflow. The initial usability iteration did not introduce database migrations or changes to historical financial data; the subsequent investment/planning expansion adds a new migration. Neither introduces authentication.

### Checks run on 2026-10-03

- 25 automated tests passed across four test files.
- TypeScript checking and the production build passed.
- A headless Microsoft Edge smoke test used mocked API responses to check all seven views, desktop (1440 px) and mobile (375 px) overflow, modal bounds, help, database-search requests, retained form input after a failed save, success feedback, deletion cancellation, Back/Forward navigation, language persistence, and data-error retry. No uncaught browser errors were observed.
- Automated axe checks reported no WCAG A/AA violations on the desktop dashboard and mobile transaction view tested. This does not establish full WCAG compliance; other pages and assistive technologies still require testing.
- Mutation requests were intercepted with fixtures. No real financial records were created, changed, or deleted during these browser checks.

### Investment and planning checks on 2026-10-03

- Expanded forecast occurrences through payday and excluded already-recorded schedule dates.
- Added Quick guide topics and contextual hints for brokerage cash, incomplete valuations, net worth, read-only scenarios, calendar reminders, and sinking-fund spending.
- Fixed action wrapping at narrow content widths and made horizontally scrollable portfolio, trade-history, and scenario tables keyboard-focusable.
- 95 automated tests across ten files, TypeScript checking, and a production build passed. An isolated PostgreSQL check verified migrations and actual API flows without connecting to Supabase or changing real financial data.
- Mocked browser checks covered the five new views at 1440, 768, and 375 px; English/Indonesian headings; partial price-update errors; trade failures retaining input; cancellation; simulation input-change invalidation; calendar date/month navigation; fund-expense explanations; and help/trade dialog bounds on mobile. No uncaught browser errors were observed.
- Targeted axe WCAG A/AA checks reported no violations across those five view/width combinations. This remains a targeted automated check, not a complete accessibility audit.

See [investment and planning setup](investments-and-planning.md) for data semantics and deployment requirements.

## Repository-wide CRUD review — 2026-10-03

This review covers all twelve navigation views and their financial-management APIs. It distinguishes editable source records from derived summaries and append-only financial history; giving every derived number an edit/delete action would make the ledger inconsistent.

| View | Record management and reviewed behavior |
| --- | --- |
| Dashboard / accounts | Create, read, edit, and delete account metadata. Edit uses the real opening balance, not calculated current cash. Linked-account deletion and invalid stock/allocated-cash changes are rejected. Reconciliation records comparisons, not automatic adjustments. |
| Transactions | Create/read/edit/delete ordinary transactions, database filtering, totals, and pagination. Fund-expense and debt-payment cash records cannot be independently edited/deleted. |
| Budget | Create/read/edit/delete monthly limits and rollover settings. Duplicate category/month combinations are rejected; actual spending remains derived from transactions. |
| Goals | Create/read/edit/delete goal details and targets. Contributions have a separate history dialog. Progress cannot be manually overwritten or lowered through target changes; goals with contribution history cannot be deleted. |
| Debts and receivables | Create/read/edit/delete details, with separate payment history. Types are locked after payments, totals cannot fall below paid amounts, and paid status derives from recorded payments. Legacy settled records without itemized payments preserve their type/amount/status rather than fabricating transactions. |
| Planning | Create/read/edit/delete recurring definitions, including transfers and optional end dates. Editing does not post cash transactions. Manual execution is atomic and rejects same-day repeats and inactive dates. Completed forecasts are cleared when financial data changes. |
| Investments | Create/read/edit/delete trades via **Manage trades / Trade history**. Edits validate affected accounts, holdings, chronological cash, and allocated cash. Previous/new cash impacts and projected available cash are visible; the history includes per-share prices. |
| Watchlist (Investments) | Add/read/edit/remove entries. Ticker is read-only on edit; name and note are editable. Duplicate creation leaves the existing entry unchanged. Removing a watch entry does not remove holdings or trades. |
| Net worth | Read-only derived valuation, refresh feedback, and explicit incomplete valuations. Source records are managed elsewhere. |
| Simulation | Read-only scenario inputs/results; no financial records are changed. Existing input/data-change invalidation remains in place. |
| Financial calendar | Read-only planned dates, month/date navigation, and links to manage source records. Reminders are not proof of payment. |
| Sinking funds | Existing metadata CRUD and allocation/release/spend workflows retained. Linked expense/history protections remain in place; background refreshes do not discard editing drafts. |
| Reports | Read-only derived reports for a selectable period. Report values are changed through source transactions, not by editing totals. |

### What changed against the ten heuristics

| Heuristic | Changes and evidence in this iteration |
| --- | --- |
| 1 — Status visibility | Background reloads retain loaded data instead of unmounting forms; management views show update status and retry notices. Saving/deletion feedback stays localized. |
| 2 — Real-world language | Opening cash is distinguished from today's balance. Trade corrections show financial consequences; recurring edits explain that previous payments remain unchanged. |
| 3 — Control and freedom | Added missing edit/delete controls for investments, watchlist, accounts, budgets, goals, debts, and recurring schedules. Cancel leaves data unchanged; failed saves retain input. Immutable histories remain intentionally protected. |
| 4 — Consistency | Reused existing field, dialog, submit, feedback, and confirmation components. Added shared record-deletion and contribution/payment-history components; synchronized English/Indonesian copy. |
| 5 — Error prevention | Server guards block orphaned sales, insufficient trade cash, broken allocations, lowered recorded totals, linked-history deletion, duplicate watch/budget records, and repeated recurring execution. Financial mutations use transactions where multiple records must stay consistent. |
| 6 — Recognition | Visible Edit/Delete labels, record-specific accessible names, prefills, detailed confirmations, and contribution/payment history reduce the need to remember hidden record details. |
| 7 — Efficiency | **Manage trades** makes corrections discoverable from the portfolio; forms reuse existing values rather than requiring re-entry. Existing transaction search/filter/pagination remains available. |
| 8 — Minimalism | Preserved the established bookkeeping visual system and added contextual actions rather than extra navigation pages. Tested all twelve views at three widths; long account/goal/debt names can wrap. |
| 9 — Error recovery | Domain-specific bilingual errors explain protected history, duplicate records, excess payments, and inactive schedules. Retryable load errors remain visible; raw database/payload details are not returned or logged by the shared financial-error wrapper. |
| 10 — Help | Extended the bilingual Quick guide with record-management/history guidance and documented source-record versus derived-view behavior here and in the README. |

### Verification and limits

- 157 automated tests across eleven files passed, including new goal/debt/schedule validation, PostgreSQL integer bounds, edited-trade history/cash guards, cent arithmetic, and safe error logging. TypeScript checking and production build passed.
- Isolated PGlite/PostgreSQL-compatible API checks applied all five existing migrations, then exercised nine CRUD/protection scenario groups and the existing investment/planning regression flows. No Supabase connection was used by those mutation tests.
- Mocked Microsoft Edge checks covered all twelve views in both languages at 1440, 768, and 375 px, plus edit-dialog prefills, failed PATCH input retention, successful trade edits, deletion cancellation/protection, history dialogs, opening-balance correctness, empty state/help, and draft preservation through successful/failed background refreshes.
- 86 targeted axe WCAG A/AA view/dialog checks reported no violations after dialog entrance animations completed. No uncaught browser errors were observed. All browser mutation requests were intercepted; no real financial records were changed. The in-app browser connection was unavailable, so a separate headless test browser was used.
- This iteration adds no database migration and does not rewrite existing user data. It is a code/interaction review with targeted automated checks, not representative-user testing or full WCAG conformance certification.

Remaining gaps: authentication/per-user isolation before deployment, recoverable deletion, safe reversals for contribution/payment/fund history, saved filters, a complete reconciliation-history UI, representative-user/assistive-technology testing, and staging concurrency/large-data checks. The investment safeguards are not a universal overdraft policy for ordinary cash transactions; changing that behavior requires an explicit product decision. Some existing GET handlers still rely on client-side generic error mapping rather than the shared server wrapper. The repository's `next lint` script also needs replacement for its current Next.js version; it was not used as verification here.
