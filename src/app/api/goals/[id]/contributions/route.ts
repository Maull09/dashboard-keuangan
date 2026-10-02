import { asc, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { goalContributions, goals } from "@/db/schema"
import { accountsExist } from "@/lib/accounts"
import { getToday, isDate } from "@/lib/finance"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: RouteContext) {
  const id = Number((await params).id)
  return NextResponse.json(await db.select().from(goalContributions).where(eq(goalContributions.goalId, id)).orderBy(asc(goalContributions.date)))
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const goalId = Number((await params).id)
  const body = await request.json()
  const amount = Number(body.amount)
  const accountId = Number(body.accountId)
  const date = typeof body.date === "string" ? body.date : getToday()

  if (!Number.isSafeInteger(goalId) || !Number.isSafeInteger(amount) || amount <= 0 || !Number.isSafeInteger(accountId) || accountId <= 0 || !isDate(date) || !(await accountsExist(accountId, null))) {
    return NextResponse.json({ error: "Kontribusi tidak valid" }, { status: 400 })
  }

  const [goal] = await db.select().from(goals).where(eq(goals.id, goalId))
  if (!goal) return NextResponse.json({ error: "Tujuan tidak ditemukan" }, { status: 404 })
  const contributions = await db.select({ amount: goalContributions.amount }).from(goalContributions).where(eq(goalContributions.goalId, goalId))
  const currentAmount = goal.currentAmount + contributions.reduce((total, contribution) => total + contribution.amount, 0)
  if (currentAmount + amount > goal.targetAmount) return NextResponse.json({ error: "Kontribusi melebihi target tujuan" }, { status: 400 })

  const [contribution] = await db.insert(goalContributions).values({ goalId, accountId, amount, date, note: typeof body.note === "string" ? body.note.trim() : "" }).returning()
  return NextResponse.json(contribution, { status: 201 })
}
