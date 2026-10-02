import { asc, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { debtPayments, debts, transactions } from "@/db/schema"
import { accountsExist } from "@/lib/accounts"
import { getToday, isDate } from "@/lib/finance"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: RouteContext) {
  const debtId = Number((await params).id)
  return NextResponse.json(await db.select().from(debtPayments).where(eq(debtPayments.debtId, debtId)).orderBy(asc(debtPayments.date)))
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const debtId = Number((await params).id)
  const body = await request.json()
  const amount = Number(body.amount)
  const accountId = Number(body.accountId)
  const date = typeof body.date === "string" ? body.date : getToday()

  if (!Number.isSafeInteger(debtId) || !Number.isSafeInteger(amount) || amount <= 0 || !Number.isSafeInteger(accountId) || accountId <= 0 || !isDate(date) || !(await accountsExist(accountId, null))) {
    return NextResponse.json({ error: "Pembayaran tidak valid" }, { status: 400 })
  }

  const [debt] = await db.select().from(debts).where(eq(debts.id, debtId))
  if (!debt) return NextResponse.json({ error: "Utang/piutang tidak ditemukan" }, { status: 404 })
  const payments = await db.select({ amount: debtPayments.amount }).from(debtPayments).where(eq(debtPayments.debtId, debtId))
  const paidAmount = payments.reduce((total, payment) => total + payment.amount, 0)
  if (paidAmount + amount > debt.amount) return NextResponse.json({ error: "Pembayaran melebihi sisa tagihan" }, { status: 400 })

  const result = await db.transaction(async (tx) => {
    const [transaction] = await tx.insert(transactions).values({
      type: debt.type === "utang" ? "expense" : "income",
      amount,
      category: debt.type === "utang" ? "Pembayaran utang" : "Penerimaan piutang",
      description: body.note || debt.name,
      date,
      accountId,
      destinationAccountId: null,
    }).returning()
    const [payment] = await tx.insert(debtPayments).values({ debtId, accountId, amount, date, note: typeof body.note === "string" ? body.note.trim() : "", transactionId: transaction.id }).returning()
    const isPaid = paidAmount + amount === debt.amount
    await tx.update(debts).set({ status: isPaid ? "paid" : "unpaid", paidDate: isPaid ? date : null }).where(eq(debts.id, debtId))
    return payment
  })

  return NextResponse.json(result, { status: 201 })
}
