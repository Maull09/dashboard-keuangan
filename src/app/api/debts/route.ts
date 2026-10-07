import { NextRequest, NextResponse } from "next/server"
import { debtPayments, debts } from "@/db/schema"
import { asc } from "drizzle-orm"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { parseDebt } from "@/lib/planning-validation"

export async function GET() {
  return authenticatedResponse(async (db) => {
    const [data, payments] = await Promise.all([
      db.select().from(debts).orderBy(asc(debts.dueDate)),
      db
        .select({ debtId: debtPayments.debtId, amount: debtPayments.amount })
        .from(debtPayments),
    ])
    const paidByDebt = new Map<number, number>()
    for (const payment of payments)
      paidByDebt.set(
        payment.debtId,
        (paidByDebt.get(payment.debtId) ?? 0) + payment.amount,
      )
    return NextResponse.json(
      data.map((debt) => ({
        ...debt,
        paidAmount:
          paidByDebt.get(debt.id) ?? (debt.status === "paid" ? debt.amount : 0),
      })),
    )
  })
}

export async function POST(req: NextRequest) {
  return authenticatedResponse(async (db) => {
    const input = parseDebt(await req.json())
    const [result] = await db
      .insert(debts)
      .values({ ...input, status: "unpaid" })
      .returning()
    return NextResponse.json(result, { status: 201 })
  })
}
