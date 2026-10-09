import { readFile } from "node:fs/promises"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

// This suite sends only synthetic text/images to an explicitly configured local model.
const boundary = vi.hoisted(() => ({ userDatabase: vi.fn() }))
vi.mock("@/lib/ai/server", () => ({ userDatabase: boundary.userDatabase }))
import { runChat, runReceipt } from "@/lib/ai/graph"
import { explainFinancialHealth } from "@/lib/ai/financial-health"
import { calculateFinancialHealth } from "@/lib/financial-health"

describe.skipIf(!process.env.AI_MODEL_TEST_URL)("local Ollama integration", () => {
  beforeAll(() => {
    vi.stubEnv("OLLAMA_BASE_URL", process.env.AI_MODEL_TEST_URL!)
    vi.stubEnv("OLLAMA_MODEL", "qwen3.5:9b")
  })
  afterAll(() => vi.unstubAllEnvs())

  it("explains the calculated financial health score using only synthetic indicators", async () => {
    const report = calculateFinancialHealth({
      month: "2026-09", asOf: "2026-09-30", partial: false,
      months: [{ month: "2026-09", income: 15000000, expense: 9000000, count: 30, transfers: 5, largestIncomeCategory: 15000000 }],
      liquidAssets: 30000000, totalAssets: 120000000, totalLiabilities: 30000000,
      recordedDebtPayments: 2000000, recurringExpense: 1000000, unpricedHoldings: 0, oldestPriceDate: null,
    }, { month: "2026-09", essentialExpense: 6000000, monthlyDebtPayment: 2000000 })
    const text = await explainFinancialHealth(report, "id")
    expect(text).toContain("82")
    expect(report.score).toBe(82)
    expect(boundary.userDatabase).not.toHaveBeenCalled()
  }, 130_000)

  it("replies in Indonesian without touching the database", async () => {
    const result = await runChat("synthetic-user", [{ role: "user", content: "Halo, apa yang bisa kamu lakukan? Jangan baca data akun." }], "id")
    expect(result.text.length).toBeGreaterThan(10)
    expect(result.drafts).toHaveLength(0)
    expect(boundary.userDatabase).not.toHaveBeenCalled()
  }, 130_000)

  it("uses a LangChain tool to prepare an incomplete draft without saving money", async () => {
    const result = await runChat("synthetic-user", [{ role: "user", content: "Buat draft pengeluaran Makanan sebesar Rp25000 untuk makan siang tanggal 2026-10-09. Akun belum saya pilih: accountId harus null. Jangan baca data keuangan." }], "id")
    expect(result.drafts).toHaveLength(1)
    expect(result.drafts[0]).toMatchObject({ type: "expense", amount: 25000, date: "2026-10-09", accountId: null })
    expect(boundary.userDatabase).not.toHaveBeenCalled()
  }, 130_000)

  it.skipIf(!process.env.AI_RECEIPT_TEST_PATH)("reads the final total from a synthetic receipt image", async () => {
    const bytes = await readFile(process.env.AI_RECEIPT_TEST_PATH!)
    const result = await runReceipt(bytes, "image/png", null)
    expect(result.draft).toMatchObject({ type: "expense", amount: 25000, date: "2026-10-09", accountId: null })
    expect(boundary.userDatabase).not.toHaveBeenCalled()
  }, 130_000)
})
