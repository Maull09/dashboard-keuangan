import { describe, expect, it } from "vitest"
import { formatCurrency, formatStockQuantity } from "./finance"
import {
  calculateHoldings,
  investmentTotals,
  tradeCashChange,
  totalTradeCashChange,
  validateInvestmentAccount,
  type StockTrade,
} from "./investments"

const buy: StockTrade = {
  id: 1,
  accountId: 1,
  symbol: "BBCA",
  side: "buy",
  shares: 200,
  price: 1000,
  fees: 100,
  date: "2026-01-01",
}

describe("stock portfolio accounting", () => {
  it("validates edited trade cash and protected allocations", () => {
    expect(() =>
      validateInvestmentAccount(
        { id: 1, initialBalance: 300000 },
        [],
        [buy],
        99900,
      ),
    ).not.toThrow()
    expect(() =>
      validateInvestmentAccount(
        { id: 1, initialBalance: 300000 },
        [],
        [buy],
        99901,
      ),
    ).toThrow("insufficientAvailableCash")
    expect(() =>
      validateInvestmentAccount(
        { id: 1, initialBalance: 200000 },
        [],
        [buy],
        0,
      ),
    ).toThrow("insufficientCash")
  })
  it("does not fund a backdated purchase with later income", () => {
    const income = {
      type: "income" as const,
      amount: 300000,
      accountId: 1,
      destinationAccountId: null,
      date: "2026-01-02",
    }
    expect(() =>
      validateInvestmentAccount(
        { id: 1, initialBalance: 0 },
        [income],
        [buy],
        0,
      ),
    ).toThrow("insufficientCash")
    expect(() =>
      validateInvestmentAccount(
        { id: 1, initialBalance: 0 },
        [{ ...income, date: buy.date }],
        [buy],
        0,
      ),
    ).not.toThrow()
  })
  it("rejects edits moving a dependent purchase to another account or ticker", () => {
    const sale = {
      ...buy,
      id: 2,
      side: "sell",
      shares: 100,
      date: "2026-01-02",
    }
    for (const changed of [
      { ...buy, accountId: 2 },
      { ...buy, symbol: "BBRI" },
      { ...buy, date: "2026-01-03" },
    ])
      expect(() =>
        validateInvestmentAccount(
          { id: 1, initialBalance: 1000000 },
          [],
          [changed, sale],
          0,
        ),
      ).toThrow("insufficientShares")
  })
  it("keeps fractional quantities and cash cents exact during validation", () => {
    const fractional = { ...buy, shares: 0.1, price: 0.1, fees: 0 }
    expect(() =>
      validateInvestmentAccount(
        { id: 1, initialBalance: 1 },
        [],
        Array.from({ length: 100 }, (_, id) => ({ ...fractional, id })),
        0,
      ),
    ).not.toThrow()
  })
  it("sums repeated decimal cash changes without residual cents", () => {
    const trades = Array.from({ length: 100 }, (_, id) => ({
      ...buy,
      id,
      shares: 0.01,
      price: 1,
      fees: 0,
    }))
    expect(totalTradeCashChange(trades)).toBe(-1)
  })
  it("preserves decimal prices and odd-lot average cost", () => {
    const trade = { ...buy, shares: 125, price: 1000.75, fees: 1 }
    expect(tradeCashChange(trade)).toBe(-125094.75)
    expect(calculateHoldings([trade])[0]).toMatchObject({
      shares: 125,
      costBasis: 125094.75,
      averageCost: 1000.758,
    })
  })
  it("closes fractional shares without floating-point leftovers", () => {
    const trades: StockTrade[] = [
      { ...buy, shares: 0.1, price: 10.25, fees: 0 },
      { ...buy, id: 2, shares: 0.2, price: 10.25, fees: 0 },
      { ...buy, id: 3, side: "sell", shares: 0.3, price: 12.35, fees: 0 },
    ]
    expect(calculateHoldings(trades)[0]).toMatchObject({
      shares: 0,
      costBasis: 0,
      averageCost: 0,
      realizedGain: 0.63,
    })
    expect(() =>
      calculateHoldings([
        ...trades,
        { ...buy, id: 4, side: "sell", shares: 0.0001 },
      ]),
    ).toThrow("insufficientShares")
  })
  it("allocates partial-sale costs in cents and removes the final remainder", () => {
    const trades: StockTrade[] = [
      { ...buy, shares: 0.3, price: 10.25, fees: 0 },
      { ...buy, id: 2, side: "sell", shares: 0.1, price: 12.35, fees: 0 },
    ]
    expect(calculateHoldings(trades)[0]).toMatchObject({
      shares: 0.2,
      costBasis: 2.05,
      realizedGain: 0.21,
    })
    expect(
      calculateHoldings([
        ...trades,
        { ...buy, id: 3, side: "sell", shares: 0.2, price: 12.35, fees: 0 },
      ])[0],
    ).toMatchObject({ shares: 0, costBasis: 0, realizedGain: 0.63 })
  })
  it("formats fractional quantities and average costs in both languages", () => {
    expect(formatStockQuantity(1234.5678, "id")).toBe("1.234,5678")
    expect(formatStockQuantity(1234.5678, "en")).toBe("1,234.5678")
    expect(formatStockQuantity(0.000001, "id", 6)).toBe("0,000001")
    expect(formatCurrency(1000.758, "id")).toContain("1.000,76")
    expect(formatCurrency(1000.758, "en")).toContain("1,000.76")
  })
  it("charges purchase fees to cash and cost basis", () => {
    expect(tradeCashChange(buy)).toBe(-200100)
    expect(calculateHoldings([buy])[0]).toMatchObject({
      shares: 200,
      costBasis: 200100,
      averageCost: 1000.5,
    })
  })
  it("uses weighted average cost after multiple purchases", () => {
    const holdings = calculateHoldings([
      buy,
      { ...buy, id: 2, shares: 100, price: 1600, fees: 50 },
    ])
    expect(holdings[0]).toMatchObject({
      shares: 300,
      costBasis: 360150,
      averageCost: 1200.5,
    })
  })
  it("separates realized and unrealized gains with sale fees", () => {
    const sell = {
      ...buy,
      id: 2,
      side: "sell",
      shares: 100,
      price: 1200,
      fees: 100,
      date: "2026-01-02",
    }
    const holding = calculateHoldings(
      [buy, sell],
      [
        {
          symbol: "BBCA",
          price: 1300,
          date: "2026-01-03",
          source: "Fixture",
          fetchedAt: "2026-01-03",
        },
      ],
    )[0]
    expect(tradeCashChange(sell)).toBe(119900)
    expect(holding).toMatchObject({
      shares: 100,
      costBasis: 100050,
      realizedGain: 19850,
      marketValue: 130000,
      unrealizedGain: 29950,
    })
  })
  it("does not count purchased shares and cash twice", () => {
    const openingCash = 1_000_000
    const holding = calculateHoldings(
      [buy],
      [
        {
          symbol: "BBCA",
          price: 1000,
          date: "2026-01-03",
          source: "Fixture",
          fetchedAt: "2026-01-03",
        },
      ],
    )[0]
    expect(openingCash + tradeCashChange(buy) + holding.marketValue!).toBe(
      openingCash - buy.fees,
    )
  })
  it("keeps holdings separate by account", () => {
    expect(
      calculateHoldings([buy, { ...buy, id: 2, accountId: 2 }]),
    ).toHaveLength(2)
    expect(() =>
      calculateHoldings([buy, { ...buy, id: 2, accountId: 2, side: "sell" }]),
    ).toThrow("insufficientShares")
  })
  it("rejects overselling and a sale before the purchase date", () => {
    expect(() =>
      calculateHoldings([buy, { ...buy, id: 2, side: "sell", shares: 300 }]),
    ).toThrow("insufficientShares")
    expect(() =>
      calculateHoldings([
        buy,
        { ...buy, id: 2, side: "sell", date: "2025-12-31" },
      ]),
    ).toThrow("insufficientShares")
  })
  it("replays out-of-order trades by date and then id", () => {
    const sell = { ...buy, id: 2, side: "sell", date: "2026-01-02" }
    expect(calculateHoldings([sell, buy])[0].shares).toBe(0)
  })
  it("removes the entire cost basis on the final sale", () => {
    const holding = calculateHoldings([
      buy,
      { ...buy, id: 2, side: "sell", shares: 100, price: 1100 },
      { ...buy, id: 3, side: "sell", shares: 100, price: 1100 },
    ])[0]
    expect(holding).toMatchObject({
      shares: 0,
      costBasis: 0,
      averageCost: 0,
      realizedGain: 19700,
      marketValue: 0,
      unrealizedGain: 0,
    })
  })
  it("never silently values an unpriced position at zero or purchase cost", () => {
    const holdings = calculateHoldings([buy])
    expect(holdings[0].marketValue).toBeNull()
    expect(investmentTotals(holdings)).toMatchObject({
      costBasis: 200100,
      marketValue: null,
      knownMarketValue: 0,
      unrealizedGain: null,
      unpricedCount: 1,
    })
  })
  it("uses the most recent price and retains its actual date", () => {
    const prices = [1000, 1200].map((price, index) => ({
      symbol: "BBCA",
      price,
      date: `2026-01-0${index + 1}`,
      source: "Fixture",
      fetchedAt: "2026-01-03",
    }))
    expect(calculateHoldings([buy], prices)[0]).toMatchObject({
      marketPrice: 1200,
      priceDate: "2026-01-02",
      marketValue: 240000,
    })
  })
})
