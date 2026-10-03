import { eq } from "drizzle-orm"
import { db } from "@/db"
import { accounts, stockInstruments, stockTrades } from "@/db/schema"
import { calculateAccountBalance } from "../calculations"
import {
  calculateHoldings,
  tradeCashChange,
  totalTradeCashChange,
  type StockTrade,
} from "../investments"
import { FinanceError } from "../finance-errors"
import { parseStockTrade } from "../planning-validation"
import { readLedger, readReservations } from "./ledger"

function validateCashHistory(
  initialBalance: number,
  accountId: number,
  ledger: Parameters<typeof calculateAccountBalance>[2],
  trades: StockTrade[],
) {
  let investedCents = 0
  for (const trade of [...trades]
    .filter((item) => item.accountId === accountId)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)) {
    investedCents += Math.round(tradeCashChange(trade) * 100)
    const cash =
      calculateAccountBalance(
        initialBalance,
        accountId,
        ledger.filter((item) => item.date <= trade.date),
      ) *
        100 +
      investedCents
    if (cash < 0) throw new FinanceError("insufficientCash", 409)
  }
}

export async function recordStockTrade(body: unknown) {
  const input = parseStockTrade(body)
  return db.transaction(
    async (connection) => {
      const [account] = await connection
        .select()
        .from(accounts)
        .where(eq(accounts.id, input.accountId))
        .for("update")
      if (!account) throw new FinanceError("recordMissing", 404)
      if (account.type !== "investment") throw new FinanceError("invalidInput")
      const ledger = await readLedger(connection)
      const reservations = await readReservations(connection)
      const cash = ledger.summaries.find(
        (item) => item.id === input.accountId,
      )!.balance
      if (
        input.side === "buy" &&
        Math.round(cash * 100) + Math.round(tradeCashChange(input) * 100) <
          (reservations.reserved.get(input.accountId) ?? 0) * 100
      )
        throw new FinanceError("insufficientAvailableCash", 409)
      await connection
        .insert(stockInstruments)
        .values({ symbol: input.symbol, name: input.symbol })
        .onConflictDoNothing()
      const [trade] = await connection
        .insert(stockTrades)
        .values(input)
        .returning()
      const updatedTrades = [...ledger.trades, trade]
      calculateHoldings(updatedTrades)
      validateCashHistory(
        account.initialBalance,
        account.id,
        ledger.transactions,
        updatedTrades,
      )
      return trade
    },
    { isolationLevel: "serializable" },
  )
}

export async function removeStockTrade(id: number) {
  return db.transaction(
    async (connection) => {
      const [trade] = await connection
        .select()
        .from(stockTrades)
        .where(eq(stockTrades.id, id))
      if (!trade) throw new FinanceError("recordMissing", 404)
      const [account] = await connection
        .select()
        .from(accounts)
        .where(eq(accounts.id, trade.accountId))
        .for("update")
      const ledger = await readLedger(connection)
      const remaining = ledger.trades.filter((item) => item.id !== id)
      calculateHoldings(remaining)
      validateCashHistory(
        account.initialBalance,
        account.id,
        ledger.transactions,
        remaining,
      )
      const reservations = await readReservations(connection)
      const cashCents =
        calculateAccountBalance(
          account.initialBalance,
          account.id,
          ledger.transactions,
        ) *
          100 +
        Math.round(
          totalTradeCashChange(
            remaining.filter((item) => item.accountId === account.id),
          ) * 100,
        )
      if (cashCents < (reservations.reserved.get(account.id) ?? 0) * 100)
        throw new FinanceError("insufficientAvailableCash", 409)
      await connection.delete(stockTrades).where(eq(stockTrades.id, id))
      return { id }
    },
    { isolationLevel: "serializable" },
  )
}
