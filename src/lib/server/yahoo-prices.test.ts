import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { readYahooDailyPrice } from "./yahoo-prices"

const now = new Date("2026-10-04T02:00:00Z")
const body = {
  chart: {
    error: null,
    result: [
      {
        meta: {
          currency: "IDR",
          symbol: "BNBR.JK",
          exchangeName: "JKT",
          instrumentType: "EQUITY",
          firstTradeDate: 631152000,
          regularMarketTime: 1790931600,
          gmtoffset: 25200,
          timezone: "WIB",
          exchangeTimezoneName: "Asia/Jakarta",
          regularMarketPrice: 99,
          priceHint: 0,
          currentTradingPeriod: {
            pre: {
              timezone: "WIB",
              start: 1790906400,
              end: 1790906400,
              gmtoffset: 25200,
            },
            regular: {
              timezone: "WIB",
              start: 1790906400,
              end: 1790932500,
              gmtoffset: 25200,
            },
            post: {
              timezone: "WIB",
              start: 1790932500,
              end: 1790932500,
              gmtoffset: 25200,
            },
          },
          dataGranularity: "1d",
          range: "1mo",
          validRanges: ["1mo"],
        },
        timestamp: [1790906400],
        indicators: {
          quote: [
            { open: [98], high: [100], low: [97], close: [99], volume: [1000] },
          ],
        },
      },
    ],
  },
}

describe("Yahoo daily price requests", () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal("fetch", fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())
  it("maps BEI symbols to .JK and fetches daily closes without a key", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(body)))
    expect(await readYahooDailyPrice("BNBR", now)).toEqual({
      symbol: "BNBR",
      price: 99,
      date: "2026-10-02",
      source: "Yahoo Finance",
    })
    const [input, options] = fetchMock.mock.calls[0]
    const url = new URL(String(input))
    expect(url.pathname).toBe("/v8/finance/chart/BNBR.JK")
    expect(url.searchParams.get("interval")).toBe("1d")
    expect(url.searchParams.has("apikey")).toBe(false)
    expect(options.cache).toBe("no-store")
    expect(options.signal).toBeInstanceOf(AbortSignal)
  })
  it.each([
    [401, "priceAccessRequired"],
    [403, "priceAccessRequired"],
    [404, "invalidMarketPrice"],
    [429, "pricesRateLimited"],
    [500, "marketDataUnavailable"],
  ])("sanitizes HTTP %s as a market-data failure", async (status, code) => {
    fetchMock.mockResolvedValue(
      new Response("private provider response", { status: Number(status) }),
    )
    await expect(readYahooDailyPrice("BNBR", now)).rejects.toMatchObject({
      code,
    })
  })
  it.each([
    new TypeError("private network response"),
    new DOMException("private timeout", "TimeoutError"),
  ])("sanitizes network/timeout errors", async (error) => {
    fetchMock.mockRejectedValue(error)
    await expect(readYahooDailyPrice("BNBR", now)).rejects.toThrow(
      "marketDataUnavailable",
    )
  })
  it("rejects malformed and wrong-market results", async () => {
    fetchMock.mockResolvedValue(new Response("not JSON"))
    await expect(readYahooDailyPrice("BNBR", now)).rejects.toThrow(
      "marketDataUnavailable",
    )
    const invalid = structuredClone(body)
    invalid.chart.result[0].meta.currency = "USD"
    fetchMock.mockResolvedValue(new Response(JSON.stringify(invalid)))
    await expect(readYahooDailyPrice("BNBR", now)).rejects.toThrow(
      "invalidMarketPrice",
    )
  })
  it("rejects invalid tickers before sending a request", async () => {
    await expect(readYahooDailyPrice("../BNBR", now)).rejects.toThrow(
      "invalidInput",
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
