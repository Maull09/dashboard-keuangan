import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { sql } from "drizzle-orm"
import { db } from "@/db"
import { createClient } from "@/lib/supabase/server"
import { financeResponse } from "@/lib/api-response"

export type UserDatabase = Parameters<Parameters<typeof db.transaction>[0]>[0]

export async function authenticatedResponse(
  action: (connection: UserDatabase) => Promise<Response>,
) {
  const response = await financeResponse(async () => {
    const requestHeaders = await headers()
    const origin = requestHeaders.get("origin")
    const host = requestHeaders.get("host")
    if (
      requestHeaders.get("sec-fetch-site") === "cross-site" ||
      (origin && new URL(origin).host !== host)
    )
      return NextResponse.json({ code: "forbidden" }, { status: 403 })

    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user)
      return NextResponse.json({ code: "unauthorized" }, { status: 401 })

    return db.transaction(
      async (connection) => {
        // The connection URL may belong to a privileged role. Always drop privileges.
        await connection.execute(sql`set local role finance_user`)
        await connection.execute(
          sql`select set_config('app.user_id', ${user.id}, true)`,
        )
        return action(connection)
      },
      { isolationLevel: "serializable" },
    )
  })
  response.headers.set("Cache-Control", "private, no-store")
  return response
}
