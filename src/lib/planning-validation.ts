import { getToday, isDate } from "./finance"
import { FinanceError } from "./finance-errors"

export function recordInput(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new FinanceError("invalidInput")
  return value as Record<string, unknown>
}

export function integerInput(
  value: unknown,
  minimum = 1,
  maximum = 1_000_000_000_000,
) {
  if (
    typeof value !== "number" &&
    (typeof value !== "string" || !/^\d+$/.test(value))
  )
    throw new FinanceError("invalidInput")
  const number = Number(value)
  if (!Number.isSafeInteger(number) || number < minimum || number > maximum)
    throw new FinanceError("invalidInput")
  return number
}

export function textInput(value: unknown, maximum = 120, required = true) {
  const text = typeof value === "string" ? value.trim() : ""
  if ((required && !text) || text.length > maximum)
    throw new FinanceError("invalidInput")
  return text
}

export function symbolInput(value: unknown) {
  const symbol = textInput(value, 4).toUpperCase()
  if (!/^[A-Z]{4}$/.test(symbol)) throw new FinanceError("invalidInput")
  return symbol
}

export function parseStockTrade(value: unknown) {
  const body = recordInput(value)
  if (body.side !== "buy" && body.side !== "sell")
    throw new FinanceError("invalidInput")
  if (!isDate(body.date) || body.date > getToday() || body.date < "1900-01-01")
    throw new FinanceError("invalidInput")
  const lots = integerInput(body.lots, 1, 100_000)
  const shares = lots * 100
  const price = integerInput(body.price, 1, 1_000_000_000)
  const fees = integerInput(body.fees ?? 0, 0, 2_147_483_647)
  if (
    !Number.isSafeInteger(shares * price + fees) ||
    shares * price + fees > 1_000_000_000_000 ||
    (body.side === "sell" && fees >= shares * price)
  )
    throw new FinanceError("invalidInput")
  return {
    symbol: symbolInput(body.symbol),
    accountId: integerInput(body.accountId, 1, 2_147_483_647),
    side: body.side,
    shares,
    price,
    fees,
    date: body.date,
    note: textInput(body.note, 500, false),
  }
}

export function parseFund(value: unknown) {
  const body = recordInput(value)
  if (!isDate(body.targetDate) || body.targetDate < getToday())
    throw new FinanceError("invalidInput")
  return {
    name: textInput(body.name),
    accountId: integerInput(body.accountId, 1, 2_147_483_647),
    targetAmount: integerInput(body.targetAmount, 1, 2_147_483_647),
    targetDate: body.targetDate,
    description: textInput(body.description, 500, false),
  }
}

export function parseSimulation(value: unknown) {
  const body = recordInput(value)
  const today = getToday()
  if (
    !isDate(body.startDate) ||
    !isDate(body.endDate) ||
    body.startDate < today ||
    body.endDate < body.startDate ||
    Date.parse(body.endDate) - Date.parse(today) > 730 * 86400000
  )
    throw new FinanceError("invalidInput")
  return {
    startDate: body.startDate,
    endDate: body.endDate,
    monthlyPayment: integerInput(body.monthlyPayment, 1, 2_147_483_647),
  }
}
