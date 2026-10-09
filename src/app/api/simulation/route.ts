import { NextRequest, NextResponse } from "next/server"
import { recurringTransactions } from "@/db/schema"
import { and, lte, gte, isNull, or } from "drizzle-orm"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { parseSimulation } from "@/lib/planning-validation"
import { simulateCashflow } from "@/lib/planning"
import { getToday } from "@/lib/finance"
import { readBalanceLedger } from "@/lib/server/financial-queries"

export async function GET(request: Request) {
  return authenticatedResponse(async (db) => {
    const ledger = await readBalanceLedger(db)
    return NextResponse.json({ currentBalance: ledger.cashBalance })
  }, request)
}

export async function POST(request: NextRequest) {
  return authenticatedResponse(async (db) => {
    const input = parseSimulation(await request.json())
    const today = getToday()
    const [ledger, schedules] = await Promise.all([
      readBalanceLedger(db),
      db.select().from(recurringTransactions).where(and(
        lte(recurringTransactions.startDate, input.endDate),
        or(isNull(recurringTransactions.endDate), gte(recurringTransactions.endDate, today)),
      )),
    ])
    return NextResponse.json({
      ...input,
      ...simulateCashflow(
        ledger.cashBalance,
        schedules,
        today,
        input.endDate,
        input.extraIncomes,
        input.extraExpenses,
      ),
    })
  })
}
