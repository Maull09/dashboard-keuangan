import { and, eq, ne } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { budgets } from "@/db/schema"
import { parseBudgetInput } from "@/lib/validation"
import { financeResponse } from "@/lib/api-response"
import { FinanceError } from "@/lib/finance-errors"
import { integerInput } from "@/lib/planning-validation"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  return financeResponse(async () => {
    const id = integerInput((await params).id, 1, 2_147_483_647)
    const input = parseBudgetInput(await request.json())
    if (!input) throw new FinanceError("invalidInput")
    const budget = await db.transaction(
      async (connection) => {
        const [existing] = await connection
          .select()
          .from(budgets)
          .where(eq(budgets.id, id))
          .for("update")
        if (!existing) throw new FinanceError("recordMissing", 404)
        const [duplicate] = await connection
          .select()
          .from(budgets)
          .where(
            and(
              eq(budgets.category, input.category),
              eq(budgets.periodStart, input.periodStart),
              ne(budgets.id, id),
            ),
          )
          .limit(1)
        if (duplicate) throw new FinanceError("budgetAlreadyExists", 409)
        const [updated] = await connection
          .update(budgets)
          .set(input)
          .where(eq(budgets.id, id))
          .returning()
        return updated
      },
      { isolationLevel: "serializable" },
    )
    return NextResponse.json(budget)
  })
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  return financeResponse(async () => {
    const id = integerInput((await params).id, 1, 2_147_483_647)
    const [budget] = await db
      .delete(budgets)
      .where(eq(budgets.id, id))
      .returning()
    if (!budget) throw new FinanceError("recordMissing", 404)
    return NextResponse.json({ id })
  })
}
