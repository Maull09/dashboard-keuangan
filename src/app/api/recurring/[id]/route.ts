import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { recurringTransactions } from "@/db/schema"
import { accountsExist } from "@/lib/accounts"
import { parseTransactionInput } from "@/lib/validation"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const id = Number((await params).id)
  const body = await request.json()
  const input = parseTransactionInput({ ...body, date: body.startDate })
  const name = typeof body.name === "string" ? body.name.trim() : ""

  if (!Number.isSafeInteger(id) || id <= 0 || !input || !name || !["weekly", "monthly"].includes(body.frequency) || !(await accountsExist(input.accountId, input.destinationAccountId))) {
    return NextResponse.json({ error: "Jadwal rutin tidak valid" }, { status: 400 })
  }

  const [recurring] = await db.update(recurringTransactions).set({ ...input, name, frequency: body.frequency, startDate: input.date, endDate: body.endDate || null }).where(eq(recurringTransactions.id, id)).returning()
  if (!recurring) return NextResponse.json({ error: "Jadwal rutin tidak ditemukan" }, { status: 404 })
  return NextResponse.json(recurring)
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const id = Number((await params).id)
  const [recurring] = await db.delete(recurringTransactions).where(eq(recurringTransactions.id, id)).returning()
  if (!recurring) return NextResponse.json({ error: "Jadwal rutin tidak ditemukan" }, { status: 404 })
  return NextResponse.json({ id })
}
