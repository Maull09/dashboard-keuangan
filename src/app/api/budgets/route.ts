import { and, asc, eq, gte, lt } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { budgets, transactions } from "@/db/schema"
import { getCurrentMonth, getMonthStart, getNextMonthStart, isMonth } from "@/lib/finance"
import { parseBudgetInput } from "@/lib/validation"
import { calculateBudgetCarryover, getPreviousPeriod } from "@/lib/calculations"

export async function GET(request: NextRequest) {
  const requestedMonth = new URL(request.url).searchParams.get("month")
  const month = isMonth(requestedMonth) ? requestedMonth : getCurrentMonth()
  const periodStart = getMonthStart(month)
  const periodEnd = getNextMonthStart(month)
  const previousMonth = getPreviousPeriod(month)
  const previousStart = getMonthStart(previousMonth)
  const previousEnd = getNextMonthStart(previousMonth)
  const [budgetRows, expenseRows, previousBudgetRows, previousExpenseRows] = await Promise.all([
    db.select().from(budgets).where(eq(budgets.periodStart, periodStart)).orderBy(asc(budgets.category)),
    db.select({ category: transactions.category, amount: transactions.amount }).from(transactions).where(and(
      eq(transactions.type, "expense"),
      gte(transactions.date, periodStart),
      lt(transactions.date, periodEnd),
    )),
    db.select().from(budgets).where(eq(budgets.periodStart, previousStart)),
    db.select({ category: transactions.category, amount: transactions.amount }).from(transactions).where(and(
      eq(transactions.type, "expense"),
      gte(transactions.date, previousStart),
      lt(transactions.date, previousEnd),
    )),
  ])
  const spentByCategory = new Map<string, number>()

  for (const expense of expenseRows) {
    spentByCategory.set(expense.category, (spentByCategory.get(expense.category) ?? 0) + expense.amount)
  }

  const previousSpentByCategory = new Map<string, number>()
  for (const expense of previousExpenseRows) {
    previousSpentByCategory.set(expense.category, (previousSpentByCategory.get(expense.category) ?? 0) + expense.amount)
  }

  return NextResponse.json(budgetRows.map((budget) => {
    const previousBudget = previousBudgetRows.find((item) => item.category === budget.category)
    const carryover = previousBudget ? calculateBudgetCarryover(previousBudget.budget, previousSpentByCategory.get(budget.category) ?? 0, previousBudget.rolloverEnabled) : 0

    return { ...budget, spent: spentByCategory.get(budget.category) ?? 0, carryover, effectiveBudget: budget.budget + carryover }
  }))
}

export async function POST(request: NextRequest) {
  const input = parseBudgetInput(await request.json())

  if (!input) return NextResponse.json({ error: "Data anggaran tidak valid" }, { status: 400 })

  const [existingBudget] = await db.select({ id: budgets.id }).from(budgets).where(and(
    eq(budgets.category, input.category),
    eq(budgets.periodStart, input.periodStart),
  ))

  if (existingBudget) {
    return NextResponse.json({ error: "Anggaran kategori ini sudah ada untuk periode tersebut" }, { status: 409 })
  }

  const [budget] = await db.insert(budgets).values({ ...input, spent: 0, period: "monthly" }).returning()
  return NextResponse.json(budget, { status: 201 })
}
