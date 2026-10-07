import { desc, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import {
  accounts,
  reconciliations,
  transactions,
  stockTrades,
} from "@/db/schema"
import { calculateAccountBalance } from "@/lib/calculations"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { getToday, isDate } from "@/lib/finance"
import { tradeCashChange } from "@/lib/investments"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: RouteContext) {
  return authenticatedResponse(async (db) => {
    const accountId = Number((await params).id)
    const data = await db
      .select()
      .from(reconciliations)
      .where(eq(reconciliations.accountId, accountId))
      .orderBy(desc(reconciliations.date))
    return NextResponse.json(data)
  })
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  return authenticatedResponse(async (db) => {
    const accountId = Number((await params).id)
    const body = await request.json()
    const actualBalance = Number(body.actualBalance)
    const date = typeof body.date === "string" ? body.date : getToday()

    if (
      !Number.isSafeInteger(accountId) ||
      accountId <= 0 ||
      !Number.isSafeInteger(actualBalance) ||
      !isDate(date)
    )
      return NextResponse.json({ code: "invalidInput" }, { status: 400 })

    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId))
    if (!account)
      return NextResponse.json({ code: "recordMissing" }, { status: 404 })
    const [accountTransactions, trades] = await Promise.all([
      db.select().from(transactions),
      db.select().from(stockTrades).where(eq(stockTrades.accountId, accountId)),
    ])
    const recordedBalance =
      calculateAccountBalance(
        account.initialBalance,
        accountId,
        accountTransactions.filter((item) => item.date <= date),
      ) +
      trades
        .filter((trade) => trade.date <= date)
        .reduce((total, trade) => total + tradeCashChange(trade), 0)
    const [reconciliation] = await db
      .insert(reconciliations)
      .values({
        accountId,
        actualBalance,
        date,
        note: typeof body.note === "string" ? body.note.trim() : "",
      })
      .returning()

    return NextResponse.json(
      {
        ...reconciliation,
        recordedBalance,
        difference: actualBalance - recordedBalance,
      },
      { status: 201 },
    )
  })
}
