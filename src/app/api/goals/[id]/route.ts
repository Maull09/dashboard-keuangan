import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { goals } from "@/db/schema"
import { eq } from "drizzle-orm"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const body = await req.json()
  const id = Number((await params).id)
  if (!Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(body.currentAmount) || body.currentAmount < 0) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 })
  }

  const [result] = await db
    .update(goals)
    .set({ currentAmount: body.currentAmount })
    .where(eq(goals.id, id))
    .returning()

  return NextResponse.json(result)
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const id = Number((await params).id)
  const [goal] = await db.delete(goals).where(eq(goals.id, id)).returning()
  if (!goal) return NextResponse.json({ error: "Tujuan tidak ditemukan" }, { status: 404 })
  return NextResponse.json({ id })
}
