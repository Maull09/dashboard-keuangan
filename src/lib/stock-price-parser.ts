import { isDate } from "./finance"
import { FinanceError } from "./finance-errors"

function jakartaDate(timestamp: number) {
  const values = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(timestamp * 1000))
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    values.find((value) => value.type === type)?.value
  return `${part("year")}-${part("month")}-${part("day")}`
}

export function parseYahooDailyStockPrice(
  value: unknown,
  symbol: string,
  today: string,
) {
  if (!value || typeof value !== "object")
    throw new FinanceError("invalidMarketPrice", 502)
  const data = value as {
    chart?: {
      error?: unknown
      result?: Array<{
        meta?: {
          symbol?: string
          currency?: string
          exchangeName?: string
          instrumentType?: string
          dataGranularity?: string
        }
        timestamp?: unknown[]
        indicators?: { quote?: Array<{ close?: unknown[] }> }
      }>
    }
  }
  const quote = data.chart?.result?.[0]
  const meta = quote?.meta
  const timestamps = quote?.timestamp
  const closes = quote?.indicators?.quote?.[0]?.close
  if (
    data.chart?.error ||
    meta?.symbol !== `${symbol}.JK` ||
    meta.currency !== "IDR" ||
    meta.exchangeName !== "JKT" ||
    meta.instrumentType !== "EQUITY" ||
    meta.dataGranularity !== "1d" ||
    !Array.isArray(timestamps) ||
    !Array.isArray(closes) ||
    timestamps.length !== closes.length
  )
    throw new FinanceError("invalidMarketPrice", 502)

  for (let index = closes.length - 1; index >= 0; index--) {
    const timestamp = timestamps[index]
    const price = closes[index]
    if (price === null) continue
    if (
      typeof timestamp !== "number" ||
      typeof price !== "number" ||
      !Number.isSafeInteger(timestamp) ||
      !Number.isSafeInteger(price)
    )
      throw new FinanceError("invalidMarketPrice", 502)
    const date = jakartaDate(timestamp)
    if (
      price <= 0 ||
      price > 1_000_000_000 ||
      !isDate(date) ||
      date > today ||
      date < "1900-01-01"
    )
      throw new FinanceError("invalidMarketPrice", 502)
    return { symbol, price, date, source: "Yahoo Finance" }
  }
  throw new FinanceError("invalidMarketPrice", 502)
}
