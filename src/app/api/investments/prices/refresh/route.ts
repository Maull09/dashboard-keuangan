import { NextResponse } from "next/server"
import { financeResponse } from "@/lib/api-response"
import { refreshDailyStockPrices } from "@/lib/server/stock-prices"

export const maxDuration = 60

export async function POST() {
  return financeResponse(async () =>
    NextResponse.json(await refreshDailyStockPrices()),
  )
}
