# Investments and financial planning

The investment, net-worth, simulation, calendar, and sinking-fund views share the existing cash ledger. The interface is available in English and Indonesian; all amounts remain in IDR.

## Apply the database migration

1. Back up the intended Supabase database and stop the app while updating its schema.
2. Use the Supabase Direct connection URL or Session pooler (port 5432) in `DATABASE_URL` temporarily.
3. Run `npm run db:migrate` to apply pending migrations, including `0003_wild_ultimo.sql`.
4. Run `npm run db:migrate -- --check`, restore the runtime pooler URL, and restart the app.

Existing tables with empty migration history need explicit, verified legacy adoption rather than replaying the initial migration. See the [database migration and recovery guide](database-migrations.md).

The new migration adds six tables: instruments, trades, prices, watchlist entries, sinking funds, and fund entries. It does not reinterpret existing balances or insert sample financial records. Migration generation is not database migration. Without these tables, the new ledger queries, including the dashboard's cash balance, will fail.

Review legacy investment accounts before recording stock trades. Their opening balance must represent cash, not holdings. Do not leave a previous portfolio valuation in opening cash and then record the same holdings again. Enter actual trade history and the cash funding that existed before those purchases; backdated buys are checked against cash and earlier holdings. Back up and reconcile existing data before making manual corrections.

## Stock portfolios and watchlists

- Create an **Investment** account for brokerage cash. Record transfers into it using Transactions.
- Record actual buys and sells in Investments. These records do not send orders to a broker.
- Use a four-letter IDX ticker, a trade date no later than today, whole lots, price per share, and total fees/taxes. One lot represents 100 shares in this version.
- Positions are calculated separately for each account and ticker, in date order. Same-day trades use record order.
- Weighted-average cost includes buy fees. A partial sale releases a proportional cost basis, rounded to whole rupiah; the final sale releases the remaining basis exactly. Sale fees reduce proceeds.
- Buying reduces brokerage cash; selling increases it. Neither creates an ordinary consumption expense or income record, so the same trade must not also be entered in Transactions.
- Sales exceeding holdings, cash-short purchases, and purchases using money already allocated to goals/funds are rejected. Removing a trade is rejected when it would invalidate subsequent holdings or cash history.
- Add a stock to the Watchlist to follow its daily close without owning it. Removing a watchlist entry leaves trade history and prices intact.

Stock splits, dividends, rights issues, fractional shares, short selling, non-IDR securities, and corporate-action adjustments are not automatically handled. Returns are rupiah gains/losses, not annualized or time-weighted performance. Do not treat the portfolio as an execution system or investment recommendation.

## Configure daily prices

