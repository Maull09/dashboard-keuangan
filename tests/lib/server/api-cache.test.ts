import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({ client: vi.fn(), get: vi.fn(), set: vi.fn(), options: vi.fn() }))
vi.mock("@/lib/server/redis", () => ({ getRedisClient: state.client }))
import { apiCacheKey, readApiCache, writeApiCache } from "@/lib/server/api-cache"

describe("financial API Redis cache", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-09T03:00:00Z"))
    state.options.mockReturnValue({ get: state.get, set: state.set })
    state.client.mockResolvedValue({ withCommandOptions: state.options })
    state.get.mockResolvedValue(null)
    state.set.mockResolvedValue("OK")
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("separates user data, filters, languages, endpoints, and deployment origins", async () => {
    const connection = { execute: vi.fn().mockResolvedValue({ rows: [] }) }
    const key = (user: string, path: string) => apiCacheKey(connection, user, new Request(path))
    const base = await key("user-a", "http://localhost/api/dashboard?month=2026-10&locale=id")
    expect(await key("user-a", "http://localhost/api/dashboard?locale=id&month=2026-10")).toBe(base)
    for (const [user, url] of [
      ["user-b", "http://localhost/api/dashboard?month=2026-10&locale=id"],
      ["user-a", "http://localhost/api/dashboard?month=2026-09&locale=id"],
      ["user-a", "http://localhost/api/dashboard?month=2026-10&locale=en"],
      ["user-a", "http://localhost/api/transactions?month=2026-10&locale=id"],
      ["user-a", "https://finance.example/api/dashboard?month=2026-10&locale=id"],
    ]) expect(await key(user, url)).not.toBe(base)
  })
  it("makes stale entries unreachable after a committed revision change or Jakarta midnight", async () => {
    const connection = { execute: vi.fn().mockResolvedValue({ rows: [{ scope: "user-a", revision: "one" }] }) }
    const request = new Request("http://localhost/api/dashboard")
    const first = await apiCacheKey(connection, "user-a", request)
    connection.execute.mockResolvedValue({ rows: [{ scope: "user-a", revision: "two" }] })
    const changed = await apiCacheKey(connection, "user-a", request)
    expect(changed).not.toBe(first)
    vi.setSystemTime(new Date("2026-10-09T17:00:00Z"))
    expect(await apiCacheKey(connection, "user-a", request)).not.toBe(changed)
  })
  it("expires cached JSON after 60 seconds", async () => {
    await writeApiCache("key", '{"balance":123}')
    expect(state.set).toHaveBeenCalledWith("key", '{"balance":123}', { EX: 60 })
    expect(state.options).toHaveBeenCalledWith({ abortSignal: expect.any(AbortSignal) })
    state.get.mockResolvedValue('{"balance":123}')
    expect(await readApiCache("key")).toBe('{"balance":123}')
  })
  it("treats broken JSON as a cache miss", async () => {
    state.get.mockResolvedValue("broken")
    expect(await readApiCache("key")).toBeNull()
  })
  it("allows database reads and writes when Redis is unavailable", async () => {
    state.client.mockRejectedValue(new Error("connection failed"))
    expect(await readApiCache("key")).toBeNull()
    await expect(writeApiCache("key", "{}")).resolves.toBeUndefined()
    state.client.mockResolvedValue(null)
    expect(await readApiCache("key")).toBeNull()
    await expect(writeApiCache("key", "{}")).resolves.toBeUndefined()
  })
})
