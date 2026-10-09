import { afterEach, describe, expect, it, vi } from "vitest"
const mocks = vi.hoisted(() => ({ ready: vi.fn(), on: vi.fn() }))
vi.mock("bullmq", () => ({ Queue: class {
  waitUntilReady = mocks.ready
  on = mocks.on
} }))
vi.mock("ioredis", () => ({ default: class {} }))
import { withInsightQueue } from "@/lib/ai/insight-queue"

describe("insight queue availability", () => {
  afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs() })
  it("returns a bounded failure during startup outage and can recover on the next request", async () => {
    vi.useFakeTimers()
    vi.stubEnv("INSIGHTS_REDIS_URL", "redis://127.0.0.1:6380")
    mocks.ready.mockImplementationOnce(() => new Promise(() => {}))
    const action = vi.fn().mockResolvedValue("ready")
    const unavailable = expect(withInsightQueue(action)).rejects.toMatchObject({ code: "aiUnavailable", status: 503 })
    await vi.advanceTimersByTimeAsync(3000)
    await unavailable
    expect(action).not.toHaveBeenCalled()
    mocks.ready.mockResolvedValueOnce(undefined)
    expect(await withInsightQueue(action)).toBe("ready")
    expect(action).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })
})
