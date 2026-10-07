export const financeErrorCodes = [
  "invalidInput",
  "recordMissing",
  "recordConflict",
  "serviceUnavailable",
  "insufficientShares",
  "insufficientCash",
  "insufficientAvailableCash",
  "fundBalanceExceeded",
  "fundTargetExceeded",
  "linkedFundTransaction",
  "marketDataUnavailable",
  "priceAccessRequired",
  "pricesRateLimited",
  "invalidMarketPrice",
  "historyProtected",
  "amountBelowRecorded",
  "accountInUse",
  "watchAlreadyExists",
  "budgetAlreadyExists",
  "goalTargetExceeded",
  "debtPaymentExceeded",
  "scheduleUnavailable",
  "scheduleAlreadyRecorded",
] as const

export type FinanceErrorCode = (typeof financeErrorCodes)[number]

export class FinanceError extends Error {
  constructor(
    public code: FinanceErrorCode,
    public status = 400,
  ) {
    super(code)
  }
}
