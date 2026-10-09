import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { transactions, sinkingFundEntries, debtPayments } from "@/db/schema"
import { accountsExist } from "@/lib/accounts"
import {
  parseTransactionGroupName,
  parseTransactionInput,
} from "@/lib/validation"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { integerInput } from "@/lib/planning-validation"
import { FinanceError } from "@/lib/finance-errors"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  return authenticatedResponse(async (db) => {
    const id = integerInput((await params).id, 1, 2_147_483_647)
    const body = await request.json()
    if (
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      Object.keys(body).length === 1 &&
      Object.hasOwn(body, "groupName")
    ) {
      const groupName = parseTransactionGroupName(body.groupName)
      if (!Number.isSafeInteger(id) || id <= 0 || groupName === undefined)
        return NextResponse.json({ code: "invalidInput" }, { status: 400 })
      const [transaction] = await db
        .update(transactions)
        .set({ groupName })
        .where(eq(transactions.id, id))
        .returning()
      if (!transaction)
        return NextResponse.json({ code: "recordMissing" }, { status: 404 })
      return NextResponse.json(transaction)
    }
    const input = parseTransactionInput(body)

    if (
      !Number.isSafeInteger(id) ||
      id <= 0 ||
      !input ||
      !(await accountsExist(db, input.accountId, input.destinationAccountId))
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
  return authenticatedResponse(async (db) => {
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
