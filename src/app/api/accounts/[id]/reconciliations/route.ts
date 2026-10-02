import { desc, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { accounts, reconciliations, transactions } from "@/db/schema"
import { calculateAccountBalance } from "@/lib/calculations"
import { getToday, isDate } from "@/lib/finance"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: RouteContext) {
  const accountId = Number((await params).id)
  return NextResponse.json(await db.select().from(reconciliations).where(eq(reconciliations.accountId, accountId)).orderBy(desc(reconciliations.date)))
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const accountId = Number((await params).id)
  const body = await request.json()
  const actualBalance = Number(body.actualBalance)
  const date = typeof body.date === "string" ? body.date : getToday()

  if (!Number.isSafeInteger(accountId) || accountId <= 0 || !Number.isSafeInteger(actualBalance) || !isDate(date)) {
    return NextResponse.json({ error: "Data rekonsiliasi tidak valid" }, { status: 400 })
  }

  const [account] = await db.select().from(accounts).where(eq(accounts.id, accountId))
  if (!account) return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 })
  const accountTransactions = await db.select().from(transactions)
  const recordedBalance = calculateAccountBalance(account.initialBalance, accountId, accountTransactions)
  const [reconciliation] = await db.insert(reconciliations).values({ accountId, actualBalance, date, note: typeof body.note === "string" ? body.note.trim() : "" }).returning()

  return NextResponse.json({ ...reconciliation, recordedBalance, difference: actualBalance - recordedBalance }, { status: 201 })
}
