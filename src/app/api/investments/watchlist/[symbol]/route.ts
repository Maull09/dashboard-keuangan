import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { stockInstruments, stockWatchlist } from "@/db/schema"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { recordInput, symbolInput, textInput } from "@/lib/planning-validation"
import { FinanceError } from "@/lib/finance-errors"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) {
  return authenticatedResponse(async (db) => {
    const symbol = symbolInput((await params).symbol)
    const body = recordInput(await request.json())
    if (body.symbol != null && symbolInput(body.symbol) !== symbol)
      throw new FinanceError("invalidInput")
    const name = textInput(body.name)
    const note = textInput(body.note, 500, false)
    const item = await db.transaction(async (connection) => {
      const [updated] = await connection
        .update(stockWatchlist)
        .set({ note })
        .where(eq(stockWatchlist.symbol, symbol))
        .returning()
      if (!updated) throw new FinanceError("recordMissing", 404)
      await connection
        .update(stockInstruments)
        .set({ name })
        .where(eq(stockInstruments.symbol, symbol))
      return updated
    })
    return NextResponse.json(item)
  })
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) {
  return authenticatedResponse(async (db) => {
    const symbol = symbolInput((await params).symbol)
    const [item] = await db
      .delete(stockWatchlist)
      .where(eq(stockWatchlist.symbol, symbol))
      .returning()
    if (!item) throw new FinanceError("recordMissing", 404)
    return NextResponse.json({ symbol })
  })
}
