import { sql } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/db"
import { financeResponse } from "@/lib/api-response"
import { FinanceError } from "@/lib/finance-errors"
import { createClient } from "@/lib/supabase/server"
import type { UserDatabase } from "@/lib/server/authenticated-response"

export function userDatabase<T>(userId: string, action: (connection: UserDatabase) => Promise<T>) {
  return db.transaction(async (connection) => {
    await connection.execute(sql`set local role finance_user`)
    await connection.execute(sql`select set_config('app.user_id', ${userId}, true)`)
    return action(connection)
  })
}

type AiSession = { userId: string; supabase: Awaited<ReturnType<typeof createClient>> }

export async function aiResponse(request: Request, action: (session: AiSession) => Promise<Response>) {
  const response = await financeResponse(async () => {
    const origin = request.headers.get("origin")
    if (request.headers.get("sec-fetch-site") === "cross-site" ||
        (origin && new URL(origin).host !== request.headers.get("host"))) {
      throw new FinanceError("forbidden", 403)
    }
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) throw new FinanceError("unauthorized", 401)
    try {
      return await action({ userId: user.id, supabase })
    } catch (error) {
      if (error instanceof z.ZodError) throw new FinanceError("invalidInput")
      throw error
    }
  })
  response.headers.set("Cache-Control", "private, no-store")
  return response
}

export async function readAiJson(request: Request) {
  return JSON.parse((await readBoundedBody(request, 16_384)).toString("utf8")) as unknown
}

export async function readBoundedBody(request: Request, maximum: number) {
  const reader = request.body?.getReader()
  if (!reader) throw new FinanceError("invalidInput")
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const chunk = await reader.read()
    if (chunk.done) break
    size += chunk.value.byteLength
    if (size > maximum) {
      await reader.cancel()
      throw new FinanceError("invalidInput", 413)
    }
    chunks.push(chunk.value)
  }
  return Buffer.concat(chunks)
}
