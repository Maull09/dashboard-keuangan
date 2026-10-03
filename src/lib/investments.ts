import { FinanceError } from "./finance-errors"

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
  const gross = trade.shares * trade.price
  return trade.side === "buy" ? -(gross + trade.fees) : gross - trade.fees
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
    if (trade.side === "buy") {
      holding.shares += trade.shares
      holding.costBasis += trade.shares * trade.price + trade.fees
    } else {
      if (trade.shares > holding.shares)
        throw new FinanceError("insufficientShares", 409)
      const soldCost =
        trade.shares === holding.shares
          ? holding.costBasis
          : Math.round((holding.costBasis * trade.shares) / holding.shares)
      holding.realizedGain += trade.shares * trade.price - trade.fees - soldCost
      holding.costBasis -= soldCost
      holding.shares -= trade.shares
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
      holding.marketValue = holding.shares * quote.price
      holding.unrealizedGain = holding.marketValue - holding.costBasis
      holding.priceDate = quote.date
      holding.source = quote.source
    }
  }
  return [...holdings.values()]
}

export function investmentTotals(holdings: Holding[]) {
  const active = holdings.filter((holding) => holding.shares > 0)
  const unpriced = active.filter((holding) => holding.marketValue === null)
  const knownMarketValue = active.reduce(
    (total, holding) => total + (holding.marketValue ?? 0),
    0,
  )
  const costBasis = active.reduce(
    (total, holding) => total + holding.costBasis,
    0,
  )
  return {
    costBasis,
    knownMarketValue,
    marketValue: unpriced.length ? null : knownMarketValue,
    unrealizedGain: unpriced.length ? null : knownMarketValue - costBasis,
    realizedGain: holdings.reduce(
      (total, holding) => total + holding.realizedGain,
      0,
    ),
    unpricedCount: unpriced.length,
  }
}
