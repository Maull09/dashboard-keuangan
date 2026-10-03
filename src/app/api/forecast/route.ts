import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { recurringTransactions } from "@/db/schema"
import { calculateForecast } from "@/lib/calculations"
import { getToday, isDate } from "@/lib/finance"
import { readLedger } from "@/lib/server/ledger"
import { scheduleOccurrences } from "@/lib/planning"

export async function GET(request: NextRequest) {
  const payday = new URL(request.url).searchParams.get("payday")
  const today = getToday()

  if (!isDate(payday) || payday < today) {
    return NextResponse.json(
      { error: "Tanggal gajian harus hari ini atau setelahnya" },
      { status: 400 },
    )
  }

  const [ledger, recurring] = await Promise.all([
    readLedger(),
    db.select().from(recurringTransactions),
  ])
  const currentBalance = ledger.cashBalance
  const scheduled = recurring.flatMap((item) =>
    scheduleOccurrences(item, today, payday),
  )
  const forecastBalance = calculateForecast(
    currentBalance,
    scheduled.map((item) => ({
      ...item,
      type: item.type as "income" | "expense" | "transfer",
    })),
  )

  return NextResponse.json({
    payday,
    currentBalance,
    forecastBalance,
    scheduled,
  })
}
