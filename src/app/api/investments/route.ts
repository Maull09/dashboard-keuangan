import { NextResponse } from "next/server"
import { desc } from "drizzle-orm"
import { stockInstruments, stockPrices, stockWatchlist } from "@/db/schema"
import { calculateHoldings, investmentTotals } from "@/lib/investments"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { readLedger, readReservations } from "@/lib/server/ledger"

export async function GET() {
  return authenticatedResponse(async (db) => {
    const [ledger, reservations, instruments, prices, watchlist] =
      await Promise.all([
        readLedger(db),
        readReservations(db),
        db.select().from(stockInstruments),
        db.select().from(stockPrices).orderBy(desc(stockPrices.date)),
        db.select().from(stockWatchlist),
      ])
    const holdings = calculateHoldings(ledger.trades, prices)
    const latest = new Map<string, (typeof prices)[number]>()
    for (const price of prices)
      if (!latest.has(price.symbol)) latest.set(price.symbol, price)
    return NextResponse.json({
      holdings: holdings.map((holding) => ({
        ...holding,
        name:
          instruments.find((item) => item.symbol === holding.symbol)?.name ??
          holding.symbol,
        accountName:
          ledger.accounts.find((item) => item.id === holding.accountId)?.name ??
          "",
      })),
      totals: investmentTotals(holdings),
      trades: ledger.trades.sort(
        (a, b) => b.date.localeCompare(a.date) || b.id - a.id,
      ),
      accounts: ledger.summaries
        .filter((account) => account.type === "investment")
        .map((account) => ({
          ...account,
          availableCash:
            account.balance - (reservations.reserved.get(account.id) ?? 0),
        })),
      watchlist: watchlist.map((item) => ({
        ...item,
        name:
          instruments.find((instrument) => instrument.symbol === item.symbol)
            ?.name ?? item.symbol,
        quote: latest.get(item.symbol) ?? null,
      })),
    })
  })
}
