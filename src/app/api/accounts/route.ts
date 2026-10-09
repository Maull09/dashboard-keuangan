import { asc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { accounts } from "@/db/schema"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { parseAccountInput } from "@/lib/validation"

export async function GET(request: Request) {
  return authenticatedResponse(async (db) => {
    const data = await db.select().from(accounts).orderBy(asc(accounts.id))
    return NextResponse.json(data)
  }, request)
}

export async function POST(request: NextRequest) {
  return authenticatedResponse(async (db) => {
    const input = parseAccountInput(await request.json())

    if (!input)
      return NextResponse.json({ code: "invalidInput" }, { status: 400 })

    const [account] = await db.insert(accounts).values(input).returning()
    return NextResponse.json(account, { status: 201 })
  })
}
