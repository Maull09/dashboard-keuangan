import { NextRequest, NextResponse } from "next/server"
import { financeResponse } from "@/lib/api-response"
import { recordStockTrade } from "@/lib/server/stock-trades"

export async function POST(request: NextRequest) {
  return financeResponse(async () =>
    NextResponse.json(await recordStockTrade(await request.json()), {
      status: 201,
    }),
  )
}
