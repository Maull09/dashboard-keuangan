import { describe, expect, it } from "vitest"
import { parseDailyStockPrice } from "./stock-price-parser"

const response = {
  meta: { symbol: "BBCA", mic_code: "XIDX", currency: "IDR", interval: "1day" },
  values: [{ datetime: "2026-10-02", close: "8500.00" }],
  status: "ok",
}

describe("daily stock quote integrity", () => {
  it("keeps the actual price date, not the fetch date", () => {
    expect(parseDailyStockPrice(response, "BBCA", "2026-10-03")).toEqual({
      symbol: "BBCA",
      price: 8500,
      date: "2026-10-02",
      source: "Twelve Data",
    })
  })
  it.each([
    { symbol: "AAPL" },
    { mic_code: "XNAS" },
    { currency: "USD" },
    { interval: "1min" },
  ])("rejects mismatched market metadata: %s", (meta) => {
    expect(() =>
      parseDailyStockPrice(
        { ...response, meta: { ...response.meta, ...meta } },
        "BBCA",
        "2026-10-03",
      ),
    ).toThrow("invalidMarketPrice")
  })
  it.each(["0", "-50", "NaN", "Infinity", "8500.5"])(
    "rejects invalid IDR quotes: %s",
    (close) => {
      expect(() =>
        parseDailyStockPrice(
          { ...response, values: [{ datetime: "2026-10-02", close }] },
          "BBCA",
          "2026-10-03",
        ),
      ).toThrow("invalidMarketPrice")
    },
  )
  it("rejects future quote dates and empty data", () => {
    expect(() =>
      parseDailyStockPrice(
        { ...response, values: [{ datetime: "2026-10-04", close: "8500" }] },
        "BBCA",
        "2026-10-03",
      ),
    ).toThrow("invalidMarketPrice")
    expect(() => parseDailyStockPrice({}, "BBCA", "2026-10-03")).toThrow(
      "invalidMarketPrice",
    )
  })
  it.each([
    [403, "priceAccessRequired"],
    [429, "pricesRateLimited"],
    [404, "invalidMarketPrice"],
  ])(
    "reports provider error %s without exposing its response",
    (code, message) => {
      expect(() =>
        parseDailyStockPrice(
          { status: "error", code, message: "private provider response" },
          "BBCA",
          "2026-10-03",
        ),
      ).toThrow(String(message))
    },
  )
})
