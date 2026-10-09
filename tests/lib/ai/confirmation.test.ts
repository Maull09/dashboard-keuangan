import { beforeEach, describe, expect, it, vi } from "vitest"
import type { UserDatabase } from "@/lib/server/authenticated-response"

const mocks = vi.hoisted(() => ({ accountsExist: vi.fn() }))
vi.mock("@/lib/accounts", () => ({ accountsExist: mocks.accountsExist }))
import { decideDraft } from "@/lib/ai/confirmation"

const data = { type: "expense" as const, amount: 25000, category: "Makanan", description: "Lunch", date: "2026-10-09", accountId: 1, destinationAccountId: null }

function database(status: string | null = "pending") {
  const draft = status ? { status } : null
  const insert = vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(async () => [{ id: 12 }]) })) }))
  const update = vi.fn(() => ({ set: vi.fn((values) => ({ where: vi.fn(async () => { if (draft) draft.status = values.status }) })) }))
  const select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ for: vi.fn(async () => draft ? [draft] : []) })) })) }))
  return { connection: { insert, update, select } as unknown as UserDatabase, insert, update, select }
}

describe("persisted draft confirmation", () => {
  beforeEach(() => { mocks.accountsExist.mockResolvedValue(true) })
  it("records exactly one transaction and refuses a repeated confirmation", async () => {
    const db = database()
    const result = await decideDraft(db.connection, "draft", { action: "confirm", data })
    expect(result.transactionId).toBe(12)
    expect(db.insert).toHaveBeenCalledOnce()
    await expect(decideDraft(db.connection, "draft", { action: "confirm", data })).rejects.toMatchObject({ code: "recordConflict" })
    expect(db.insert).toHaveBeenCalledOnce()
  })
  it("rejects a draft without changing the transaction ledger", async () => {
    const db = database()
    await decideDraft(db.connection, "draft", { action: "reject" })
    expect(db.insert).not.toHaveBeenCalled()
    expect(db.update).toHaveBeenCalledOnce()
  })
  it("does not allow a hidden or another user's draft", async () => {
    const db = database(null)
    await expect(decideDraft(db.connection, "hidden", { action: "confirm", data })).rejects.toMatchObject({ code: "recordMissing" })
    expect(db.insert).not.toHaveBeenCalled()
  })
  it("checks account ownership again at confirmation time", async () => {
    const db = database()
    mocks.accountsExist.mockResolvedValue(false)
    await expect(decideDraft(db.connection, "draft", { action: "confirm", data })).rejects.toMatchObject({ code: "invalidInput" })
    expect(db.insert).not.toHaveBeenCalled()
    expect(db.update).not.toHaveBeenCalled()
  })
})
