import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { accounts, recurringTransactions, transactions } from "@/db/schema"
import { calculateForecast } from "@/lib/calculations"
import { getToday, isDate } from "@/lib/finance"

export async function GET(request: NextRequest) {
  const payday = new URL(request.url).searchParams.get("payday")
  const today = getToday()

  if (!isDate(payday) || payday < today) {
    return NextResponse.json({ error: "Tanggal gajian harus hari ini atau setelahnya" }, { status: 400 })
  }

  const [allAccounts, allTransactions, recurring] = await Promise.all([
    db.select().from(accounts),
    db.select().from(transactions),
    db.select().from(recurringTransactions),
  ])
  const currentBalance = allAccounts.reduce((total, account) => total + account.initialBalance, 0) + calculateForecast(0, allTransactions)
  const scheduled = recurring.filter((item) => item.startDate <= payday && (!item.endDate || item.endDate >= today))
  const forecastBalance = calculateForecast(currentBalance, scheduled)

  return NextResponse.json({ payday, currentBalance, forecastBalance, scheduled })
}
