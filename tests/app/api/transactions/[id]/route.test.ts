import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const state = vi.hoisted(() => ({
  update: vi.fn(), set: vi.fn(), where: vi.fn(), returning: vi.fn(),
  select: vi.fn(), accountsExist: vi.fn(),
}))
vi.mock("@/lib/server/authenticated-response", () => ({
  authenticatedResponse: async (action: (db: typeof state) => Promise<Response>) => action(state),
}))
vi.mock("@/lib/accounts", () => ({ accountsExist: state.accountsExist }))
import { PATCH } from "@/app/api/transactions/[id]/route"

function patch(body: unknown) {
  return PATCH(new NextRequest("http://localhost/api/transactions/1", {
    method: "PATCH", body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  }), { params: Promise.resolve({ id: "1" }) })
}

describe("group assignment on existing transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.update.mockReturnValue(state)
    state.set.mockReturnValue(state)
    state.where.mockReturnValue(state)
    state.returning.mockResolvedValue([{ id: 1, groupName: "Liburan Jepang" }])
  })
  it("updates metadata without changing protected payment or fund amounts", async () => {
    expect((await patch({ groupName: " Liburan Jepang " })).status).toBe(200)
    expect(state.set).toHaveBeenCalledWith({ groupName: "Liburan Jepang" })
    expect(state.select).not.toHaveBeenCalled()
    expect(state.accountsExist).not.toHaveBeenCalled()
  })
  it("clears a group while preserving transaction history", async () => {
    expect((await patch({ groupName: null })).status).toBe(200)
    expect(state.set).toHaveBeenCalledWith({ groupName: null })
  })
  it("returns a missing record when the user-scoped update finds no transaction", async () => {
    state.returning.mockResolvedValue([])
    expect((await patch({ groupName: "Trip" })).status).toBe(404)
  })
  it("rejects invalid metadata before writing", async () => {
    expect((await patch({ groupName: "x".repeat(101) })).status).toBe(400)
    expect(state.update).not.toHaveBeenCalled()
  })
  it("keeps financial edits on the fully validated path", async () => {
    expect((await patch({ groupName: "Trip", amount: 200 })).status).toBe(400)
    expect(state.update).not.toHaveBeenCalled()
  })
})
