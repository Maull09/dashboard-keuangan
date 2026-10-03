import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { stockInstruments, stockWatchlist } from "@/db/schema"
import { financeResponse } from "@/lib/api-response"
import { recordInput, symbolInput, textInput } from "@/lib/planning-validation"
import { FinanceError } from "@/lib/finance-errors"

export async function POST(request: NextRequest) {
  return financeResponse(async () => {
    const body = recordInput(await request.json())
    const symbol = symbolInput(body.symbol)
    const name = textInput(body.name ?? symbol)
    const note = textInput(body.note, 500, false)
    const item = await db.transaction(async (connection) => {
      await connection
        .insert(stockInstruments)
        .values({ symbol, name })
        .onConflictDoUpdate({ target: stockInstruments.symbol, set: { name } })
      const [item] = await connection
        .insert(stockWatchlist)
        .values({ symbol, note })
        .onConflictDoNothing()
        .returning()
      if (!item) throw new FinanceError("watchAlreadyExists", 409)
      return item
    })
    return NextResponse.json(item, { status: 201 })
  })
}
