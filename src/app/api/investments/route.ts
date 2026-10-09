import { NextResponse } from "next/server"
import { desc, inArray } from "drizzle-orm"
import { stockInstruments, stockTrades, stockWatchlist } from "@/db/schema"
import { calculateHoldings, investmentTotals } from "@/lib/investments"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { readBalanceLedger, readReservedCash } from "@/lib/server/financial-queries"
import { readLatestPrices } from "@/lib/server/market-queries"

export async function GET(request: Request) {
  return authenticatedResponse(async (db) => {
    const [ledger, reservations, trades, watchlist] =
      await Promise.all([
        readBalanceLedger(db),
        readReservedCash(db),
        db.select().from(stockTrades).orderBy(desc(stockTrades.date), desc(stockTrades.id)),
        db.select().from(stockWatchlist),
      ])
    const symbols = [...new Set([...trades, ...watchlist].map((item) => item.symbol))]
    const [instruments, prices] = await Promise.all([
      symbols.length ? db.select().from(stockInstruments).where(inArray(stockInstruments.symbol, symbols)) : [],
      readLatestPrices(db, symbols),
    ])
    const holdings = calculateHoldings(trades, prices)
    const instrumentNames = new Map(instruments.map((item) => [item.symbol, item.name]))
    const accountNames = new Map(ledger.accounts.map((item) => [item.id, item.name]))
    const latest = new Map<string, (typeof prices)[number]>()
    for (const price of prices)
      if (!latest.has(price.symbol)) latest.set(price.symbol, price)
    return NextResponse.json({
      holdings: holdings.map((holding) => ({
        ...holding,
        name:
          instrumentNames.get(holding.symbol) ??
          holding.symbol,
        accountName:
          accountNames.get(holding.accountId) ??
          "",
      })),
      totals: investmentTotals(holdings),
      trades,
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
          instrumentNames.get(item.symbol) ?? item.symbol,
        quote: latest.get(item.symbol) ?? null,
      })),
    })
  }, request)
}
