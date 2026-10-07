import { NextRequest, NextResponse } from "next/server"
import { recurringTransactions } from "@/db/schema"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { parseSimulation } from "@/lib/planning-validation"
import { simulateCashflow } from "@/lib/planning"
import { getToday } from "@/lib/finance"
import { readLedger } from "@/lib/server/ledger"

export async function GET() {
  return authenticatedResponse(async (db) => {
    const ledger = await readLedger(db)
    return NextResponse.json({ currentBalance: ledger.cashBalance })
  })
}

export async function POST(request: NextRequest) {
  return authenticatedResponse(async (db) => {
    const input = parseSimulation(await request.json())
    const [ledger, schedules] = await Promise.all([
      readLedger(db),
      db.select().from(recurringTransactions),
    ])
    return NextResponse.json({
      ...input,
      ...simulateCashflow(
        ledger.cashBalance,
        schedules,
        getToday(),
        input.endDate,
        input.extraIncomes,
        input.extraExpenses,
      ),
    })
  })
}
