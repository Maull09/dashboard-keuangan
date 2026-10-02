import { asc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { accounts } from "@/db/schema"
import { parseAccountInput } from "@/lib/validation"

export async function GET() {
  const data = await db.select().from(accounts).orderBy(asc(accounts.id))
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const input = parseAccountInput(await request.json())

  if (!input) {
    return NextResponse.json({ error: "Data akun tidak valid" }, { status: 400 })
  }

  const [account] = await db.insert(accounts).values(input).returning()
  return NextResponse.json(account, { status: 201 })
}
