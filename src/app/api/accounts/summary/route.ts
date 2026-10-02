import { NextResponse } from "next/server"

import { db } from "@/db"
import { accounts, transactions } from "@/db/schema"

export async function GET() {
  const [allAccounts, allTransactions] = await Promise.all([
    db.select().from(accounts),
    db.select().from(transactions),
  ])

  const summaries = allAccounts.map((account) => {
    const balance = allTransactions.reduce((total, transaction) => {
      if (transaction.accountId === account.id && transaction.type === "income") return total + transaction.amount
      if (transaction.accountId === account.id && (transaction.type === "expense" || transaction.type === "transfer")) return total - transaction.amount
      if (transaction.destinationAccountId === account.id && transaction.type === "transfer") return total + transaction.amount
      return total
    }, account.initialBalance)

    return { id: account.id, name: account.name, type: account.type, description: account.description, balance }
  })

  return NextResponse.json(summaries)
}
