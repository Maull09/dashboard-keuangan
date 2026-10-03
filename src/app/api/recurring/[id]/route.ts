import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { recurringTransactions } from "@/db/schema"
import { accountsExist } from "@/lib/accounts"
import { financeResponse } from "@/lib/api-response"
import { FinanceError } from "@/lib/finance-errors"
import { integerInput, parseRecurring } from "@/lib/planning-validation"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  return financeResponse(async () => {
    const id = integerInput((await params).id, 1, 2_147_483_647)
    const input = parseRecurring(await request.json())
    if (!(await accountsExist(input.accountId, input.destinationAccountId)))
      throw new FinanceError("invalidInput")
    const [recurring] = await db
      .update(recurringTransactions)
      .set(input)
      .where(eq(recurringTransactions.id, id))
      .returning()
    if (!recurring) throw new FinanceError("recordMissing", 404)
    return NextResponse.json(recurring)
  })
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  return financeResponse(async () => {
    const id = integerInput((await params).id, 1, 2_147_483_647)
    const [recurring] = await db
      .delete(recurringTransactions)
      .where(eq(recurringTransactions.id, id))
      .returning()
    if (!recurring) throw new FinanceError("recordMissing", 404)
    return NextResponse.json({ id })
  })
}
