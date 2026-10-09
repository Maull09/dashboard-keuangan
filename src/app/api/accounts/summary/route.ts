import { NextResponse } from "next/server"

import { readBalanceLedger } from "@/lib/server/financial-queries"
import { authenticatedResponse } from "@/lib/server/authenticated-response"

export async function GET(request: Request) {
  return authenticatedResponse(async (db) => {
    const { summaries } = await readBalanceLedger(db)
    return NextResponse.json(
      summaries.map(
        ({ id, name, type, initialBalance, description, balance }) => ({
          id,
          name,
          type,
          initialBalance,
          description,
          balance,
        }),
      ),
    )
  }, request)
}
