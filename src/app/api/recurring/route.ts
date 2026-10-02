import { asc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { recurringTransactions } from "@/db/schema"
import { accountsExist } from "@/lib/accounts"
import { parseTransactionInput } from "@/lib/validation"

export async function GET() {
  return NextResponse.json(await db.select().from(recurringTransactions).orderBy(asc(recurringTransactions.startDate)))
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const transaction = parseTransactionInput({ ...body, date: body.startDate })
  const frequency = body.frequency
  const name = typeof body.name === "string" ? body.name.trim() : ""

  if (!transaction || !name || !["weekly", "monthly"].includes(frequency) || !(await accountsExist(transaction.accountId, transaction.destinationAccountId))) {
    return NextResponse.json({ error: "Jadwal rutin tidak valid" }, { status: 400 })
  }

  const [recurring] = await db.insert(recurringTransactions).values({
    ...transaction,
    name,
    frequency,
    startDate: transaction.date,
    endDate: typeof body.endDate === "string" && body.endDate ? body.endDate : null,
  }).returning()

  return NextResponse.json(recurring, { status: 201 })
}
