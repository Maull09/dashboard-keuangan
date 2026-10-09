import { AIMessage } from "@langchain/core/messages"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { calculateFinancialHealth, type HealthSnapshot } from "@/lib/financial-health"

const mocks = vi.hoisted(() => ({ invoke: vi.fn() }))
vi.mock("@/lib/ai/model", () => ({ ollamaModel: () => ({ invoke: mocks.invoke }) }))
import { explainFinancialHealth, healthInsightSummary } from "@/lib/ai/financial-health"

const snapshot: HealthSnapshot = {
  month: "2026-09", asOf: "2026-09-30", partial: false,
  months: [{ month: "2026-09", income: 15_000_000, expense: 9_000_000, count: 100, transfers: 10, largestIncomeCategory: 12_000_000 }],
  liquidAssets: 30_000_000, totalAssets: 120_000_000, totalLiabilities: 30_000_000,
  recordedDebtPayments: 2_000_000, recurringExpense: 3_000_000, unpricedHoldings: 0, oldestPriceDate: null,
}
const report = calculateFinancialHealth(snapshot, { month: snapshot.month, essentialExpense: 6_000_000, monthlyDebtPayment: 2_000_000 })

describe("financial health AI explanation", () => {
  beforeEach(() => vi.clearAllMocks())
  it("sends only the computed summary to the existing model and preserves the deterministic score", async () => {
    mocks.invoke.mockResolvedValue(new AIMessage("Skor Anda 82, dengan cakupan darurat 5 bulan."))
    expect(await explainFinancialHealth(report, "id")).toContain("82")
    const [messages, options] = mocks.invoke.mock.calls[0]
    const payload = JSON.parse(messages[1].content)
    expect(payload).toEqual(healthInsightSummary(report))
    expect(payload).not.toHaveProperty("months")
    expect(payload).not.toHaveProperty("input")
    expect(payload.score).toBe(82)
    expect(messages[0].content).toContain("Indonesian")
    expect(options.signal).toBeInstanceOf(AbortSignal)
    expect(report.score).toBe(82)
  })
  it("keeps unknown metrics null and asks the model to explain incomplete data", async () => {
    mocks.invoke.mockResolvedValue(new AIMessage("Please complete essential monthly expenses."))
    await explainFinancialHealth(calculateFinancialHealth(snapshot, { month: snapshot.month, essentialExpense: null, monthlyDebtPayment: null }), "en")
    const messages = mocks.invoke.mock.calls[0][0]
    expect(JSON.parse(messages[1].content)).toMatchObject({ score: null, emergencyMonths: null, debtServiceRatio: null })
    expect(messages[0].content).toContain("English")
    expect(messages[0].content).toContain("Null values are unknown, not zero")
  })
  it("rejects empty or oversized output and maps service failures without exposing details", async () => {
    for (const content of [" ", "x".repeat(12_001)]) {
      mocks.invoke.mockResolvedValue(new AIMessage(content))
      await expect(explainFinancialHealth(report, "id")).rejects.toMatchObject({ code: "aiInvalidResponse" })
    }
    mocks.invoke.mockRejectedValue(new Error("private service error"))
    await expect(explainFinancialHealth(report, "id")).rejects.toMatchObject({ code: "aiUnavailable" })
  })
})
