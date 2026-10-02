import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { goals } from "@/db/schema"
import { asc } from "drizzle-orm"
import { goalContributions } from "@/db/schema"


export async function GET() {
  const [data, contributions] = await Promise.all([
    db.select().from(goals).orderBy(asc(goals.id)),
    db.select({ goalId: goalContributions.goalId, amount: goalContributions.amount }).from(goalContributions),
  ])
  const contributionTotals = new Map<number, number>()
  for (const contribution of contributions) {
    contributionTotals.set(contribution.goalId, (contributionTotals.get(contribution.goalId) ?? 0) + contribution.amount)
  }
  return NextResponse.json(data.map((goal) => ({ ...goal, currentAmount: goal.currentAmount + (contributionTotals.get(goal.id) ?? 0) })))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const targetAmount = Number(body.targetAmount)
  if (typeof body.title !== "string" || !body.title.trim() || !Number.isSafeInteger(targetAmount) || targetAmount <= 0 || typeof body.targetDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.targetDate)) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 })
  }

  const [result] = await db
    .insert(goals)
    .values({
      title: body.title.trim(),
      description: body.description || "",
      targetAmount,
      currentAmount: 0,
      targetDate: body.targetDate,
      category: body.category || "other",
      createdAt: new Date(),
    })
    .returning()

  return NextResponse.json(result)
}
