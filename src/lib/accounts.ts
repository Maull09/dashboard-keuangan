import { inArray } from "drizzle-orm"

import type { UserDatabase } from "@/lib/server/authenticated-response"
import { accounts } from "@/db/schema"

export async function accountsExist(
  db: Pick<UserDatabase, "select">,
  accountId: number,
  destinationAccountId: number | null,
) {
  const accountIds =
    destinationAccountId == null
      ? [accountId]
      : [accountId, destinationAccountId]
  const foundAccounts = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(inArray(accounts.id, accountIds))

  return foundAccounts.length === accountIds.length
}
