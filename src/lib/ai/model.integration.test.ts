import { readFile } from "node:fs/promises"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

// This suite sends only synthetic text/images to an explicitly configured local model.
const boundary = vi.hoisted(() => ({ userDatabase: vi.fn() }))
vi.mock("./server", () => ({ userDatabase: boundary.userDatabase }))
import { runChat, runReceipt } from "./graph"

describe.skipIf(!process.env.AI_MODEL_TEST_URL)("local Ollama integration", () => {
  beforeAll(() => {
    vi.stubEnv("OLLAMA_BASE_URL", process.env.AI_MODEL_TEST_URL!)
    vi.stubEnv("OLLAMA_MODEL", "qwen3.5:9b")
  })
  afterAll(() => vi.unstubAllEnvs())

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
