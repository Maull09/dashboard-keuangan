import { NextRequest, NextResponse } from "next/server"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { recordStockTrade } from "@/lib/server/stock-trades"

export async function POST(request: NextRequest) {
  return authenticatedResponse(async (db) =>
    NextResponse.json(await recordStockTrade(db, await request.json()), {
      status: 201,
    }),
  )
}
