import { eq, or } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { accounts, transactions } from "@/db/schema"
import { parseAccountInput } from "@/lib/validation"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const id = Number((await params).id)
  const input = parseAccountInput(await request.json())
  if (!Number.isSafeInteger(id) || id <= 0 || !input) return NextResponse.json({ error: "Data akun tidak valid" }, { status: 400 })
  const [account] = await db.update(accounts).set(input).where(eq(accounts.id, id)).returning()
  if (!account) return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 })
  return NextResponse.json(account)
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const id = Number((await params).id)
  const [relatedTransaction] = await db.select({ id: transactions.id }).from(transactions).where(or(eq(transactions.accountId, id), eq(transactions.destinationAccountId, id))).limit(1)
  if (relatedTransaction) return NextResponse.json({ error: "Akun yang memiliki transaksi tidak dapat dihapus" }, { status: 409 })
  const [account] = await db.delete(accounts).where(eq(accounts.id, id)).returning()
  if (!account) return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 })
  return NextResponse.json({ id })
}
