import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { budgets } from "@/db/schema"
import { parseBudgetInput } from "@/lib/validation"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const id = Number((await params).id)
  const input = parseBudgetInput(await request.json())
  if (!Number.isSafeInteger(id) || id <= 0 || !input) return NextResponse.json({ error: "Data anggaran tidak valid" }, { status: 400 })
  const [budget] = await db.update(budgets).set(input).where(eq(budgets.id, id)).returning()
  if (!budget) return NextResponse.json({ error: "Anggaran tidak ditemukan" }, { status: 404 })
  return NextResponse.json(budget)
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const id = Number((await params).id)
  const [budget] = await db.delete(budgets).where(eq(budgets.id, id)).returning()
  if (!budget) return NextResponse.json({ error: "Anggaran tidak ditemukan" }, { status: 404 })
  return NextResponse.json({ id })
}
