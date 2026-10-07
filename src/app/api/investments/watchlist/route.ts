import { NextRequest, NextResponse } from "next/server"
import { stockInstruments, stockWatchlist } from "@/db/schema"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { recordInput, symbolInput, textInput } from "@/lib/planning-validation"
import { FinanceError } from "@/lib/finance-errors"

export async function POST(request: NextRequest) {
  return authenticatedResponse(async (db) => {
    const body = recordInput(await request.json())
    const symbol = symbolInput(body.symbol)
    const name = textInput(body.name ?? symbol)
    const note = textInput(body.note, 500, false)
    const item = await db.transaction(async (connection) => {
      await connection
        .insert(stockInstruments)
        .values({ symbol, name })
        .onConflictDoNothing()
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
