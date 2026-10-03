import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { accounts, sinkingFunds } from "@/db/schema"
import { financeResponse } from "@/lib/api-response"
import { FinanceError } from "@/lib/finance-errors"
import { parseFund } from "@/lib/planning-validation"
import { fundBalance, monthlyFundSaving } from "@/lib/planning"
import { getToday } from "@/lib/finance"
import { readLedger, readReservations } from "@/lib/server/ledger"

export async function GET() {
  return financeResponse(async () => {
    const [ledger, reservations] = await Promise.all([
      readLedger(),
      readReservations(),
    ])
    return NextResponse.json({
      funds: reservations.funds.map((fund) => {
        const entries = reservations.entries
          .filter((entry) => entry.fundId === fund.id)
          .sort((a, b) => b.id - a.id)
        const allocated = fundBalance(entries)
        return {
          ...fund,
          allocated,
          monthlySaving: monthlyFundSaving(
            fund.targetAmount,
            allocated,
            fund.targetDate,
            getToday(),
          ),
          entries,
        }
      }),
      accounts: ledger.summaries.map((account) => ({
        ...account,
        availableCash:
          account.balance - (reservations.reserved.get(account.id) ?? 0),
      })),
    })
  })
}

export async function POST(request: NextRequest) {
  return financeResponse(async () => {
    const input = parseFund(await request.json())
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, input.accountId))
    if (!account) throw new FinanceError("recordMissing", 404)
    const [fund] = await db.insert(sinkingFunds).values(input).returning()
    return NextResponse.json(fund, { status: 201 })
  })
}
