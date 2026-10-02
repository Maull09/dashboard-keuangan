import { count, desc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { transactions } from "@/db/schema"
import { accountsExist } from "@/lib/accounts"
import { parseTransactionInput } from "@/lib/validation"

export async function GET(request: NextRequest) {
  const pageValue = Number(new URL(request.url).searchParams.get("page"))
  const limitValue = Number(new URL(request.url).searchParams.get("limit"))

  if (!Number.isSafeInteger(pageValue) || pageValue < 1) {
    const data = await db.select().from(transactions).orderBy(desc(transactions.date), desc(transactions.id))
    return NextResponse.json(data)
  }

  const limit = Number.isSafeInteger(limitValue) ? Math.min(Math.max(limitValue, 1), 100) : 25
  const [{ total }] = await db.select({ total: count() }).from(transactions)
  const items = await db.select().from(transactions).orderBy(desc(transactions.date), desc(transactions.id)).limit(limit).offset((pageValue - 1) * limit)

  return NextResponse.json({ items, page: pageValue, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) })
}
export async function POST(request: NextRequest) {
  const input = parseTransactionInput(await request.json())

  if (!input || !(await accountsExist(input.accountId, input.destinationAccountId))) {
    return NextResponse.json({ error: "Data transaksi tidak valid" }, { status: 400 })
  }

  const [transaction] = await db.insert(transactions).values(input).returning()
  return NextResponse.json(transaction, { status: 201 })
}
