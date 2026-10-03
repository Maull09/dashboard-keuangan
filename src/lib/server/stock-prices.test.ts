import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { stockPrices, stockTrades, stockWatchlist } from "@/db/schema"
import { FinanceError } from "../finance-errors"
import { refreshDailyStockPrices } from "./stock-prices"

const state = vi.hoisted(() => ({
  watchlist: [] as Array<{ symbol: string }>,
  prices: [] as Array<{
    symbol: string
    price: number
    date: string
    source: string
    fetchedAt: Date
  }>,
  writes: [] as Array<{
    symbol: string
    price: number
    date: string
    source: string
  }>,
  writeError: false,
  readPrice: vi.fn(),
}))
vi.mock("./yahoo-prices", () => ({ readYahooDailyPrice: state.readPrice }))
vi.mock("@/db", () => ({
  db: {
    select: () => ({
      from: (table: unknown) => {
        if (table === stockTrades) return Promise.resolve([])
        if (table === stockWatchlist) return Promise.resolve(state.watchlist)
        if (table === stockPrices)
          return { orderBy: () => Promise.resolve(state.prices) }
        throw new Error("Unexpected read")
      },
    }),
    insert: () => ({
      values: (quote: (typeof state.writes)[number]) => ({
        onConflictDoUpdate: async () => {
          if (state.writeError) throw new Error("private database error")
          state.writes.push(quote)
        },
      }),
    }),
  },
}))

describe("daily stock price refresh", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-04T02:00:00Z"))
    state.watchlist = [{ symbol: "BNBR" }]
    state.prices = [
      {
        symbol: "BNBR",
        price: 98,
        date: "2026-10-01",
        source: "Twelve Data",
        fetchedAt: new Date(),
      },
    ]
    state.writes = []
    state.writeError = false
    state.readPrice
      .mockReset()
      .mockResolvedValue({
        symbol: "BNBR",
        price: 99,
        date: "2026-10-02",
        source: "Yahoo Finance",
      })
  })
  afterEach(() => vi.useRealTimers())
  it("updates old-provider quotes without needing a key or changing their history", async () => {
    const oldPrices = structuredClone(state.prices)
    expect(await refreshDailyStockPrices()).toEqual({
      updated: 1,
      cached: 0,
      failures: [],
      pending: 0,
    })
    expect(state.writes).toEqual([
      {
        symbol: "BNBR",
        price: 99,
        date: "2026-10-02",
        source: "Yahoo Finance",
      },
    ])
    expect(state.prices).toEqual(oldPrices)
  })
  it("caches recent Yahoo prices but refetches expired prices", async () => {
    state.prices[0].source = "Yahoo Finance"
    expect(await refreshDailyStockPrices()).toMatchObject({
      updated: 0,
      cached: 1,
    })
    expect(state.readPrice).not.toHaveBeenCalled()
    state.prices[0].fetchedAt = new Date(Date.now() - 15 * 60 * 1000)
    expect(await refreshDailyStockPrices()).toMatchObject({
      updated: 1,
      cached: 0,
    })
  })
  it.each([
    "marketDataUnavailable",
    "invalidMarketPrice",
    "pricesRateLimited",
    "priceAccessRequired",
  ] as const)("keeps saved prices intact after %s", async (code) => {
    const oldPrices = structuredClone(state.prices)
    state.readPrice.mockRejectedValue(new FinanceError(code, 502))
    expect(await refreshDailyStockPrices()).toMatchObject({
      updated: 0,
      failures: [{ symbol: "BNBR", code }],
    })
    expect(state.writes).toEqual([])
    expect(state.prices).toEqual(oldPrices)
  })
  it("stops on provider limits and reports remaining tickers as pending", async () => {
    state.watchlist.push({ symbol: "BBRI" })
    state.readPrice.mockRejectedValue(
      new FinanceError("pricesRateLimited", 429),
    )
    expect(await refreshDailyStockPrices()).toEqual({
      updated: 0,
      cached: 0,
      failures: [{ symbol: "BBRI", code: "pricesRateLimited" }],
      pending: 1,
    })
    expect(state.readPrice).toHaveBeenCalledTimes(1)
  })
  it("distinguishes database writes from Yahoo/network failures", async () => {
    state.writeError = true
    expect(await refreshDailyStockPrices()).toMatchObject({
      updated: 0,
      failures: [{ symbol: "BNBR", code: "serviceUnavailable" }],
    })
    expect(state.writes).toEqual([])
  })
  it("stops starting requests after the processing window", async () => {
    state.watchlist.push({ symbol: "BBRI" })
    state.readPrice.mockImplementation(async (symbol: string) => {
      vi.setSystemTime(Date.now() + 40_000)
      return { symbol, price: 99, date: "2026-10-02", source: "Yahoo Finance" }
    })
    expect(await refreshDailyStockPrices()).toMatchObject({
      updated: 1,
      pending: 1,
    })
    expect(state.readPrice).toHaveBeenCalledTimes(1)
  })
})
