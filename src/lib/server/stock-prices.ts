import { desc } from "drizzle-orm"
import { db } from "@/db"
import { stockPrices, stockTrades, stockWatchlist } from "@/db/schema"
import { calculateHoldings } from "../investments"
import { FinanceError, type FinanceErrorCode } from "../finance-errors"
import { getToday } from "../finance"
import { parseYahooDailyStockPrice } from "../stock-price-parser"

export async function refreshDailyStockPrices() {
  const [trades, watchlist, prices] = await Promise.all([
    db.select().from(stockTrades),
    db.select().from(stockWatchlist),
    db.select().from(stockPrices).orderBy(desc(stockPrices.date)),
  ])
  const symbols = [
    ...new Set([
      ...calculateHoldings(trades)
        .filter((item) => item.shares > 0)
        .map((item) => item.symbol),
      ...watchlist.map((item) => item.symbol),
    ]),
  ].sort()
  const latest = new Map<string, (typeof prices)[number]>()
  for (const price of prices)
    if (!latest.has(price.symbol)) latest.set(price.symbol, price)
  const failures: Array<{ symbol: string; code: FinanceErrorCode }> = []
  let updated = 0
  let cached = 0
  let pending = 0
  const startedAt = Date.now()
  for (const [index, symbol] of symbols.entries()) {
    if (Date.now() - startedAt >= 40_000) {
      pending = symbols.length - index
      break
    }
    const previous = latest.get(symbol)
    if (
      previous &&
      new Date(previous.fetchedAt).getTime() > Date.now() - 15 * 60 * 1000
    ) {
      cached++
      continue
    }
    try {
      const url = new URL(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.JK`,
      )
      url.search = new URLSearchParams({
        interval: "1d",
        range: "5d",
      }).toString()
      const response = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      })
      if (response.status === 429)
        throw new FinanceError("pricesRateLimited", 429)
      if (!response.ok) throw new FinanceError("serviceUnavailable", 502)
      const quote = parseYahooDailyStockPrice(
        await response.json(),
        symbol,
        getToday(),
      )
      await db
        .insert(stockPrices)
        .values(quote)
        .onConflictDoUpdate({
          target: [stockPrices.symbol, stockPrices.date],
          set: {
            price: quote.price,
            fetchedAt: new Date(),
            source: quote.source,
          },
        })
      updated++
    } catch (error) {
      const code =
        error instanceof FinanceError ? error.code : "serviceUnavailable"
      failures.push({ symbol, code })
      if (code === "pricesRateLimited") {
        pending = symbols.length - index - 1
        break
      }
    }
  }
  return { updated, cached, failures, pending }
}
