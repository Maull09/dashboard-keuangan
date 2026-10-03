// src/db/schema.ts
import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  date,
  pgEnum,
  bigint,
  numeric,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
  "transfer",
])
export const budgetPeriodEnum = pgEnum("budget_period", ["monthly", "yearly"])

export const accountTypeEnum = pgEnum("account_type", [
  "cash",
  "bank",
  "investment",
  "ewallet",
  "other",
])

export const debtStatusEnum = pgEnum("debt_status", ["unpaid", "paid"])
export const recurringFrequencyEnum = pgEnum("recurring_frequency", [
  "weekly",
  "monthly",
])

export const debts = pgTable("debts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "utang" | "piutang"
  name: text("name").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  status: debtStatusEnum("status").notNull().default("unpaid"),
  dueDate: date("due_date"),
  paidDate: date("paid_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: accountTypeEnum("type").notNull(),
  initialBalance: integer("initial_balance").notNull().default(0),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: transactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  date: date("date").notNull(),
  accountId: integer("account_id")
    .references(() => accounts.id)
    .notNull(),
  destinationAccountId: integer("destination_account_id").references(
    () => accounts.id,
  ),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  budget: integer("budget").notNull(),
  spent: integer("spent").notNull().default(0),
  period: budgetPeriodEnum("period").notNull().default("monthly"),
  periodStart: date("period_start").notNull(),
  rolloverEnabled: boolean("rollover_enabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const recurringTransactions = pgTable("recurring_transactions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  accountId: integer("account_id")
    .references(() => accounts.id)
    .notNull(),
  destinationAccountId: integer("destination_account_id").references(
    () => accounts.id,
  ),
  frequency: recurringFrequencyEnum("frequency").notNull().default("monthly"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  lastExecutedDate: date("last_executed_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const goalContributions = pgTable("goal_contributions", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id")
    .references(() => goals.id)
    .notNull(),
  accountId: integer("account_id")
    .references(() => accounts.id)
    .notNull(),
  amount: integer("amount").notNull(),
  date: date("date").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const debtPayments = pgTable("debt_payments", {
  id: serial("id").primaryKey(),
  debtId: integer("debt_id")
    .references(() => debts.id)
    .notNull(),
  accountId: integer("account_id")
    .references(() => accounts.id)
    .notNull(),
  amount: integer("amount").notNull(),
  date: date("date").notNull(),
  note: text("note"),
  transactionId: integer("transaction_id")
    .references(() => transactions.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const reconciliations = pgTable("reconciliations", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id")
    .references(() => accounts.id)
    .notNull(),
  actualBalance: integer("actual_balance").notNull(),
  date: date("date").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  targetAmount: integer("target_amount").notNull(),
  currentAmount: integer("current_amount").notNull().default(0),
  targetDate: date("target_date").notNull(),
  category: text("category").notNull().default("other"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const stockInstruments = pgTable("stock_instruments", {
  symbol: text("symbol").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const stockTrades = pgTable(
  "stock_trades",
  {
    id: serial("id").primaryKey(),
    symbol: text("symbol")
      .notNull()
      .references(() => stockInstruments.symbol),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    side: text("side").notNull(),
    shares: numeric("shares", {
      precision: 16,
      scale: 4,
      mode: "number",
    }).notNull(),
    price: numeric("price", {
      precision: 16,
      scale: 4,
      mode: "number",
    }).notNull(),
    fees: bigint("fees", { mode: "number" }).notNull().default(0),
    date: date("date").notNull(),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("stock_trades_account_symbol_date_idx").on(
      table.accountId,
      table.symbol,
      table.date,
    ),
    check("stock_trades_valid_side", sql`${table.side} in ('buy', 'sell')`),
    check(
      "stock_trades_positive_shares",
      sql`${table.shares} > 0 and ${table.shares} <= 10000000`,
    ),
    check(
      "stock_trades_valid_money",
      sql`${table.price} > 0 and ${table.fees} >= 0`,
    ),
  ],
)

export const stockPrices = pgTable(
  "stock_prices",
  {
    id: serial("id").primaryKey(),
    symbol: text("symbol")
      .notNull()
      .references(() => stockInstruments.symbol),
    price: bigint("price", { mode: "number" }).notNull(),
    date: date("date").notNull(),
    source: text("source").notNull().default("Twelve Data"),
    fetchedAt: timestamp("fetched_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("stock_prices_symbol_date_idx").on(table.symbol, table.date),
    check("stock_prices_positive_price", sql`${table.price} > 0`),
  ],
)

export const stockWatchlist = pgTable("stock_watchlist", {
  symbol: text("symbol")
    .primaryKey()
    .references(() => stockInstruments.symbol),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const sinkingFunds = pgTable(
  "sinking_funds",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    targetAmount: bigint("target_amount", { mode: "number" }).notNull(),
    targetDate: date("target_date").notNull(),
    description: text("description").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("sinking_funds_positive_target", sql`${table.targetAmount} > 0`),
  ],
)

export const sinkingFundEntries = pgTable(
  "sinking_fund_entries",
  {
    id: serial("id").primaryKey(),
    fundId: integer("fund_id")
      .notNull()
      .references(() => sinkingFunds.id),
    kind: text("kind").notNull(),
    amount: bigint("amount", { mode: "number" }).notNull(),
    date: date("date").notNull(),
    note: text("note").notNull().default(""),
    transactionId: integer("transaction_id").references(() => transactions.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("sinking_fund_entries_fund_idx").on(table.fundId),
    uniqueIndex("sinking_fund_entries_transaction_idx").on(table.transactionId),
    check(
      "sinking_fund_entries_valid_kind",
      sql`${table.kind} in ('allocate', 'release', 'spend')`,
    ),
    check("sinking_fund_entries_positive_amount", sql`${table.amount} > 0`),
    check(
      "sinking_fund_entries_linked_spend",
      sql`(${table.kind} = 'spend') = (${table.transactionId} is not null)`,
    ),
  ],
)
