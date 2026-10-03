import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { accounts, transactions } from "@/db/schema"
import {
  getCategoryInsight,
  getPeriodRange,
  getPreviousPeriod,
} from "@/lib/calculations"
import {
  formatMonth,
  getCurrentMonth,
  getMonthStart,
  getRecentMonths,
  isMonth,
} from "@/lib/finance"

export async function GET(request: NextRequest) {
  const locale =
    new URL(request.url).searchParams.get("locale") === "en" ? "en" : "id"
  const [allAccounts, allTransactions] = await Promise.all([
    db.select().from(accounts),
    db.select().from(transactions),
  ])
  const requestedMonth = new URL(request.url).searchParams.get("month")
  const currentMonth = isMonth(requestedMonth)
    ? requestedMonth
    : getCurrentMonth()
  const period = getPeriodRange(currentMonth)
  const monthlyTransactions = allTransactions.filter(
    (transaction) =>
      transaction.date >= period.start && transaction.date < period.end,
  )
  const income = totalFor(monthlyTransactions, "income")
  const expense = totalFor(monthlyTransactions, "expense")
  const startingBalance = allAccounts.reduce(
    (total, account) => total + account.initialBalance,
    0,
  )
  const runningBalance = startingBalance + netAmount(allTransactions)
  const months = getRecentMonths(6)
  const firstMonthStart = getMonthStart(months[0])
  let historicalBalance =
    startingBalance +
    netAmount(
      allTransactions.filter(
        (transaction) => transaction.date < firstMonthStart,
      ),
    )

  const monthlyData = months.map((month) => {
    const monthTransactions = allTransactions.filter((transaction) =>
      transaction.date.startsWith(month),
    )
    const monthIncome = totalFor(monthTransactions, "income")
    const monthExpense = totalFor(monthTransactions, "expense")
    historicalBalance += monthIncome - monthExpense

    return {
      month: formatMonth(month, locale),
      income: monthIncome,
      expense: monthExpense,
      balance: historicalBalance,
    }
  })

  const expenseByCategory = totalByCategory(monthlyTransactions, "expense")
  const previousPeriod = getPeriodRange(getPreviousPeriod(currentMonth))
  const previousByCategory = totalByCategory(
    allTransactions.filter(
      (transaction) =>
        transaction.date >= previousPeriod.start &&
        transaction.date < previousPeriod.end,
    ),
    "expense",
  )
  const insights = Object.entries(expenseByCategory)
    .map(([category, amount]) =>
      getCategoryInsight(
        category,
        amount,
        previousByCategory[category] ?? 0,
        locale,
      ),
    )
    .filter((insight): insight is string => insight !== null)

  return NextResponse.json({
    income,
    expense,
    runningBalance,
    savingRate:
      income === 0 ? 0 : Math.round(((income - expense) / income) * 1000) / 10,
    monthlyData,
    balanceHistory: monthlyData.map(({ month, balance }) => ({
      month,
      balance,
    })),
    expenseByCategory,
    incomeBySource: totalByCategory(monthlyTransactions, "income"),
    insights,
  })
}

function totalFor(
  rows: Array<{ type: "income" | "expense" | "transfer"; amount: number }>,
  type: "income" | "expense",
) {
  return rows.reduce(
    (total, transaction) =>
      transaction.type === type ? total + transaction.amount : total,
    0,
  )
}

function netAmount(
  rows: Array<{ type: "income" | "expense" | "transfer"; amount: number }>,
) {
  return rows.reduce((total, transaction) => {
    if (transaction.type === "income") return total + transaction.amount
    if (transaction.type === "expense") return total - transaction.amount
    return total
  }, 0)
}

function totalByCategory(
  rows: Array<{
    type: "income" | "expense" | "transfer"
    category: string
    amount: number
  }>,
  type: "income" | "expense",
) {
  return rows.reduce<Record<string, number>>((totals, transaction) => {
    if (transaction.type === type)
      totals[transaction.category] =
        (totals[transaction.category] ?? 0) + transaction.amount
    return totals
  }, {})
}
