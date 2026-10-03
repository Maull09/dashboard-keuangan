import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { transactions, sinkingFundEntries, debtPayments } from "@/db/schema"
import { accountsExist } from "@/lib/accounts"
import { parseTransactionInput } from "@/lib/validation"
import { financeResponse } from "@/lib/api-response"
import { integerInput } from "@/lib/planning-validation"
import { FinanceError } from "@/lib/finance-errors"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  return financeResponse(async () => {
    const id = integerInput((await params).id, 1, 2_147_483_647)
    const input = parseTransactionInput(await request.json())

    if (
      !Number.isSafeInteger(id) ||
      id <= 0 ||
      !input ||
      !(await accountsExist(input.accountId, input.destinationAccountId))
    ) {
      return NextResponse.json(
        { error: "Data transaksi tidak valid" },
        { status: 400 },
      )
    }

    const [linkedFundEntry] = await db
      .select()
      .from(sinkingFundEntries)
      .where(eq(sinkingFundEntries.transactionId, id))
      .limit(1)
    if (linkedFundEntry)
      return NextResponse.json(
        { code: "linkedFundTransaction" },
        { status: 409 },
      )
    const [payment] = await db
      .select()
      .from(debtPayments)
      .where(eq(debtPayments.transactionId, id))
      .limit(1)
    if (payment) throw new FinanceError("historyProtected", 409)

    const [transaction] = await db
      .update(transactions)
      .set(input)
      .where(eq(transactions.id, id))
      .returning()

    if (!transaction)
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 },
      )
    return NextResponse.json(transaction)
  })
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  return financeResponse(async () => {
    const id = integerInput((await params).id, 1, 2_147_483_647)

    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "ID transaksi tidak valid" },
        { status: 400 },
      )
    }

    const [linkedFundEntry] = await db
      .select()
      .from(sinkingFundEntries)
      .where(eq(sinkingFundEntries.transactionId, id))
      .limit(1)
    if (linkedFundEntry)
      return NextResponse.json(
        { code: "linkedFundTransaction" },
        { status: 409 },
      )
    const [payment] = await db
      .select()
      .from(debtPayments)
      .where(eq(debtPayments.transactionId, id))
      .limit(1)
    if (payment) throw new FinanceError("historyProtected", 409)

    const [transaction] = await db
      .delete(transactions)
      .where(eq(transactions.id, id))
      .returning()
    if (!transaction)
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 },
      )

    return NextResponse.json({ id })
  })
}
