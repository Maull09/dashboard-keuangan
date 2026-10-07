import { NextRequest, NextResponse } from "next/server"
import { goals } from "@/db/schema"
import { asc } from "drizzle-orm"
import { goalContributions } from "@/db/schema"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { parseGoal } from "@/lib/planning-validation"

export async function GET() {
  return authenticatedResponse(async (db) => {
    const [data, contributions] = await Promise.all([
      db.select().from(goals).orderBy(asc(goals.id)),
      db
        .select({
          goalId: goalContributions.goalId,
          amount: goalContributions.amount,
        })
        .from(goalContributions),
    ])
    const contributionTotals = new Map<number, number>()
    for (const contribution of contributions) {
      contributionTotals.set(
        contribution.goalId,
        (contributionTotals.get(contribution.goalId) ?? 0) +
          contribution.amount,
      )
    }
    return NextResponse.json(
      data.map((goal) => ({
        ...goal,
        currentAmount:
          goal.currentAmount + (contributionTotals.get(goal.id) ?? 0),
      })),
    )
  })
}

export async function POST(req: NextRequest) {
  return authenticatedResponse(async (db) => {
    const input = parseGoal(await req.json())
    const [result] = await db
      .insert(goals)
      .values({ ...input, currentAmount: 0 })
      .returning()
    return NextResponse.json(result, { status: 201 })
  })
}
