import { NextRequest, NextResponse } from "next/server"
import { financeResponse } from "@/lib/api-response"
import { refreshDailyStockPrices } from "@/lib/server/stock-prices"

export const maxDuration = 60

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ code: "recordConflict" }, { status: 401 })
  return financeResponse(async () =>
    NextResponse.json(await refreshDailyStockPrices()),
  )
}
