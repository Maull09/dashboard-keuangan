import { eq, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import {
  accounts,
  transactions,
  stockTrades,
  sinkingFunds,
  goalContributions,
  debtPayments,
  recurringTransactions,
  reconciliations,
} from "@/db/schema"
import { parseAccountInput } from "@/lib/validation"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { FinanceError } from "@/lib/finance-errors"
import { integerInput } from "@/lib/planning-validation"
import { readLedger } from "@/lib/server/ledger"
import { readReservedCash } from "@/lib/server/financial-queries"
import { validateInvestmentAccount } from "@/lib/investments"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  return authenticatedResponse(async (db) => {
    const id = integerInput((await params).id, 1, 2_147_483_647)
    const input = parseAccountInput(await request.json())
    if (!input) throw new FinanceError("invalidInput")
    const result = await db.transaction(async (connection) => {
      const [existing] = await connection
        .select()
        .from(accounts)
        .where(eq(accounts.id, id))
        .for("update")
      if (!existing) throw new FinanceError("recordMissing", 404)
      const [trade] = await connection
        .select()
        .from(stockTrades)
        .where(eq(stockTrades.accountId, id))
        .limit(1)
      if (trade && input.type !== "investment")
        throw new FinanceError("historyProtected", 409)
      if (input.initialBalance !== existing.initialBalance) {
        const ledger = await readLedger(connection, [id])
        const reservations = await readReservedCash(connection, [id])
        if (trade || (reservations.reserved.get(id) ?? 0) > 0)
          validateInvestmentAccount(
            { id, initialBalance: input.initialBalance },
            ledger.transactions,
            ledger.trades,
            reservations.reserved.get(id) ?? 0,
          )
      }
      const [account] = await connection
        .update(accounts)
        .set(input)
        .where(eq(accounts.id, id))
        .returning()
      return account
    })
    return NextResponse.json(result)
  })
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  return authenticatedResponse(async (db) => {
    const id = integerInput((await params).id, 1, 2_147_483_647)
    const [usage] = await db.select({
      inUse: sql<boolean>`
        exists (select 1 from ${stockTrades} where ${stockTrades.accountId} = ${id}) or
        exists (select 1 from ${sinkingFunds} where ${sinkingFunds.accountId} = ${id}) or
        exists (select 1 from ${transactions} where ${transactions.accountId} = ${id} or ${transactions.destinationAccountId} = ${id}) or
        exists (select 1 from ${goalContributions} where ${goalContributions.accountId} = ${id}) or
        exists (select 1 from ${debtPayments} where ${debtPayments.accountId} = ${id}) or
        exists (select 1 from ${recurringTransactions} where ${recurringTransactions.accountId} = ${id} or ${recurringTransactions.destinationAccountId} = ${id}) or
        exists (select 1 from ${reconciliations} where ${reconciliations.accountId} = ${id})
      `,
    }).from(accounts).where(eq(accounts.id, id)).limit(1)
    if (!usage) throw new FinanceError("recordMissing", 404)
    if (usage.inUse) throw new FinanceError("accountInUse", 409)
    const [account] = await db
      .delete(accounts)
      .where(eq(accounts.id, id))
      .returning()
    if (!account) throw new FinanceError("recordMissing", 404)
    return NextResponse.json({ id })
  })
}
