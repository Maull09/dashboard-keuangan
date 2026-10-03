import { FinanceError } from "./finance-errors"

function jakartaDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

export function parseDailyStockPrice(
  value: unknown,
  symbol: string,
  now = new Date(),
) {
  if (!value || typeof value !== "object")
    throw new FinanceError("invalidMarketPrice", 502)
  const data = value as {
    meta?: {
      symbol?: string
      exchangeName?: string
      exchangeTimezoneName?: string
      instrumentType?: string
      currency?: string
      dataGranularity?: string
      currentTradingPeriod?: { regular?: { start?: Date; end?: Date } }
    }
    quotes?: Array<{ close?: number | null; date?: Date }>
  }
  if (
    data.meta?.symbol !== `${symbol}.JK` ||
    data.meta.exchangeName !== "JKT" ||
    data.meta.exchangeTimezoneName !== "Asia/Jakarta" ||
    data.meta.instrumentType !== "EQUITY" ||
    data.meta.currency !== "IDR" ||
    data.meta.dataGranularity !== "1d" ||
    !Array.isArray(data.quotes)
  )
    throw new FinanceError("invalidMarketPrice", 502)

  const today = jakartaDate(now)
  const session = data.meta.currentTradingPeriod?.regular
  let latest: { price: number; date: string } | undefined
  for (const quote of data.quotes) {
    if (
      !(quote?.date instanceof Date) ||
      !Number.isFinite(quote.date.getTime())
    )
      throw new FinanceError("invalidMarketPrice", 502)
    const date = jakartaDate(quote.date)
    if (quote.date > now || date > today || date < "1900-01-01")
      throw new FinanceError("invalidMarketPrice", 502)
    if (quote.close == null) continue
    if (date === today) {
      // Daily bars can contain an intraday price. Allow delayed data to settle.
      if (
        !(session?.start instanceof Date) ||
        !(session.end instanceof Date) ||
        !Number.isFinite(session.start.getTime()) ||
        !Number.isFinite(session.end.getTime()) ||
        session.end <= session.start ||
        jakartaDate(session.start) !== today ||
        now.getTime() < session.end.getTime() + 15 * 60 * 1000
      )
        continue
    }
    const price = quote.close
    if (
      typeof price !== "number" ||
      !Number.isSafeInteger(price) ||
      price <= 0 ||
      price > 1_000_000_000
    )
      throw new FinanceError("invalidMarketPrice", 502)
    if (!latest || date > latest.date) latest = { price, date }
  }
  if (!latest) throw new FinanceError("invalidMarketPrice", 502)
  return { symbol, ...latest, source: "Yahoo Finance" }
}
