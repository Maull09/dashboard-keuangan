import { NextResponse } from "next/server"

import { readLedger } from "@/lib/server/ledger"
import { financeResponse } from "@/lib/api-response"

export async function GET() {
  return financeResponse(async () => {
    const { summaries } = await readLedger()
    return NextResponse.json(
      summaries.map(({ id, name, type, description, balance }) => ({
        id,
        name,
        type,
        description,
        balance,
      })),
    )
  })
}
