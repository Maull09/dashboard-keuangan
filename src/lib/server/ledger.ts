import { db } from "@/db"
import {
  accounts,
  transactions,
  stockTrades,
  sinkingFunds,
  sinkingFundEntries,
  goalContributions,
} from "@/db/schema"
import { calculateAccountBalance } from "../calculations"
import { tradeCashChange } from "../investments"
import { fundBalance } from "../planning"

export type ReadConnection = Pick<typeof db, "select">

export async function readLedger(connection: ReadConnection = db) {
  const [allAccounts, allTransactions, trades] = await Promise.all([
    connection.select().from(accounts),
    connection.select().from(transactions),
    connection.select().from(stockTrades),
  ])
  const summaries = allAccounts.map((account) => ({
    ...account,
    balance:
      calculateAccountBalance(
        account.initialBalance,
        account.id,
        allTransactions,
      ) +
      trades
        .filter((trade) => trade.accountId === account.id)
        .reduce((total, trade) => total + tradeCashChange(trade), 0),
  }))
  return {
    accounts: allAccounts,
    transactions: allTransactions,
    trades,
    summaries,
    cashBalance: summaries.reduce(
      (total, account) => total + account.balance,
      0,
    ),
  }
}

export async function readReservations(connection: ReadConnection = db) {
  const [funds, entries, contributions] = await Promise.all([
    connection.select().from(sinkingFunds),
    connection.select().from(sinkingFundEntries),
    connection.select().from(goalContributions),
  ])
  const reserved = new Map<number, number>()
  for (const fund of funds)
    reserved.set(
      fund.accountId,
      (reserved.get(fund.accountId) ?? 0) +
        fundBalance(entries.filter((entry) => entry.fundId === fund.id)),
    )
  for (const contribution of contributions)
    reserved.set(
      contribution.accountId,
      (reserved.get(contribution.accountId) ?? 0) + contribution.amount,
    )
  return { funds, entries, contributions, reserved }
}
