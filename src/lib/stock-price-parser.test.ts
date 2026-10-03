import { describe, expect, it } from "vitest"
import { parseDailyStockPrice } from "./stock-price-parser"

const now = new Date("2026-10-04T02:00:00Z")
const response = {
  meta: {
    symbol: "BNBR.JK",
    exchangeName: "JKT",
    exchangeTimezoneName: "Asia/Jakarta",
    instrumentType: "EQUITY",
    currency: "IDR",
    dataGranularity: "1d",
    currentTradingPeriod: {
      regular: {
        start: new Date("2026-10-02T02:00:00Z"),
        end: new Date("2026-10-02T09:15:00Z"),
      },
    },
  },
  quotes: [
    { date: new Date("2026-10-01T02:00:00Z"), close: 98, adjclose: 50 },
    { date: new Date("2026-10-02T02:00:00Z"), close: 99, adjclose: 51 },
  ],
}

describe("Yahoo daily stock quote integrity", () => {
  it("uses the latest unadjusted close and its actual Jakarta date, not fetch date", () => {
    expect(parseDailyStockPrice(response, "BNBR", now)).toEqual({
      symbol: "BNBR",
      price: 99,
      date: "2026-10-02",
      source: "Yahoo Finance",
    })
    expect(
      parseDailyStockPrice(
        { ...response, quotes: [...response.quotes].reverse() },
        "BNBR",
        now,
      ).price,
    ).toBe(99)
  })
  it.each([
    { symbol: "BBCA.JK" },
    { exchangeName: "NMS" },
    { exchangeTimezoneName: "America/New_York" },
    { currency: "USD" },
    { instrumentType: "INDEX" },
    { dataGranularity: "1m" },
  ])("rejects mismatched ticker/market metadata: %s", (meta) => {
    expect(() =>
      parseDailyStockPrice(
        { ...response, meta: { ...response.meta, ...meta } },
        "BNBR",
        now,
      ),
    ).toThrow("invalidMarketPrice")
  })
  it.each([0, -50, NaN, Infinity, 99.5, 1_000_000_001, "99"])(
    "rejects invalid whole-IDR closes: %s",
    (close) => {
      expect(() =>
        parseDailyStockPrice(
          {
            ...response,
            quotes: [{ date: new Date("2026-10-02T02:00:00Z"), close }],
          },
          "BNBR",
          now,
        ),
      ).toThrow("invalidMarketPrice")
    },
  )
  it("skips missing closes but rejects empty, malformed, and future data", () => {
    expect(
      parseDailyStockPrice(
        {
          ...response,
          quotes: [
            ...response.quotes,
            { date: new Date("2026-10-03T02:00:00Z"), close: null },
          ],
        },
        "BNBR",
        now,
      ).price,
    ).toBe(99)
    for (const quotes of [
      [],
      [{ date: new Date("invalid"), close: 99 }],
      [{ date: new Date("2026-10-05T02:00:00Z"), close: 99 }],
      [null],
    ])
      expect(() =>
        parseDailyStockPrice({ ...response, quotes }, "BNBR", now),
      ).toThrow("invalidMarketPrice")
    expect(() => parseDailyStockPrice({}, "BNBR", now)).toThrow(
      "invalidMarketPrice",
    )
  })
  it("does not accept the current intraday bar or unsettled delayed close", () => {
    for (const time of ["2026-10-02T05:00:00Z", "2026-10-02T09:29:59Z"])
      expect(
        parseDailyStockPrice(response, "BNBR", new Date(time)),
      ).toMatchObject({ date: "2026-10-01", price: 98 })
    expect(
      parseDailyStockPrice(response, "BNBR", new Date("2026-10-02T09:30:00Z")),
    ).toMatchObject({ date: "2026-10-02", price: 99 })
  })
  it("requires valid same-day session metadata before accepting today's close", () => {
    for (const regular of [
      undefined,
      {
        start: new Date("2026-10-01T02:00:00Z"),
        end: new Date("2026-10-01T09:15:00Z"),
      },
      { start: new Date("invalid"), end: new Date("invalid") },
    ])
      expect(
        parseDailyStockPrice(
          {
            ...response,
            meta: { ...response.meta, currentTradingPeriod: { regular } },
          },
          "BNBR",
          new Date("2026-10-02T10:00:00Z"),
        ),
      ).toMatchObject({ date: "2026-10-01", price: 98 })
  })
  it("converts timestamps using Jakarta, not the server's timezone", () => {
    expect(
      parseDailyStockPrice(
        {
          ...response,
          quotes: [{ date: new Date("2026-10-01T18:00:00Z"), close: 99 }],
        },
        "BNBR",
        now,
      ).date,
    ).toBe("2026-10-02")
  })
})
