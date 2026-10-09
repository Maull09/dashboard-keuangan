import { createHash } from "node:crypto"
import { sql } from "drizzle-orm"
import { getToday } from "@/lib/finance"
import type { UserDatabase } from "./authenticated-response"
import { getRedisClient } from "./redis"

const cacheLifetimeSeconds = 60

export async function apiCacheKey(
  connection: Pick<UserDatabase, "execute">,
  userId: string,
  request: Request,
) {
  const { rows } = await connection.execute<{ scope: string; revision: string }>(
    sql`select scope, revision from api_cache_revisions
        where scope in (${userId}, 'market') order by scope`,
  )
  const url = new URL(request.url)
  url.searchParams.sort()
  const digest = createHash("sha256")
    .update(JSON.stringify([
      url.origin,
      url.pathname,
      url.searchParams.toString(),
      getToday(),
      rows,
    ]))
    .digest("hex")
  return `finance-tracker:api:v1:${userId}:${digest}`
}

export async function readApiCache(key: string) {
  try {
    const client = await getRedisClient()
    if (!client) return null
    const body = await client.withCommandOptions({ abortSignal: AbortSignal.timeout(1000) }).get(key)
    if (body !== null) JSON.parse(body)
    return body
  } catch {
    console.warn("Redis cache read unavailable")
    return null
  }
}

export async function writeApiCache(key: string, body: string) {
  try {
    const client = await getRedisClient()
    if (!client) return
    await client.withCommandOptions({ abortSignal: AbortSignal.timeout(1000) })
      .set(key, body, { EX: cacheLifetimeSeconds })
  } catch {
    console.warn("Redis cache write unavailable")
  }
}
