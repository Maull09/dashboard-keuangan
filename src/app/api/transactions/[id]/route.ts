import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { transactions } from "@/db/schema"
import { accountsExist } from "@/lib/accounts"
import { parseTransactionInput } from "@/lib/validation"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const id = Number((await params).id)
  const input = parseTransactionInput(await request.json())

  if (!Number.isSafeInteger(id) || id <= 0 || !input || !(await accountsExist(input.accountId, input.destinationAccountId))) {
    return NextResponse.json({ error: "Data transaksi tidak valid" }, { status: 400 })
  }

  const [transaction] = await db.update(transactions).set(input).where(eq(transactions.id, id)).returning()

  if (!transaction) return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 })
  return NextResponse.json(transaction)
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const id = Number((await params).id)

  if (!Number.isSafeInteger(id) || id <= 0) {
    return NextResponse.json({ error: "ID transaksi tidak valid" }, { status: 400 })
  }

  const [transaction] = await db.delete(transactions).where(eq(transactions.id, id)).returning()
  if (!transaction) return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 })

  return NextResponse.json({ id })
}
