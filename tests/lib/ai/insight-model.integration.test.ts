import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
vi.mock("@/lib/server/user-database", () => ({ userDatabase: () => { throw new Error("Live model tests must not read financial records") } }))
import { explainPageSummary } from "@/lib/ai/page-insights"

describe.skipIf(!process.env.AI_MODEL_TEST_URL)("Ollama page insights with synthetic data", () => {
  beforeAll(() => {
    vi.stubEnv("OLLAMA_BASE_URL", process.env.AI_MODEL_TEST_URL!)
    vi.stubEnv("OLLAMA_MODEL", "qwen3.5:9b")
  })
  afterAll(() => vi.unstubAllEnvs())
  it("explains investment concentration and unknown valuations without raw records", async () => {
    const text = await explainPageSummary("investments", { holdingCount: 2, costBasis: 10000000, marketValue: null,
      knownMarketValue: 5000000, unrealizedGain: null, realizedGain: 0, unpricedCount: 1,
      largestHoldingShare: null, oldestPriceDate: "2026-09-30" }, "id")
    expect(text.length).toBeGreaterThan(30)
    expect(text.length).toBeLessThanOrEqual(12000)
    expect(text.toLowerCase()).toMatch(/harga|nilai|data/)
  }, 130_000)
})
