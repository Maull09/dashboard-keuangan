import { NextRequest, NextResponse } from "next/server"
import { debts } from "@/db/schema"
import { debtSummaryQuery } from "@/lib/server/financial-queries"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { parseDebt } from "@/lib/planning-validation"

export async function GET(request: Request) {
  return authenticatedResponse(async (db) => {
    return NextResponse.json(
      (await debtSummaryQuery(db)).map((row) => {
        const debt: Omit<typeof row, "remaining"> & { remaining?: number } = { ...row }
        delete debt.remaining
        return debt
      }),
    )
  }, request)
}

export async function POST(req: NextRequest) {
  return authenticatedResponse(async (db) => {
    const input = parseDebt(await req.json())
    const [result] = await db
      .insert(debts)
      .values({ ...input, status: "unpaid" })
      .returning()
    return NextResponse.json(result, { status: 201 })
  })
}
