import { NextResponse } from "next/server"
import { debts, debtPayments, stockPrices } from "@/db/schema"
import { calculateHoldings, investmentTotals } from "@/lib/investments"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { readLedger, readReservations } from "@/lib/server/ledger"

export async function GET() {
  return authenticatedResponse(async (db) => {
    const [ledger, reservations, allDebts, payments, prices] =
      await Promise.all([
        readLedger(db),
        readReservations(db),
        db.select().from(debts),
        db.select().from(debtPayments),
        db.select().from(stockPrices),
      ])
    const holdings = calculateHoldings(ledger.trades, prices)
    const investments = investmentTotals(holdings)
    const balances = allDebts.map((debt) => ({
      ...debt,
      remaining: Math.max(
        0,
        debt.amount -
          payments
            .filter((payment) => payment.debtId === debt.id)
            .reduce((total, payment) => total + payment.amount, 0),
      ),
    }))
    const liabilities = balances
      .filter((debt) => debt.type === "utang")
      .reduce((total, debt) => total + debt.remaining, 0)
    const receivables = balances
      .filter((debt) => debt.type === "piutang")
      .reduce((total, debt) => total + debt.remaining, 0)
    const reservedCash = [...reservations.reserved.values()].reduce(
      (total, amount) => total + amount,
      0,
    )
    const knownNetWorth =
      ledger.cashBalance +
      investments.knownMarketValue +
      receivables -
      liabilities
    return NextResponse.json({
      cash: ledger.cashBalance,
      investments,
      liabilities,
      receivables,
      reservedCash,
      availableCash: ledger.cashBalance - reservedCash,
      knownNetWorth,
      netWorth: investments.unpricedCount ? null : knownNetWorth,
      accounts: ledger.summaries,
      holdings,
      debts: balances,
    })
  })
}