Use a Twelve Data key with **Indonesia Stock Exchange / XIDX** access. The provider lists IDX data as end-of-day with plan-specific access, so a generic free key is not enough to assume coverage. Confirm entitlement and usage rights before subscribing or deploying. See [official IDX coverage](https://twelvedata.com/exchanges/xidx?group=regulatory), [provider stock coverage](https://twelvedata.com/stocks), and [IDX market-data services](https://www.idx.id/id/produk/layanan-data-bei/).

Set server-only environment variables:

```env
TWELVE_DATA_API_KEY=your_provider_key_with_IDX_access
CRON_SECRET=your_generated_long_random_secret
```

Do not use a `NEXT_PUBLIC_` prefix or commit real keys. Restart the local server after changing `.env`; add the same variables to the deployment environment.

The server requests the latest daily `time_series` close for active holdings and watchlist tickers using `mic_code=XIDX`, `interval=1day`, and `outputsize=1`. It validates the returned ticker, exchange, currency, date, and positive whole-rupiah price before saving it. See [official request guidance](https://support.twelvedata.com/en/articles/5620512-how-to-create-a-request) and [EOD data semantics and licensing](https://support.twelvedata.com/en/articles/12682324-end-of-day-eod-pricing-market-data).

Prices update in three ways:

- Opening Investments automatically makes one refresh request when a key is configured.
- **Update daily prices** requests a refresh on demand.
- On Vercel, `vercel.json` schedules `/api/jobs/stock-prices` at `30 13 * * *`: daily at 13:30 UTC / 20:30 Asia/Jakarta. The job requires `Authorization: Bearer <CRON_SECRET>`. Configure the deployment secret before enabling the job. On another host, configure your own scheduler to call that endpoint with the authorization header.

A successful fetch is cached for 15 minutes. Requests are sequential, stop on access/quota errors, and stop starting new provider calls after a 40-second processing window. Each fetch has a 15-second timeout; the routes request a 60-second hosting limit. Responses distinguish updated, cached, failed, and pending tickers. Retry pending tickers after quota resets or the previous request finishes; large watchlists may require multiple runs and an appropriate hosting/provider plan.

The UI shows the **actual price date**, not the fetch date. Holidays, EOD availability, entitlement, network errors, and quota limits can leave older closes visible. Failed updates never overwrite a saved price with zero or a fabricated value. Daily scheduling is not a guarantee of same-day confirmed data. Live provider access still needs verification with your own key and entitlement.

## Net worth

Net worth adds all account cash, stock market values, and remaining receivables, then subtracts remaining debts. Allocated goal/fund money is already inside cash, not an extra asset. The cash chart includes trade cash flows; it is not an investment-return chart.

If an active holding has no price, full net worth and portfolio market-value totals remain incomplete. A clearly labeled **Known subtotal** includes only valued stocks and the other known components. Recorded purchase cost is not substituted for market value. A saved older price counts as valued, but its date remains visible in Investments.

Debt and receivable amounts assume their outstanding principal was already represented appropriately in your original cash records. Creating an obligation does not by itself invent a cash disbursement or receipt.

## Read-only simulation

Choose an extra monthly payment, its first date, and an end date up to two years ahead. The baseline starts from current recorded cash and expands remaining recurring income/expenses. The scenario subtracts hypothetical monthly payments. Results show monthly ending balances, the cumulative difference, and negative-balance warnings.

The first payment day remains the monthly anchor; short months clamp to their last day without shifting subsequent months. Transfers do not change total cash. Already-executed occurrences and schedules outside their start/end dates are excluded.

Simulation creates no transactions, trades, schedules, or fund entries. Changing inputs or financial data invalidates the previous comparison. Unscheduled spending, unpaid-debt reminders, dividends, future trades, interest, inflation, and market-price changes are not forecast automatically. Month-end warnings do not detect every possible intramonth cash shortage. Existing records form the current balance, including any future-dated records entered by the user.

## Financial calendar

Browse a month, select a date on desktop/tablet, or use the agenda on mobile. The calendar combines unrecorded recurring occurrences, remaining debt/receivable deadlines, and sinking-fund targets. **Manage** opens the corresponding feature.

These are planned dates, not proof of payment. A debt deadline can overlap with its recurring installment, and a fund target is a reminder rather than an automatic expense. Do not sum calendar entries as a deduplicated cash-flow forecast. Recording payments remains an explicit action in the relevant feature.

## Sinking funds

Create a fund with an account, target amount/date, and description. This earmarks money for a predictable expense; it is not a separate bank account or an emergency fund.

- **Allocate** reserves available cash without reducing account balance or creating an expense. Existing account-linked goal contributions and fund allocations reduce unallocated cash.
- **Release allocation** makes earmarked cash available again without creating income.
- **Spend from fund** creates one expense from the source account today and a linked fund-history entry in the same database transaction. Choose the real expense category; budget/report totals include it once. Do not record it again in Transactions.

Allocations cannot exceed available cash or the target; spending/releases cannot exceed the fund allocation. Suggested monthly saving divides the remaining target across calendar months through the deadline, including the current month; it is a suggestion, not an automatic transfer.

Funds can be edited, but their account is locked after history exists, and the target cannot fall below the current allocation. Only funds without history can be deleted. History entries are immutable in this version; linked expenses cannot be edited/deleted independently. Release unused money while retaining history. There is no fund-expense reversal workflow yet.

Reservations are bookkeeping labels, not a bank lock. Other ordinary expenses/manual balance edits can still consume earmarked cash and produce negative unallocated cash. Legacy manual goal amounts without an account link cannot be assigned to a source account automatically.

## Verification scope

Run `npm test`, `npx tsc --noEmit`, and `npm run build`. Automated tests cover fees, weighted-average sales, missing prices, schedule expansion, simulations, fund math, strict input validation, provider-payload validation, bilingual messages, and sanitized client errors.

An isolated in-memory PostgreSQL smoke check applied all four migrations and exercised actual API handlers for buys/sales, oversell/backdate rollback, dependent-trade deletion, cash/valuation consistency, reservations, linked fund spending, empty-fund editing/deletion, calendar aggregation, simulation non-mutation, invalid requests, and the cron guard. This was not a Supabase production migration or a concurrency/load test.

The application currently has no authentication or per-user isolation. Keep it private; the cron secret protects the scheduled endpoint only, not the rest of the application. Live quote retrieval and deployment scheduling need verification after environment setup.
