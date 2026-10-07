import { eq, or } from "drizzle-orm"
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
import { readLedger, readReservations } from "@/lib/server/ledger"
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
        const ledger = await readLedger(connection)
        const reservations = await readReservations(connection)
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
    const [trade] = await db
      .select()
      .from(stockTrades)
      .where(eq(stockTrades.accountId, id))
      .limit(1)
    const [fund] = await db
      .select()
      .from(sinkingFunds)
      .where(eq(sinkingFunds.accountId, id))
      .limit(1)
    if (trade || fund) throw new FinanceError("accountInUse", 409)
    const [relatedTransaction] = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(
        or(
          eq(transactions.accountId, id),
          eq(transactions.destinationAccountId, id),
        ),
      )
      .limit(1)
    if (relatedTransaction) throw new FinanceError("accountInUse", 409)
    const linked = await Promise.all([
      db
        .select({ id: goalContributions.id })
        .from(goalContributions)
        .where(eq(goalContributions.accountId, id))
        .limit(1),
      db
        .select({ id: debtPayments.id })
        .from(debtPayments)
        .where(eq(debtPayments.accountId, id))
        .limit(1),
      db
        .select({ id: recurringTransactions.id })
        .from(recurringTransactions)
        .where(
          or(
            eq(recurringTransactions.accountId, id),
            eq(recurringTransactions.destinationAccountId, id),
          ),
        )
        .limit(1),
      db
        .select({ id: reconciliations.id })
        .from(reconciliations)
        .where(eq(reconciliations.accountId, id))
        .limit(1),
    ])
    if (linked.some((records) => records.length))
      throw new FinanceError("accountInUse", 409)
    const [account] = await db
      .delete(accounts)
      .where(eq(accounts.id, id))
      .returning()
    if (!account) throw new FinanceError("recordMissing", 404)
    return NextResponse.json({ id })
  })
}
