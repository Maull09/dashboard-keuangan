import { NextRequest, NextResponse } from "next/server"
import { goals } from "@/db/schema"
import { goalSummaryQuery } from "@/lib/server/financial-queries"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { parseGoal } from "@/lib/planning-validation"

export async function GET() {
  return authenticatedResponse(async (db) => {
    return NextResponse.json(await goalSummaryQuery(db))
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
