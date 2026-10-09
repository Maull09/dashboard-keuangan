import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { budgets } from "@/db/schema"
import {
  getCurrentMonth,
  getMonthStart,
  getNextMonthStart,
  isMonth,
} from "@/lib/finance"
import { parseBudgetInput } from "@/lib/validation"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { FinanceError } from "@/lib/finance-errors"
import { getPreviousPeriod } from "@/lib/calculations"
import { readBudgets } from "@/lib/server/budget-queries"

export async function GET(request: NextRequest) {
  return authenticatedResponse(async (db) => {
    const requestedMonth = new URL(request.url).searchParams.get("month")
    const month = isMonth(requestedMonth) ? requestedMonth : getCurrentMonth()
    const periodStart = getMonthStart(month)
    const periodEnd = getNextMonthStart(month)
    const previousMonth = getPreviousPeriod(month)
    const previousStart = getMonthStart(previousMonth)
    return NextResponse.json(
      await readBudgets(db, periodStart, periodEnd, previousStart),
    )
  }, request)
}

export async function POST(request: NextRequest) {
  return authenticatedResponse(async (db) => {
    const input = parseBudgetInput(await request.json())

    if (!input) throw new FinanceError("invalidInput")

    const budget = await db.transaction(async (connection) => {
      const [existingBudget] = await connection
        .select({ id: budgets.id })
        .from(budgets)
        .where(
          and(
            eq(budgets.category, input.category),
            eq(budgets.periodStart, input.periodStart),
          ),
        )
        .limit(1)

      if (existingBudget) {
        throw new FinanceError("budgetAlreadyExists", 409)
      }

      const [created] = await connection
        .insert(budgets)
        .values({ ...input, spent: 0, period: "monthly" })
        .returning()
      return created
    })
    return NextResponse.json(budget, { status: 201 })
  })
}
