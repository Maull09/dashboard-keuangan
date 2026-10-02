import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { debtPayments, debts } from "@/db/schema"
import { asc } from "drizzle-orm"

export async function GET() {
  const [data, payments] = await Promise.all([
    db.select().from(debts).orderBy(asc(debts.dueDate)),
    db.select({ debtId: debtPayments.debtId, amount: debtPayments.amount }).from(debtPayments),
  ])
  const paidByDebt = new Map<number, number>()
  for (const payment of payments) paidByDebt.set(payment.debtId, (paidByDebt.get(payment.debtId) ?? 0) + payment.amount)
  return NextResponse.json(data.map((debt) => ({ ...debt, paidAmount: paidByDebt.get(debt.id) ?? 0 })))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const amount = Number(body.amount)
  if (!['utang', 'piutang'].includes(body.type) || typeof body.name !== "string" || !body.name.trim() || !Number.isSafeInteger(amount) || amount <= 0) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 })
  }
  const [result] = await db
    .insert(debts)
    .values({
      type: body.type,
      name: body.name.trim(),
      amount,
      description: body.description || "",
      dueDate: body.dueDate || null,
      status: "unpaid",
      createdAt: new Date(),
    })
    .returning()
  return NextResponse.json(result)
}
