import { asc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { recurringTransactions } from "@/db/schema"
import { accountsExist } from "@/lib/accounts"
import { financeResponse } from "@/lib/api-response"
import { FinanceError } from "@/lib/finance-errors"
import { parseRecurring } from "@/lib/planning-validation"

export async function GET() {
  return NextResponse.json(
    await db
      .select()
      .from(recurringTransactions)
      .orderBy(asc(recurringTransactions.startDate)),
  )
}

export async function POST(request: NextRequest) {
  return financeResponse(async () => {
    const input = parseRecurring(await request.json())
    if (!(await accountsExist(input.accountId, input.destinationAccountId)))
      throw new FinanceError("invalidInput")
    const [recurring] = await db
      .insert(recurringTransactions)
      .values(input)
      .returning()
    return NextResponse.json(recurring, { status: 201 })
  })
}
