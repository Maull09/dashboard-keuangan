import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  getUser: vi.fn(),
  transaction: vi.fn(),
  execute: vi.fn(),
  headers: new Headers(),
}))
vi.mock("next/headers", () => ({ headers: async () => state.headers }))
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: state.getUser } }),
}))
vi.mock("@/db", () => ({ db: { transaction: state.transaction } }))
import { authenticatedResponse } from "./authenticated-response"

describe("authenticated financial boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.headers = new Headers({ host: "localhost:3000" })
    state.getUser.mockResolvedValue({
      data: { user: { id: "00000000-0000-4000-8000-000000000001" } },
      error: null,
    })
    state.execute.mockResolvedValue(undefined)
    state.transaction.mockImplementation(async (action) =>
      action({ execute: state.execute }),
    )
  })
  it("rejects a missing or expired session before accessing the database", async () => {
    state.getUser.mockResolvedValue({
      data: { user: null },
      error: { code: "session_not_found" },
    })
    const action = vi.fn()
    const response = await authenticatedResponse(action)
    expect(response.status).toBe(401)
    expect(response.headers.get("Cache-Control")).toBe("private, no-store")
    expect(action).not.toHaveBeenCalled()
    expect(state.transaction).not.toHaveBeenCalled()
  })
  it("refuses cross-origin requests even with valid cookies", async () => {
    state.headers.set("origin", "https://evil.test")
    const response = await authenticatedResponse(vi.fn())
    expect(response.status).toBe(403)
    expect(state.getUser).not.toHaveBeenCalled()
  })
  it("initializes the restricted transaction before allowing data access", async () => {
    const response = await authenticatedResponse(async (connection) => {
      expect(connection).toHaveProperty("execute")
      expect(state.execute).toHaveBeenCalledTimes(2)
      return Response.json({ ok: true })
    })
    expect(response.status).toBe(200)
    expect(state.transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: "serializable",
    })
  })
})
