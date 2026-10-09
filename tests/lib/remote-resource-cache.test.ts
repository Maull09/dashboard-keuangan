import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  clearRemoteResourceCache,
  loadRemoteResource,
} from "@/lib/remote-resource-cache"

describe("remote resource cache", () => {
  beforeEach(clearRemoteResourceCache)

  it("shares one request among concurrent consumers", async () => {
    let resolve: (value: string[]) => void
    const response = new Promise<string[]>((done) => {
      resolve = done
    })
    const load = vi.fn(() => response)

    const first = loadRemoteResource("/api/accounts", load)
    const second = loadRemoteResource("/api/accounts", load)
    expect(load).toHaveBeenCalledTimes(1)

    resolve!(["Cash"])
    await expect(first).resolves.toEqual(["Cash"])
    await expect(second).resolves.toEqual(["Cash"])
  })

  it("fetches fresh data after invalidation", async () => {
    const load = vi.fn().mockResolvedValue(["Cash"])

    await loadRemoteResource("/api/accounts", load)
    await loadRemoteResource("/api/accounts", load)
    expect(load).toHaveBeenCalledTimes(1)

    clearRemoteResourceCache()
    await loadRemoteResource("/api/accounts", load)
    expect(load).toHaveBeenCalledTimes(2)
  })
})
