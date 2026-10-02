import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { recurringTransactions, transactions } from "@/db/schema"
import { getToday } from "@/lib/finance"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_: NextRequest, { params }: RouteContext) {
  const id = Number((await params).id)
  const [recurring] = await db.select().from(recurringTransactions).where(eq(recurringTransactions.id, id))
  if (!recurring) return NextResponse.json({ error: "Jadwal rutin tidak ditemukan" }, { status: 404 })

  const today = getToday()
  const [transaction] = await db.insert(transactions).values({
    type: recurring.type,
    amount: recurring.amount,
    category: recurring.category,
    description: recurring.description,
    date: today,
    accountId: recurring.accountId,
    destinationAccountId: recurring.destinationAccountId,
  }).returning()
  await db.update(recurringTransactions).set({ lastExecutedDate: today }).where(eq(recurringTransactions.id, id))

  return NextResponse.json(transaction, { status: 201 })
}
