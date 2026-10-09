import { beforeEach, describe, expect, it, vi } from "vitest"
import { calculateFinancialHealth } from "@/lib/financial-health"

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), execute: vi.fn(), read: vi.fn(), explain: vi.fn(), claim: vi.fn(), save: vi.fn(), release: vi.fn() }))
vi.mock("@/db", () => ({ db: { transaction: async (action: (db: unknown) => Promise<unknown>) => action({ execute: mocks.execute }) } }))
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { getUser: mocks.getUser } }) }))
vi.mock("@/lib/server/financial-health-queries", () => ({ readFinancialHealth: mocks.read }))
vi.mock("@/lib/ai/financial-health", () => ({ explainFinancialHealth: mocks.explain }))
vi.mock("@/lib/ai/conversations", () => ({ claimConversation: mocks.claim, saveReply: mocks.save, releaseConversation: mocks.release }))
import { POST } from "@/app/api/ai/financial-health/route"

const userId = "00000000-0000-4000-8000-000000000001"
const conversationId = "00000000-0000-4000-8000-000000000003"
const input = { month: "2026-09", essentialExpense: 6000000, monthlyDebtPayment: 2000000, locale: "id" }
const report = calculateFinancialHealth({ month: input.month, asOf: "2026-09-30", partial: false,
  months: [], liquidAssets: 0, totalAssets: 0, totalLiabilities: 0, recordedDebtPayments: 0,
  recurringExpense: 0, unpricedHoldings: 0, oldestPriceDate: null,
}, input)
const request = (body: unknown = input, headers: Record<string, string> = {}) => new Request("http://localhost/api/ai/financial-health", {
  method: "POST", headers: { host: "localhost", "content-type": "application/json", ...headers }, body: JSON.stringify(body),
})

describe("financial health AI endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: userId } }, error: null })
    mocks.read.mockResolvedValue(report)
    mocks.claim.mockResolvedValue({ conversationId, busyUntil: new Date("2026-10-09") })
    mocks.explain.mockResolvedValue("Lengkapi data keuangan Anda.")
  })
  it("recalculates the report under the authenticated user's database role before requesting insights", async () => {
    const response = await POST(request())
    expect(response.status).toBe(200)
    expect(response.headers.get("cache-control")).toBe("private, no-store")
    expect(mocks.execute).toHaveBeenCalledTimes(2)
    expect(mocks.read).toHaveBeenCalledWith(expect.anything(), { month: input.month, essentialExpense: 6000000, monthlyDebtPayment: 2000000 })
    expect(mocks.explain).toHaveBeenCalledWith(report, "id")
    expect(mocks.claim).toHaveBeenCalledWith(userId, null, expect.stringContaining("2026-09"))
    expect(mocks.save).toHaveBeenCalledWith(userId, conversationId, "Lengkapi data keuangan Anda.", [])
    expect(mocks.release).toHaveBeenCalledOnce()
    expect(await response.json()).toMatchObject({ report, insight: "Lengkapi data keuangan Anda." })
  })
  it("rejects client-supplied scores and other-user IDs instead of trusting them", async () => {
    const response = await POST(request({ ...input, score: 100, userId: "other" }))
    expect(response.status).toBe(400)
    expect(mocks.read).not.toHaveBeenCalled()
    expect(mocks.explain).not.toHaveBeenCalled()
  })
  it("blocks unauthenticated and cross-origin requests before reading records", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null })
    expect((await POST(request())).status).toBe(401)
    expect((await POST(request(input, { origin: "https://other.test" }))).status).toBe(403)
    expect(mocks.read).not.toHaveBeenCalled()
    expect(mocks.explain).not.toHaveBeenCalled()
  })
  it("shares AI rate limiting and skips inference when admission is rejected", async () => {
    const { FinanceError } = await import("@/lib/finance-errors")
    mocks.claim.mockRejectedValue(new FinanceError("aiRateLimited", 429))
    expect((await POST(request())).status).toBe(429)
    expect(mocks.explain).not.toHaveBeenCalled()
    expect(mocks.save).not.toHaveBeenCalled()
  })
  it("releases the conversation on model failure without saving an answer", async () => {
    const { FinanceError } = await import("@/lib/finance-errors")
    mocks.explain.mockRejectedValue(new FinanceError("aiUnavailable", 503))
    expect((await POST(request())).status).toBe(503)
    expect(mocks.release).toHaveBeenCalledOnce()
    expect(mocks.save).not.toHaveBeenCalled()
  })
})
