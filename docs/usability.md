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
