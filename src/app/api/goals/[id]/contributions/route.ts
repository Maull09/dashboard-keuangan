import { asc, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { accounts, goalContributions, goals } from "@/db/schema"
import { getToday, isDate } from "@/lib/finance"
import { financeResponse } from "@/lib/api-response"
import { FinanceError } from "@/lib/finance-errors"
import { integerInput, recordInput, textInput } from "@/lib/planning-validation"
import { readLedger, readReservations } from "@/lib/server/ledger"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: RouteContext) {
  return financeResponse(async () => {
    const id = integerInput((await params).id, 1, 2_147_483_647)
    const [goal] = await db.select().from(goals).where(eq(goals.id, id))
    if (!goal) throw new FinanceError("recordMissing", 404)
    return NextResponse.json(
      await db
        .select()
        .from(goalContributions)
        .where(eq(goalContributions.goalId, id))
        .orderBy(asc(goalContributions.date), asc(goalContributions.id)),
    )
  })
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  return financeResponse(async () => {
    const goalId = integerInput((await params).id, 1, 2_147_483_647)
    const body = recordInput(await request.json())
    const amount = integerInput(body.amount, 1, 2_147_483_647)
    const accountId = integerInput(body.accountId, 1, 2_147_483_647)
    const date = body.date ?? getToday()
    if (!isDate(date) || date > getToday())
      throw new FinanceError("invalidInput")
    const note = textInput(body.note, 500, false)
    const result = await db.transaction(
      async (connection) => {
        const [account] = await connection
          .select()
          .from(accounts)
          .where(eq(accounts.id, accountId))
          .for("update")
        if (!account) throw new FinanceError("recordMissing", 404)
        const [goal] = await connection
          .select()
          .from(goals)
          .where(eq(goals.id, goalId))
          .for("update")
        if (!goal) throw new FinanceError("recordMissing", 404)
        const contributions = await connection
          .select()
          .from(goalContributions)
          .where(eq(goalContributions.goalId, goalId))
        const progress =
          goal.currentAmount +
          contributions.reduce((total, item) => total + item.amount, 0)
        if (progress + amount > goal.targetAmount)
          throw new FinanceError("goalTargetExceeded", 409)
        const ledger = await readLedger(connection)
        const reservations = await readReservations(connection)
        const cash = ledger.summaries.find(
          (item) => item.id === accountId,
        )!.balance
        if (
          Math.round(cash * 100) -
            (reservations.reserved.get(accountId) ?? 0) * 100 <
          amount * 100
        )
          throw new FinanceError("insufficientAvailableCash", 409)
        const [contribution] = await connection
          .insert(goalContributions)
          .values({ goalId, accountId, amount, date, note })
          .returning()
        return contribution
      },
      { isolationLevel: "serializable" },
    )
    return NextResponse.json(result, { status: 201 })
  })
}
