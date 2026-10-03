import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { stockWatchlist } from "@/db/schema"
import { financeResponse } from "@/lib/api-response"
import { symbolInput } from "@/lib/planning-validation"
import { FinanceError } from "@/lib/finance-errors"

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) {
  return financeResponse(async () => {
    const symbol = symbolInput((await params).symbol)
    const [item] = await db
      .delete(stockWatchlist)
      .where(eq(stockWatchlist.symbol, symbol))
      .returning()
    if (!item) throw new FinanceError("recordMissing", 404)
    return NextResponse.json({ symbol })
  })
}
