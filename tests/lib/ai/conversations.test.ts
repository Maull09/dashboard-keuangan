import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ execute: vi.fn(), select: vi.fn(), insert: vi.fn(), update: vi.fn() }))
vi.mock("@/lib/ai/server", () => ({ userDatabase: async (_userId: string, action: (connection: unknown) => Promise<unknown>) => action(mocks) }))
import { claimConversation } from "@/lib/ai/conversations"

describe("AI insight conversation admission", () => {
  beforeEach(() => vi.clearAllMocks())
  it("checks the shared user request limit before creating an insight conversation", async () => {
    mocks.select.mockReturnValue({ from: () => ({ where: async () => [{ count: 6 }] }) })
    await expect(claimConversation("signed-in-user", null, "Explain financial health"))
      .rejects.toMatchObject({ code: "aiRateLimited", status: 429 })
    expect(mocks.insert).not.toHaveBeenCalled()
    expect(mocks.update).not.toHaveBeenCalled()
    expect(mocks.execute).toHaveBeenCalledOnce()
  })
  it("creates and claims the new conversation within the same admission transaction", async () => {
    const history = { from: () => ({ where: () => ({ orderBy: () => ({ limit: async () => [] }) }) }) }
    mocks.select.mockReturnValueOnce({ from: () => ({ where: async () => [{ count: 0 }] }) })
      .mockReturnValue(history)
    mocks.insert.mockReturnValue({ values: () => ({ returning: async () => [{ id: "new-conversation" }] }) })
    mocks.update.mockReturnValue({ set: () => ({ where: () => ({ returning: async () => [{ id: "new-conversation" }] }) }) })
    const claim = await claimConversation("signed-in-user", null, "Explain financial health")
    expect(claim).toMatchObject({ conversationId: "new-conversation", history: [{ role: "user", content: "Explain financial health" }], draftContext: [] })
    expect(claim.busyUntil.getTime()).toBeGreaterThan(Date.now())
    expect(mocks.insert).toHaveBeenCalledTimes(2)
  })
})
