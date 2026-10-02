import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { debts } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getToday } from "@/lib/finance"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const body = await req.json()
  const id = Number((await params).id)
  if (!Number.isSafeInteger(id) || id <= 0 || !["paid", "unpaid"].includes(body.status)) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 })
  }
  const [result] = await db
    .update(debts)
    .set({
      status: body.status,
      paidDate: body.status === "paid" ? getToday() : null,
    })
    .where(eq(debts.id, id))
    .returning()
  return NextResponse.json(result)
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const id = Number((await params).id)
  const [debt] = await db.delete(debts).where(eq(debts.id, id)).returning()
  if (!debt) return NextResponse.json({ error: "Utang/piutang tidak ditemukan" }, { status: 404 })
  return NextResponse.json({ id })
}
