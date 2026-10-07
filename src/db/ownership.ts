import { sql } from "drizzle-orm"
import { pgPolicy, pgRole } from "drizzle-orm/pg-core"

export const financeUser = pgRole("finance_user").existing()

// Names are schema constants, never request input. Referenced rows must also be
// visible through their own ownership policy; foreign keys alone bypass RLS.
export function ownerPolicy(
  table: string,
  references: [string, string][] = [],
) {
  const owner = `${table}.user_id = nullif(current_setting('app.user_id', true), '')::uuid`
  const related = references.map(
    ([column, parent]) =>
      `(${table}.${column} is null or exists (select 1 from public.${parent} where ${parent}.id = ${table}.${column}))`,
  )
  return pgPolicy("owner_access", {
    as: "restrictive",
    for: "all",
    to: financeUser,
    using: sql.raw(owner),
    withCheck: sql.raw([owner, ...related].join(" and ")),
  })
}

export function privateAccessPolicy() {
  return pgPolicy("app_access", { for: "all", to: financeUser, using: sql`true`, withCheck: sql`true` })
}

export function marketReadPolicy() {
  return pgPolicy("market_read", {
    for: "select",
    to: financeUser,
    using: sql`true`,
  })
}

export function marketInsertPolicy() {
  return pgPolicy("market_insert", {
    for: "insert",
    to: financeUser,
    withCheck: sql`true`,
  })
}

export function marketUpdatePolicy() {
  return pgPolicy("market_update", {
    for: "update",
    to: financeUser,
    using: sql`true`,
    withCheck: sql`true`,
  })
}
