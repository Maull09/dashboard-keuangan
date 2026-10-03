import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import {
  accounts,
  sinkingFunds,
  sinkingFundEntries,
  transactions,
} from "@/db/schema"
import { financeResponse } from "@/lib/api-response"
import { FinanceError } from "@/lib/finance-errors"
import { integerInput, recordInput, textInput } from "@/lib/planning-validation"
import { fundBalance } from "@/lib/planning"
import { expenseCategories, getToday } from "@/lib/finance"
import { readLedger, readReservations } from "@/lib/server/ledger"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return financeResponse(async () => {
    const fundId = integerInput((await params).id, 1, 2_147_483_647)
    const body = recordInput(await request.json())
    const amount = integerInput(body.amount, 1, 2_147_483_647)
    const kind = body.kind
    if (!["allocate", "release", "spend"].includes(String(kind)))
      throw new FinanceError("invalidInput")
    const note = textInput(body.note, 500, false)
    const category = textInput(body.category ?? "Lainnya")
    if (
      kind === "spend" &&
      !expenseCategories.includes(
        category as (typeof expenseCategories)[number],
      )
    )
      throw new FinanceError("invalidInput")
    const entry = await db.transaction(
      async (connection) => {
        const [fund] = await connection
          .select()
          .from(sinkingFunds)
          .where(eq(sinkingFunds.id, fundId))
          .for("update")
        if (!fund) throw new FinanceError("recordMissing", 404)
        await connection
          .select()
          .from(accounts)
          .where(eq(accounts.id, fund.accountId))
          .for("update")
        const [ledger, reservations] = await Promise.all([
          readLedger(connection),
          readReservations(connection),
        ])
        const allocated = fundBalance(
          reservations.entries.filter((item) => item.fundId === fund.id),
        )
        const cash = ledger.summaries.find(
          (item) => item.id === fund.accountId,
        )!.balance
        const availableCash =
          cash - (reservations.reserved.get(fund.accountId) ?? 0)
        if (kind === "allocate" && amount > availableCash)
          throw new FinanceError("insufficientAvailableCash", 409)
        if (kind === "allocate" && allocated + amount > fund.targetAmount)
          throw new FinanceError("fundTargetExceeded", 409)
        if (kind !== "allocate" && amount > allocated)
          throw new FinanceError("fundBalanceExceeded", 409)
        if (kind === "spend" && cash < amount)
          throw new FinanceError("insufficientCash", 409)
        let transactionId: number | null = null
        if (kind === "spend") {
          const [transaction] = await connection
            .insert(transactions)
            .values({
              type: "expense",
              accountId: fund.accountId,
              amount,
              category,
              date: getToday(),
              description: fund.name + (note ? ": " + note : ""),
            })
            .returning()
          transactionId = transaction.id
        }
        const [entry] = await connection
          .insert(sinkingFundEntries)
          .values({
            fundId,
            kind: String(kind),
            amount,
            date: getToday(),
            note,
            transactionId,
          })
          .returning()
        return entry
      },
      { isolationLevel: "serializable" },
    )
    return NextResponse.json(entry, { status: 201 })
  })
}
