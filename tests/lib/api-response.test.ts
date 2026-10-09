import { afterEach, describe, expect, it, vi } from "vitest"
import { financeResponse } from "@/lib/api-response"
import { FinanceError } from "@/lib/finance-errors"

afterEach(() => vi.restoreAllMocks())

describe("financial API error responses", () => {
  it("preserves successful responses", async () => {
    const response = Response.json({ id: 1 }, { status: 201 })
    expect(await financeResponse(async () => response)).toBe(response)
  })

  it("preserves actionable financial errors", async () => {
    const response = await financeResponse(async () => {
      throw new FinanceError("insufficientShares", 409)
    })
    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({ code: "insufficientShares" })
  })

  it("rejects malformed JSON without exposing its payload", async () => {
    const response = await financeResponse(async () => {
      throw new SyntaxError("private malformed request")
    })
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ code: "invalidInput" })
  })

  it.each(["23503", "23505", "40001", "40P01"])(
    "maps database conflict %s to retryable feedback",
    async (code) => {
      const response = await financeResponse(async () => {
        throw { cause: { code, message: "private database details" } }
      })
      expect(response.status).toBe(409)
      expect(await response.json()).toEqual({ code: "recordConflict" })
    },
  )

  it("keeps unexpected service details out of the response", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    const response = await financeResponse(async () => {
      throw new Error("private connection details")
    })
    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ code: "serviceUnavailable" })
    expect(log).toHaveBeenCalledWith("Financial request failed", "UNKNOWN")
  })
})
