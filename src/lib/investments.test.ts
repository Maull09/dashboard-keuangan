import { describe, expect, it } from "vitest"
import {
  calculateHoldings,
  investmentTotals,
  tradeCashChange,
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
