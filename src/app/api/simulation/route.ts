import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { recurringTransactions } from "@/db/schema"
import { financeResponse } from "@/lib/api-response"
import { parseSimulation } from "@/lib/planning-validation"
import { simulateCashflow } from "@/lib/planning"
import { getToday } from "@/lib/finance"
import { readLedger } from "@/lib/server/ledger"

export async function POST(request: NextRequest) {
  return financeResponse(async () => {
    const input = parseSimulation(await request.json())
    const [ledger, schedules] = await Promise.all([
      readLedger(),
      db.select().from(recurringTransactions),
    ])
    return NextResponse.json({
      ...input,
      ...simulateCashflow(
        ledger.cashBalance,
        schedules,
        getToday(),
        input.endDate,
        input.extraExpenses,
      ),
    })
  })
}
