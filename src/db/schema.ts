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
} from "drizzle-orm/pg-core"

export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense", "transfer"])
export const budgetPeriodEnum = pgEnum("budget_period", ["monthly", "yearly"])

export const accountTypeEnum = pgEnum("account_type", [
  "cash",
  "bank",
  "investment",
  "ewallet",
  "other",
])

export const debtStatusEnum = pgEnum("debt_status", ["unpaid", "paid"])
export const recurringFrequencyEnum = pgEnum("recurring_frequency", ["weekly", "monthly"])

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
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  destinationAccountId: integer("destination_account_id").references(() => accounts.id),
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
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  destinationAccountId: integer("destination_account_id").references(() => accounts.id),
  frequency: recurringFrequencyEnum("frequency").notNull().default("monthly"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  lastExecutedDate: date("last_executed_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const goalContributions = pgTable("goal_contributions", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").references(() => goals.id).notNull(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  amount: integer("amount").notNull(),
  date: date("date").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const debtPayments = pgTable("debt_payments", {
  id: serial("id").primaryKey(),
  debtId: integer("debt_id").references(() => debts.id).notNull(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  amount: integer("amount").notNull(),
  date: date("date").notNull(),
  note: text("note"),
  transactionId: integer("transaction_id").references(() => transactions.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const reconciliations = pgTable("reconciliations", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
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
