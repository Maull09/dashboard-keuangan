import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { accounts, sinkingFunds, sinkingFundEntries } from "@/db/schema"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { FinanceError } from "@/lib/finance-errors"
import { integerInput, parseFund } from "@/lib/planning-validation"
import { fundBalance } from "@/lib/planning"

type Context = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Context) {
  return authenticatedResponse(async (db) => {
    const id = integerInput((await params).id, 1, 2_147_483_647)
    const input = parseFund(await request.json())
    const fund = await db.transaction(async (connection) => {
      const [current] = await connection
        .select()
        .from(sinkingFunds)
        .where(eq(sinkingFunds.id, id))
        .for("update")
      if (!current) throw new FinanceError("recordMissing", 404)
      const entries = await connection
        .select()
        .from(sinkingFundEntries)
        .where(eq(sinkingFundEntries.fundId, id))
      if (entries.length && current.accountId !== input.accountId)
        throw new FinanceError("recordConflict", 409)
      if (fundBalance(entries) > input.targetAmount)
        throw new FinanceError("fundTargetExceeded", 409)
      const [account] = await connection
        .select()
        .from(accounts)
        .where(eq(accounts.id, input.accountId))
      if (!account) throw new FinanceError("recordMissing", 404)
      const [updated] = await connection
        .update(sinkingFunds)
        .set(input)
        .where(eq(sinkingFunds.id, id))
        .returning()
      return updated
    })
    return NextResponse.json(fund)
  })
}

export async function DELETE(_: NextRequest, { params }: Context) {
  return authenticatedResponse(async (db) => {
    const id = integerInput((await params).id, 1, 2_147_483_647)
    await db.transaction(async (connection) => {
      const [fund] = await connection
        .select()
        .from(sinkingFunds)
        .where(eq(sinkingFunds.id, id))
        .for("update")
      if (!fund) throw new FinanceError("recordMissing", 404)
      const [entry] = await connection
        .select()
        .from(sinkingFundEntries)
        .where(eq(sinkingFundEntries.fundId, id))
        .limit(1)
      if (entry) throw new FinanceError("recordConflict", 409)
      await connection.delete(sinkingFunds).where(eq(sinkingFunds.id, id))
    })
    return NextResponse.json({ id })
  })
}
