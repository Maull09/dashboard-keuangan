import { asc, isNotNull } from "drizzle-orm"
import { NextResponse } from "next/server"
import { transactions } from "@/db/schema"
import { authenticatedResponse } from "@/lib/server/authenticated-response"

export async function GET() {
  return authenticatedResponse(async (db) => {
    const groups = await db
      .selectDistinct({ name: transactions.groupName })
      .from(transactions)
      .where(isNotNull(transactions.groupName))
      .orderBy(asc(transactions.groupName))
    return NextResponse.json(groups.map((group) => group.name))
  })
}
