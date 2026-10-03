import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  integerInput,
  parseFund,
  parseSimulation,
  parseStockTrade,
  symbolInput,
} from "./planning-validation"

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date("2026-10-03T05:00:00Z"))
})
afterEach(() => vi.useRealTimers())
const trade = {
  symbol: "bbca",
  side: "buy",
  accountId: 1,
  lots: 2,
  price: 8500,
  fees: 1000,
  date: "2026-10-03",
}

describe("financial planning validation", () => {
  it("normalizes IDX symbols and converts lots to shares", () => {
    expect(parseStockTrade(trade)).toMatchObject({
      symbol: "BBCA",
      shares: 200,
      price: 8500,
      fees: 1000,
    })
  })
  it.each([
    true,
    null,
    "",
    "1.5",
    "NaN",
    -1,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
  ])("rejects unsafe financial quantities: %s", (value) => {
    expect(() => integerInput(value)).toThrow("invalidInput")
  })
  it.each(["BBCA.JK", "AAPL:NASDAQ", "BB", "1234", "<BB>"])(
    "rejects unsupported or unsafe ticker: %s",
    (symbol) => {
      expect(() => symbolInput(symbol)).toThrow("invalidInput")
    },
  )
  it.each([
    { lots: 0 },
    { lots: 1.5 },
    { price: 0 },
    { fees: -1 },
    { accountId: true },
    { date: "2026-10-04" },
    { date: "2026-02-30" },
    { side: "transfer" },
    { side: "sell", fees: 99999999 },
  ])("rejects invalid trades: %s", (override) => {
    expect(() => parseStockTrade({ ...trade, ...override })).toThrow(
      "invalidInput",
    )
  })
  it("rejects an overflowing trade amount", () => {
    expect(() =>
      parseStockTrade({ ...trade, lots: 100000, price: 1000000000 }),
    ).toThrow("invalidInput")
  })
  it("validates fund targets, accounts, and future deadlines", () => {
    expect(
      parseFund({
        name: "Car tax",
        accountId: "1",
        targetAmount: "1200000",
        targetDate: "2027-01-01",
      }),
    ).toMatchObject({ targetAmount: 1200000, description: "" })
    expect(() =>
      parseFund({
        name: "Car tax",
        accountId: 1,
        targetAmount: 1200000,
        targetDate: "2026-10-02",
      }),
    ).toThrow("invalidInput")
  })
  it("limits simulation dates and requires a positive recurring amount", () => {
    expect(
      parseSimulation({
        startDate: "2026-10-03",
        endDate: "2026-11-30",
        monthlyPayment: "500000",
      }).monthlyPayment,
    ).toBe(500000)
    expect(() =>
      parseSimulation({
        startDate: "2026-10-03",
        endDate: "2036-01-01",
        monthlyPayment: 500000,
      }),
    ).toThrow("invalidInput")
    expect(() =>
      parseSimulation({
        startDate: "2026-10-03",
        endDate: "2026-10-02",
        monthlyPayment: 500000,
      }),
    ).toThrow("invalidInput")
  })
})
