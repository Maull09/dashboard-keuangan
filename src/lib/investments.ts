import { FinanceError } from "./finance-errors"
import { calculateAccountBalance, type LedgerTransaction } from "./calculations"

export type StockTrade = {
  id: number
  accountId: number
  symbol: string
  side: string
  shares: number
  price: number
  fees: number
  date: string
}
export type StockPrice = {
  symbol: string
  price: number
  date: string
  source: string
  fetchedAt: Date | string
}
export type Holding = {
  accountId: number
  symbol: string
  shares: number
  costBasis: number
  averageCost: number
  realizedGain: number
  marketPrice: number | null
  marketValue: number | null
  unrealizedGain: number | null
  priceDate: string | null
  source: string | null
}

export function tradeCashChange(
  trade: Pick<StockTrade, "side" | "shares" | "price" | "fees">,
) {
  const shareUnits = BigInt(Math.round(trade.shares * 10_000))
  const priceUnits = BigInt(Math.round(trade.price * 10_000))
  const grossCents = Number(
    (shareUnits * priceUnits + BigInt(500_000)) / BigInt(1_000_000),
  )
  const feeCents = Math.round(trade.fees * 100)
  return (
    (trade.side === "buy" ? -(grossCents + feeCents) : grossCents - feeCents) /
    100
  )
}

export function calculateHoldings(
  trades: StockTrade[],
  prices: StockPrice[] = [],
): Holding[] {
  const latestPrices = new Map<string, StockPrice>()
  for (const price of prices)
    if (
      !latestPrices.has(price.symbol) ||
      latestPrices.get(price.symbol)!.date < price.date
    )
      latestPrices.set(price.symbol, price)
  const holdings = new Map<string, Holding>()
  for (const trade of [...trades].sort(
    (a, b) => a.date.localeCompare(b.date) || a.id - b.id,
  )) {
    const key = `${trade.accountId}:${trade.symbol}`
    const holding = holdings.get(key) ?? {
      accountId: trade.accountId,
      symbol: trade.symbol,
      shares: 0,
      costBasis: 0,
      averageCost: 0,
      realizedGain: 0,
      marketPrice: null,
      marketValue: null,
      unrealizedGain: null,
      priceDate: null,
      source: null,
    }
    const shareUnits = Math.round(trade.shares * 10_000)
    const heldUnits = Math.round(holding.shares * 10_000)
    const costCents = Math.round(holding.costBasis * 100)
    if (trade.side === "buy") {
      holding.shares = (heldUnits + shareUnits) / 10_000
      holding.costBasis =
        (costCents - Math.round(tradeCashChange(trade) * 100)) / 100
    } else {
      if (shareUnits > heldUnits)
        throw new FinanceError("insufficientShares", 409)
      const soldCents =
        shareUnits === heldUnits
          ? costCents
          : Number(
              (BigInt(costCents) * BigInt(shareUnits) +
                BigInt(Math.floor(heldUnits / 2))) /
                BigInt(heldUnits),
            )
      holding.realizedGain =
        (Math.round(holding.realizedGain * 100) +
          Math.round(tradeCashChange(trade) * 100) -
          soldCents) /
        100
      holding.costBasis = (costCents - soldCents) / 100
      holding.shares = (heldUnits - shareUnits) / 10_000
    }
    holding.averageCost = holding.shares
      ? holding.costBasis / holding.shares
      : 0
    holdings.set(key, holding)
  }
  for (const holding of holdings.values()) {
    const quote = latestPrices.get(holding.symbol)
    if (holding.shares === 0) {
      holding.marketValue = 0
      holding.unrealizedGain = 0
    } else if (quote) {
      holding.marketPrice = quote.price
      holding.marketValue = tradeCashChange({
        side: "sell",
        shares: holding.shares,
        price: quote.price,
        fees: 0,
      })
      holding.unrealizedGain =
        (Math.round(holding.marketValue * 100) -
          Math.round(holding.costBasis * 100)) /
        100
      holding.priceDate = quote.date
      holding.source = quote.source
    }
  }
  return [...holdings.values()]
}

export function totalTradeCashChange(trades: StockTrade[]) {
  return (
    trades.reduce(
      (totalCents, trade) =>
        totalCents + Math.round(tradeCashChange(trade) * 100),
      0,
    ) / 100
  )
}

export function validateInvestmentAccount(
  account: { id: number; initialBalance: number },
  transactions: LedgerTransaction[],
  trades: StockTrade[],
  reservedAmount: number,
) {
  const accountTrades = trades.filter((trade) => trade.accountId === account.id)
  calculateHoldings(accountTrades)
  let investedCents = 0
  for (const trade of [...accountTrades].sort(
    (a, b) => a.date.localeCompare(b.date) || a.id - b.id,
  )) {
    investedCents += Math.round(tradeCashChange(trade) * 100)
    const cashCents =
      calculateAccountBalance(
        account.initialBalance,
        account.id,
        transactions.filter((item) => item.date <= trade.date),
      ) *
        100 +
      investedCents
    if (cashCents < 0) throw new FinanceError("insufficientCash", 409)
  }
  const currentCents =
    calculateAccountBalance(account.initialBalance, account.id, transactions) *
      100 +
    investedCents
  if (currentCents < reservedAmount * 100)
    throw new FinanceError("insufficientAvailableCash", 409)
}

export function investmentTotals(holdings: Holding[]) {
  const active = holdings.filter((holding) => holding.shares > 0)
  const unpriced = active.filter((holding) => holding.marketValue === null)
  const knownMarketValue =
    active.reduce(
      (total, holding) => total + Math.round((holding.marketValue ?? 0) * 100),
      0,
    ) / 100
  const costBasis =
    active.reduce(
      (total, holding) => total + Math.round(holding.costBasis * 100),
      0,
    ) / 100
  return {
    costBasis,
    knownMarketValue,
    marketValue: unpriced.length ? null : knownMarketValue,
    unrealizedGain: unpriced.length
      ? null
      : (Math.round(knownMarketValue * 100) - Math.round(costBasis * 100)) /
        100,
    realizedGain:
      holdings.reduce(
        (total, holding) => total + Math.round(holding.realizedGain * 100),
        0,
      ) / 100,
    unpricedCount: unpriced.length,
  }
}
