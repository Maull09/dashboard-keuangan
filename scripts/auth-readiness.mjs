import { ownedTables } from "./auth-tables.mjs"

export async function verifyAuthReadiness(client) {
  const { rows: roles } = await client.query(
    "SELECT rolcanlogin, rolbypassrls, rolsuper, pg_has_role(current_user, oid, 'MEMBER') AS member FROM pg_roles WHERE rolname = 'finance_user'",
  )
  if (roles.length !== 1 || roles[0].rolcanlogin || roles[0].rolbypassrls || roles[0].rolsuper || !roles[0].member)
    throw new Error("Auth database role is missing, privileged, or unavailable to the connection user.")
  const { rows: tables } = await client.query(
    "SELECT relname, relrowsecurity FROM pg_class WHERE relnamespace = 'public'::regnamespace AND relname = ANY($1::text[])",
    [ownedTables],
  )
  const { rows: policies } = await client.query(
    "SELECT tablename, policyname, permissive, cmd, roles, qual, with_check FROM pg_policies WHERE schemaname = 'public' AND tablename = ANY($1::text[])",
    [ownedTables],
  )
  for (const name of ownedTables) {
    const policy = policies.find(row => row.tablename === name && row.policyname === "owner_access")
    if (!tables.some(row => row.relname === name && row.relrowsecurity) ||
        !policy || policy.permissive !== "RESTRICTIVE" || policy.cmd !== "ALL" || !policy.roles.includes("finance_user") ||
        !policy.qual?.includes("app.user_id") || !policy.with_check?.includes("app.user_id"))
      throw new Error(`Ownership protection is missing for ${name}.`)
  }
}
