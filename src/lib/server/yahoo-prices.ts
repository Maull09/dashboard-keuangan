import YahooFinance from "yahoo-finance2"
import { FinanceError } from "../finance-errors"
import { parseDailyStockPrice } from "../stock-price-parser"
import { symbolInput } from "../planning-validation"

const yahoo = new YahooFinance({
  queue: { concurrency: 1, interval: 250 },
  suppressNotices: ["yahooSurvey"],
  validation: { logErrors: false, logOptionsErrors: false },
  versionCheck: false,
  fetch: async (input, options) => {
    const response = await fetch(input, { ...options, cache: "no-store" })
    if (response.status === 429)
      throw new FinanceError("pricesRateLimited", 429)
    if (response.status === 401 || response.status === 403)
      throw new FinanceError("priceAccessRequired", 502)
    if (response.status === 404)
      throw new FinanceError("invalidMarketPrice", 502)
    if (!response.ok) throw new FinanceError("marketDataUnavailable", 502)
    return response
  },
})

export async function readYahooDailyPrice(symbol: string, now = new Date()) {
  const normalizedSymbol = symbolInput(symbol)
  const ticker = `${normalizedSymbol}.JK`
  try {
    const data = await yahoo.chart(
      ticker,
      {
        period1: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        period2: now,
        interval: "1d",
        includePrePost: false,
      },
      { fetchOptions: { signal: AbortSignal.timeout(15000) } },
    )
    return parseDailyStockPrice(data, normalizedSymbol, now)
  } catch (error) {
    if (error instanceof FinanceError) throw error
    throw new FinanceError("marketDataUnavailable", 502)
  }
}
