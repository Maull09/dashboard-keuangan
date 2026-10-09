import { beforeEach, describe, expect, it, vi } from "vitest"
import { AIMessage } from "@langchain/core/messages"
import { z } from "zod"

const mocks = vi.hoisted(() => ({ invoke: vi.fn(), toolInvoke: vi.fn(), receiptInvoke: vi.fn() }))
vi.mock("./model", () => ({ ollamaModel: () => ({
  bindTools: () => ({ invoke: mocks.invoke }),
  withStructuredOutput: () => ({ invoke: mocks.receiptInvoke }),
}) }))
vi.mock("./tools", () => ({ financeTools: () => [{ name: "read_financial_overview", schema: z.object({ month: z.string() }), invoke: mocks.toolInvoke }] }))
import { runChat, runReceipt } from "./graph"

describe("AI graph safeguards", () => {
  beforeEach(() => { vi.clearAllMocks() })
  it("rejects invalid tool arguments before executing a tool", async () => {
    mocks.invoke.mockResolvedValueOnce(new AIMessage({ content: "", tool_calls: [{ name: "read_financial_overview", args: { month: 123 }, id: "call" }] }))
      .mockResolvedValueOnce(new AIMessage("Please specify a month."))
    const result = await runChat("user", [{ role: "user", content: "Summary" }], "en")
    expect(result.text).toBe("Please specify a month.")
    expect(mocks.toolInvoke).not.toHaveBeenCalled()
  })
  it("bounds a model that repeatedly calls tools", async () => {
    mocks.invoke.mockResolvedValue(new AIMessage({ content: "", tool_calls: [{ name: "read_financial_overview", args: { month: "2026-10" }, id: "call" }] }))
    mocks.toolInvoke.mockResolvedValue("{}")
    await expect(runChat("user", [{ role: "user", content: "Summary" }], "id")).rejects.toMatchObject({ code: "aiInvalidResponse" })
    expect(mocks.invoke).toHaveBeenCalledTimes(4)
  })
  it("does not execute an invented write tool", async () => {
    mocks.invoke.mockResolvedValueOnce(new AIMessage({ content: "", tool_calls: [{ name: "save_transaction", args: {}, id: "call" }] }))
      .mockResolvedValueOnce(new AIMessage("Use the confirmation form."))
    const result = await runChat("user", [{ role: "user", content: "Save" }], "en")
    expect(result.drafts).toEqual([])
    expect(mocks.toolInvoke).not.toHaveBeenCalled()
  })
  it("keeps unknown dates blank and does not convert foreign receipt totals to IDR", async () => {
    mocks.receiptInvoke.mockResolvedValue({ merchant: "Shop", total: 50, currency: "USD", date: null, category: "Belanja", notes: "" })
    const result = await runReceipt(new Uint8Array([1]), "image/png", null)
    expect(result.draft).toMatchObject({ amount: null, date: null, accountId: null, type: "expense" })
  })
})
