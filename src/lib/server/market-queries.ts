import { asc, desc, eq, inArray } from "drizzle-orm"
import { stockInstruments, stockPrices } from "@/db/schema"
import type { ReadConnection } from "./ledger"

export async function readLatestPrices(connection: ReadConnection, symbols: string[]) {
  const distinctSymbols = [...new Set(symbols)]
  if (!distinctSymbols.length) return []
  const instruments = connection
    .select({ symbol: stockInstruments.symbol })
    .from(stockInstruments)
    .where(inArray(stockInstruments.symbol, distinctSymbols))
    .as("symbols")
  const latest = connection
    .select()
    .from(stockPrices)
    .where(eq(stockPrices.symbol, instruments.symbol))
    .orderBy(desc(stockPrices.date))
    .limit(1)
    .as("latest_price")
  return connection
    .select({
      id: latest.id,
      symbol: latest.symbol,
      price: latest.price,
      date: latest.date,
      source: latest.source,
      fetchedAt: latest.fetchedAt,
    })
    .from(instruments)
    .innerJoinLateral(latest, eq(latest.symbol, instruments.symbol))
    .orderBy(asc(latest.symbol))
}
