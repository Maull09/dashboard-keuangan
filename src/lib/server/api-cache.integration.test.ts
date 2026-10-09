import { randomUUID } from "node:crypto"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { readApiCache, writeApiCache } from "./api-cache"
import { getRedisClient } from "./redis"

const testUrl = process.env.REDIS_TEST_URL

describe.skipIf(!testUrl)("local Redis cache integration", () => {
  const key = `finance-tracker:api:test:${randomUUID()}`
  let configured = false
  beforeAll(() => {
    const url = new URL(testUrl!)
    if (!["localhost", "127.0.0.1"].includes(url.hostname))
      throw new Error("Redis tests require a local server")
    vi.stubEnv("REDIS_URL", testUrl)
    configured = true
  })
  afterAll(async () => {
    if (!configured) return
    const client = await getRedisClient()
    if (client) {
      await client.del(key)
      await client.close()
    }
    vi.unstubAllEnvs()
  })
  it("reuses the connection and stores expiring JSON through the real client", async () => {
    const [first, second] = await Promise.all([getRedisClient(), getRedisClient()])
    expect(first).toBe(second)
    expect(await readApiCache(key)).toBeNull()
    await writeApiCache(key, '{"balance":12345}')
    expect(await readApiCache(key)).toBe('{"balance":12345}')
    expect(await first!.ttl(key)).toBeGreaterThan(0)
    expect(await first!.ttl(key)).toBeLessThanOrEqual(60)
  })
})
