import { isDate, transactionTypes, type TransactionType } from "./finance"
import { expenseCategories, incomeCategories } from "./finance"
import { usabilityMessages } from "./usability-messages"

export function findEnglishCategoryMatches(search: string) {
  const query = search.trim().toLowerCase()
  if (!query) return []
  const categories = [
    ...new Set([
      ...incomeCategories,
      ...expenseCategories,
      "Transfer antar akun",
    ]),
  ]
  return categories.filter((category) =>
    usabilityMessages.en[category].toLowerCase().includes(query),
  )
}

export function parseTransactionFilters(params: URLSearchParams) {
  const type = params.get("type") ?? "all"
  const account = params.get("account") ?? "all"
  const from = params.get("from") ?? ""
  const to = params.get("to") ?? ""
  if (type !== "all" && !transactionTypes.includes(type as TransactionType))
    return null
  if (
    account !== "all" &&
    (!Number.isSafeInteger(Number(account)) || Number(account) < 1)
  )
    return null
  if (
    (from && !isDate(from)) ||
    (to && !isDate(to)) ||
    (from && to && from > to)
  )
    return null
  return {
    search: (params.get("search") ?? "").trim().slice(0, 200),
    type: type as "all" | TransactionType,
    accountId: account === "all" ? null : Number(account),
    from,
    to,
  }
}
