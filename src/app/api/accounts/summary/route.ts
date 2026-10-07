import { NextResponse } from "next/server"

import { readLedger } from "@/lib/server/ledger"
import { authenticatedResponse } from "@/lib/server/authenticated-response"

export async function GET() {
  return authenticatedResponse(async (db) => {
    const { summaries } = await readLedger(db)
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
  })
}
