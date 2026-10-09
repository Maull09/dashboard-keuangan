import { beforeEach, describe, expect, it, vi } from "vitest"
import { z } from "zod"

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), transaction: vi.fn(), execute: vi.fn() }))
vi.mock("@/db", () => ({ db: { transaction: mocks.transaction } }))
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { getUser: mocks.getUser } }) }))
import { aiResponse, readAiJson, userDatabase } from "@/lib/ai/server"

const userId = "00000000-0000-4000-8000-000000000001"
const request = () => new Request("http://localhost:3000/api/ai/chat", { headers: { host: "localhost:3000" } })

describe("AI authenticated boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: userId } }, error: null })
    mocks.transaction.mockImplementation(async (action) => action({ execute: mocks.execute }))
  })
  it("rejects unauthenticated requests before calling the model or database", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null })
    const action = vi.fn()
    const response = await aiResponse(request(), action)
    expect(response.status).toBe(401)
    expect(response.headers.get("cache-control")).toBe("private, no-store")
    expect(action).not.toHaveBeenCalled()
    expect(mocks.transaction).not.toHaveBeenCalled()
  })
  it("blocks cross-origin requests even with a valid session", async () => {
    const response = await aiResponse(new Request("http://localhost:3000/api/ai/chat", {
      headers: { host: "localhost:3000", origin: "https://evil.test" },
    }), vi.fn())
    expect(response.status).toBe(403)
    expect(mocks.getUser).not.toHaveBeenCalled()
  })
  it("does not hold a database transaction while running inference", async () => {
    const response = await aiResponse(request(), async (session) => {
      expect(session.userId).toBe(userId)
      expect(mocks.transaction).not.toHaveBeenCalled()
      return Response.json({ ok: true })
    })
    expect(response.status).toBe(200)
  })
  it("sets the restricted role and authenticated user before a query", async () => {
    await userDatabase(userId, async () => { expect(mocks.execute).toHaveBeenCalledTimes(2) })
    expect(mocks.transaction).toHaveBeenCalledOnce()
  })
  it("returns a validation error without exposing Zod details", async () => {
    const response = await aiResponse(request(), async () => {
      z.number().parse("secret payload")
      return Response.json({})
    })
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ code: "invalidInput" })
  })
  it("rejects oversized request bodies before parsing", async () => {
    const body = new Request("http://localhost/api/ai/chat", { method: "POST", body: "x".repeat(17000) })
    await expect(readAiJson(body)).rejects.toMatchObject({ code: "invalidInput", status: 413 })
  })
})
