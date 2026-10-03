import { NextRequest, NextResponse } from "next/server"
import { financeResponse } from "@/lib/api-response"
import { integerInput } from "@/lib/planning-validation"
import { removeStockTrade, updateStockTrade } from "@/lib/server/stock-trades"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return financeResponse(async () =>
    NextResponse.json(
      await updateStockTrade(
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
  return financeResponse(async () =>
    NextResponse.json(
      await removeStockTrade(integerInput((await params).id, 1, 2_147_483_647)),
    ),
  )
}
