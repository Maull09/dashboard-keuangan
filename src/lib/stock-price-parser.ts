import { isDate } from "./finance"
import { FinanceError } from "./finance-errors"

export function parseDailyStockPrice(
  value: unknown,
  symbol: string,
  today: string,
) {
  if (!value || typeof value !== "object")
    throw new FinanceError("invalidMarketPrice", 502)
  const data = value as {
    status?: string
    code?: number
    meta?: {
      symbol?: string
      mic_code?: string
      currency?: string
      interval?: string
    }
    values?: Array<{ close?: string; datetime?: string }>
  }
  if (data.status === "error") {
    if (data.code === 401 || data.code === 403)
      throw new FinanceError("priceAccessRequired", 503)
    if (data.code === 429) throw new FinanceError("pricesRateLimited", 429)
    throw new FinanceError("invalidMarketPrice", 502)
  }
  const price = Number(data.values?.[0]?.close)
  const date = data.values?.[0]?.datetime
  if (
    data.meta?.symbol !== symbol ||
    data.meta.mic_code !== "XIDX" ||
    data.meta.currency !== "IDR" ||
    data.meta.interval !== "1day" ||
    !Number.isSafeInteger(price) ||
    price <= 0 ||
    price > 1_000_000_000 ||
    !isDate(date) ||
    date > today ||
    date < "1900-01-01"
  )
    throw new FinanceError("invalidMarketPrice", 502)
  return { symbol, price, date, source: "Twelve Data" }
}
