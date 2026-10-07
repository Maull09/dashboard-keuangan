import { NextResponse } from "next/server"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { refreshDailyStockPrices } from "@/lib/server/stock-prices"

export const maxDuration = 60

export async function POST() {
  return authenticatedResponse(async (db) =>
    NextResponse.json(await refreshDailyStockPrices(db)),
  )
}
