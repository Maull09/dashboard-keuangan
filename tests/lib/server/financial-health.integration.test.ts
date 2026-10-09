import { readFileSync } from "node:fs"
import pg from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { readFinancialHealth } from "@/lib/server/financial-health-queries"
import type { UserDatabase } from "@/lib/server/authenticated-response"

const testUrl = process.env.FINANCIAL_HEALTH_TEST_DATABASE_URL
const owner = "00000000-0000-4000-8000-000000000001"
const other = "00000000-0000-4000-8000-000000000002"

describe.skipIf(!testUrl)("financial health PostgreSQL aggregation", () => {
  let client: pg.Client
  let bank: number
  let investment: number
  async function asUser<T>(userId: string, action: (connection: UserDatabase) => Promise<T>) {
    await client.query("BEGIN")
    try {
      await client.query("SET LOCAL ROLE finance_user")
      await client.query("SELECT set_config('app.user_id', $1, true)", [userId])
      return await action(drizzle(client) as unknown as UserDatabase)
    } finally {
      await client.query("ROLLBACK")
    }
  }
  beforeAll(async () => {
    const url = new URL(testUrl!)
    if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_health_test"))
      throw new Error("Use an empty disposable local database ending in _health_test")
    client = new pg.Client({ connectionString: testUrl })
    await client.connect()
    const existing = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
    if (existing.rowCount) throw new Error("Financial health tests require an empty database")
    await client.query("CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN")
    const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8")).entries
    for (const migration of journal) {
      for (const statement of readFileSync(`drizzle/${migration.tag}.sql`, "utf8").split("--> statement-breakpoint"))
        await client.query(statement)
    }
    await client.query("SELECT set_config('app.user_id', $1, false)", [owner])
    bank = (await client.query("INSERT INTO accounts(name, type, initial_balance) VALUES ('Bank', 'bank', 30000000) RETURNING id")).rows[0].id
    investment = (await client.query("INSERT INTO accounts(name, type, initial_balance) VALUES ('Stocks', 'investment', 5000000) RETURNING id")).rows[0].id
    await client.query("INSERT INTO accounts(name, type, initial_balance) VALUES ('Overdraft', 'other', -1000000)")
    await client.query("INSERT INTO transactions(type, amount, category, date, account_id, destination_account_id) VALUES ('income',15000000,'Gaji Utama','2026-09-01',$1,null), ('expense',7000000,'Makanan','2026-09-03',$1,null), ('transfer',3000000,'Transfer','2026-09-04',$1,$2), ('income',99999999,'Future','2026-10-01',$1,null)", [bank, investment])
    const loan = (await client.query("INSERT INTO debts(type,name,amount,created_at) VALUES ('utang','Loan',30000000,'2026-09-01T00:00:00Z') RETURNING id")).rows[0].id
    const receivable = (await client.query("INSERT INTO debts(type,name,amount,created_at) VALUES ('piutang','Receivable',2000000,'2026-09-01T00:00:00Z') RETURNING id")).rows[0].id
    for (const payment of [{ debt: loan, type: "expense", amount: 2000000 }, { debt: receivable, type: "income", amount: 500000 }]) {
      const transaction = (await client.query("INSERT INTO transactions(type,amount,category,date,account_id) VALUES ($1,$2,'Payment','2026-09-05',$3) RETURNING id", [payment.type, payment.amount, bank])).rows[0].id
      await client.query("INSERT INTO debt_payments(debt_id,account_id,amount,date,transaction_id) VALUES ($1,$2,$3,'2026-09-05',$4)", [payment.debt, bank, payment.amount, transaction])
    }
    const goal = (await client.query("INSERT INTO goals(title,target_amount,target_date) VALUES ('Goal',10000000,'2027-01-01') RETURNING id")).rows[0].id
    await client.query("INSERT INTO goal_contributions(goal_id,account_id,amount,date) VALUES ($1,$2,1000000,'2026-09-01')", [goal, bank])
    const fund = (await client.query("INSERT INTO sinking_funds(name,account_id,target_amount,target_date) VALUES ('Fund',$1,10000000,'2027-01-01') RETURNING id", [bank])).rows[0].id
    await client.query("INSERT INTO sinking_fund_entries(fund_id,kind,amount,date) VALUES ($1,'allocate',2000000,'2026-09-01')", [fund])
    await client.query("INSERT INTO stock_instruments(symbol,name) VALUES ('TEST','Synthetic stock')")
    await client.query("INSERT INTO stock_trades(symbol,account_id,side,shares,price,date) VALUES ('TEST',$1,'buy',100,10000,'2026-09-02')", [investment])
    await client.query("INSERT INTO stock_prices(symbol,price,date) VALUES ('TEST',12000,'2026-09-28'),('TEST',50000,'2026-10-01')")
    await client.query("INSERT INTO recurring_transactions(name,type,amount,category,account_id,frequency,start_date,last_executed_date) VALUES ('Monthly rent','expense',1000000,'Tagihan',$1,'monthly','2026-08-01','2026-09-01'),('Weekly expense','expense',100000,'Makanan',$1,'weekly','2026-09-01','2026-09-29')", [bank])
    await client.query("SELECT set_config('app.user_id', $1, false)", [other])
    await client.query("INSERT INTO accounts(name,type,initial_balance) VALUES ('Other user','bank',100000000)")
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date("2026-10-09T00:00:00Z"))
  }, 30_000)
  afterAll(async () => {
    vi.useRealTimers()
    await client?.end()
  })
  const input = { month: "2026-09", essentialExpense: 6000000, monthlyDebtPayment: 2000000 }
  it("excludes future transactions, transfers, stock purchases and receivable collections from operating flow", async () => {
    const report = await asUser(owner, (connection) => readFinancialHealth(connection, input))
    expect(report).toMatchObject({ income: 15000000, expense: 9000000, surplus: 6000000,
      savingsRate: 0.4, transactionCount: 3, transferCount: 1, recordedDebtPayments: 2000000 })
  })
  it("uses closing-date prices, deducts earmarked liquidity and counts overdrafts as liabilities", async () => {
    const report = await asUser(owner, (connection) => readFinancialHealth(connection, input))
    expect(report).toMatchObject({ asOf: "2026-09-30", partial: false, oldestPriceDate: "2026-09-28",
      liquidAssets: 30500000, totalAssets: 43200000, totalLiabilities: 29000000, netWorth: 14200000 })
    expect(report.emergencyMonths).toBeCloseTo(30.5 / 6)
  })
  it("includes all scheduled occurrences even if already executed", async () => {
    const report = await asUser(owner, (connection) => readFinancialHealth(connection, input))
    expect(report.recurringExpense).toBe(1500000)
    expect(report.recurringCommitmentRatio).toBe(0.1)
  })
  it("leaves asset ratios unknown when a holding has no closing-date price", async () => {
    await asUser(owner, async (connection) => {
      await client.query("INSERT INTO stock_instruments(symbol,name) VALUES ('UNPRICED','Unpriced stock')")
      await client.query("INSERT INTO stock_trades(symbol,account_id,side,shares,price,date) VALUES ('UNPRICED',$1,'buy',1,1000,'2026-09-01')", [investment])
      expect(await readFinancialHealth(connection, input)).toMatchObject({ unpricedHoldings: 1, score: null, totalAssets: null, netWorth: null, debtToAssetRatio: null })
    })
  })
  it("rejects monthly debt obligations below already recorded payments", async () => {
    await expect(asUser(owner, (connection) => readFinancialHealth(connection, { ...input, monthlyDebtPayment: 0 })))
      .rejects.toMatchObject({ code: "invalidInput" })
  })
  it("keeps all subqueries restricted to the signed-in user", async () => {
    expect(await asUser(other, (connection) => readFinancialHealth(connection, { ...input, monthlyDebtPayment: null })))
      .toMatchObject({ income: 0, expense: 0, totalAssets: 100000000, totalLiabilities: 0,
        recordedDebtPayments: 0, recurringExpense: 0, transactionCount: 0, transferCount: 0, score: null })
  })
})
