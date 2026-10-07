import { describe, expect, it } from "vitest"
import { parseYahooDailyStockPrice } from "./stock-price-parser"

const response = {
  chart: {
    result: [
      {
        meta: {
          symbol: "BBCA.JK",
          currency: "IDR",
          exchangeName: "JKT",
          instrumentType: "EQUITY",
          dataGranularity: "1d",
        },
        timestamp: [1790906400],
        indicators: { quote: [{ close: [8500] }] },
      },
    ],
    error: null,
  },
}

describe("daily stock quote integrity", () => {
  it("keeps the actual price date, not the fetch date", () => {
    expect(parseYahooDailyStockPrice(response, "BBCA", "2026-10-03")).toEqual({
      symbol: "BBCA",
      price: 8500,
      date: "2026-10-02",
      source: "Yahoo Finance",
    })
  })
  it.each([
    { symbol: "AAPL.JK" },
    { exchangeName: "NMS" },
    { currency: "USD" },
    { dataGranularity: "1m" },
  ])("rejects mismatched market metadata: %s", (meta) => {
    expect(() =>
      parseYahooDailyStockPrice(
        {
          ...response,
          chart: {
            ...response.chart,
            result: [
              {
                ...response.chart.result[0],
                meta: { ...response.chart.result[0].meta, ...meta },
              },
            ],
          },
        },
        "BBCA",
        "2026-10-03",
      ),
    ).toThrow("invalidMarketPrice")
  })
  it.each(["0", "-50", "NaN", "Infinity", "8500.5"])(
    "rejects invalid IDR quotes: %s",
    (close) => {
      expect(() =>
        parseYahooDailyStockPrice(
          {
            ...response,
            chart: {
              ...response.chart,
              result: [
                {
                  ...response.chart.result[0],
                  indicators: { quote: [{ close: [close] }] },
                },
              ],
            },
          },
          "BBCA",
          "2026-10-03",
        ),
      ).toThrow("invalidMarketPrice")
    },
  )
  it("rejects future quote dates and empty data", () => {
    expect(() =>
      parseYahooDailyStockPrice(
        {
          ...response,
          chart: {
            ...response.chart,
            result: [
              { ...response.chart.result[0], timestamp: [1791079200] },
            ],
          },
        },
        "BBCA",
        "2026-10-03",
      ),
    ).toThrow("invalidMarketPrice")
    expect(() =>
      parseYahooDailyStockPrice({}, "BBCA", "2026-10-03"),
    ).toThrow("invalidMarketPrice")
  })
  it("uses the newest available close when the current daily bar is empty", () => {
    expect(
      parseYahooDailyStockPrice(
        {
          ...response,
          chart: {
            ...response.chart,
            result: [
              {
                ...response.chart.result[0],
                timestamp: [1790820000, 1790906400],
                indicators: { quote: [{ close: [8400, null] }] },
              },
            ],
          },
        },
        "BBCA",
        "2026-10-03",
      ),
    ).toMatchObject({ price: 8400, date: "2026-10-01" })
  })
  it("rejects provider errors without exposing their response", () => {
    expect(() =>
      parseYahooDailyStockPrice(
        { chart: { result: null, error: { description: "private response" } } },
        "BBCA",
        "2026-10-03",
      ),
    ).toThrow("invalidMarketPrice")
  })
})
