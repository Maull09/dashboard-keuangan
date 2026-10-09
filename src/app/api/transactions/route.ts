import {
  and,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  or,
} from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { transactions } from "@/db/schema"
import { accountsExist } from "@/lib/accounts"
import { authenticatedResponse } from "@/lib/server/authenticated-response"
import { readTransactionPage } from "@/lib/server/transaction-queries"
import { parseTransactionInput } from "@/lib/validation"
import {
  findEnglishCategoryMatches,
  parseTransactionFilters,
} from "@/lib/transaction-filters"

export async function GET(request: NextRequest) {
  return authenticatedResponse(async (db) => {
    const params = new URL(request.url).searchParams
    const pageValue = Number(params.get("page"))
    const limitValue = Number(params.get("limit") ?? 25)
    const filters = parseTransactionFilters(params)
    if (!filters)
      return NextResponse.json({ code: "invalidInput" }, { status: 400 })
    const conditions = []
    if (filters.type !== "all")
      conditions.push(eq(transactions.type, filters.type))
    if (filters.accountId)
      conditions.push(
        or(
          eq(transactions.accountId, filters.accountId),
          eq(transactions.destinationAccountId, filters.accountId),
        ),
      )
    if (filters.from) conditions.push(gte(transactions.date, filters.from))
    if (filters.to) conditions.push(lte(transactions.date, filters.to))
    if (filters.groupName)
      conditions.push(eq(transactions.groupName, filters.groupName))
    if (filters.ungrouped) conditions.push(isNull(transactions.groupName))
    if (filters.search) {
      const search = "%" + filters.search.replace(/[\\%_]/g, "\\$&") + "%"
      const translatedCategories = findEnglishCategoryMatches(filters.search)
      conditions.push(
        or(
          ilike(transactions.category, search),
          ilike(transactions.description, search),
          ilike(transactions.groupName, search),
          translatedCategories.length
            ? inArray(transactions.category, translatedCategories)
            : undefined,
        ),
      )
    }
    const where = and(...conditions)

    if (!Number.isSafeInteger(pageValue) || pageValue < 1) {
      const data = await db
        .select()
        .from(transactions)
        .where(where)
        .orderBy(desc(transactions.date), desc(transactions.id))
      return NextResponse.json(data)
    }

    const limit = Number.isSafeInteger(limitValue)
      ? Math.min(Math.max(limitValue, 1), 100)
      : 25
    return NextResponse.json(await readTransactionPage(db, where, pageValue, limit))
  }, request)
}
export async function POST(request: NextRequest) {
  return authenticatedResponse(async (db) => {
    const input = parseTransactionInput(await request.json())

    if (
      !input ||
      !(await accountsExist(db, input.accountId, input.destinationAccountId))
    )
      return NextResponse.json({ code: "invalidInput" }, { status: 400 })

    const [transaction] = await db
      .insert(transactions)
      .values(input)
      .returning()
    return NextResponse.json(transaction, { status: 201 })
  })
}
