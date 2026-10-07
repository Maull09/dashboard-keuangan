import { NextRequest, NextResponse } from "next/server"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { integerInput } from "@/lib/planning-validation"
import { removeStockTrade, updateStockTrade } from "@/lib/server/stock-trades"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return authenticatedResponse(async (db) =>
    NextResponse.json(
      await updateStockTrade(
        db,
        integerInput((await params).id, 1, 2_147_483_647),
        await request.json(),
      ),
    ),
  )
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return authenticatedResponse(async (db) =>
    NextResponse.json(
      await removeStockTrade(
        db,
        integerInput((await params).id, 1, 2_147_483_647),
      ),
    ),
  )
}
