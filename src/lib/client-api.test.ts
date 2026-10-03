import { afterEach, describe, expect, it, vi } from "vitest"
import { jsonBody, requestJson } from "./client-api"

afterEach(() => vi.unstubAllGlobals())

describe("client request feedback", () => {
  it("uses only approved financial error codes", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ code: "insufficientShares" }, { status: 409 }),
        ),
    )
    await expect(requestJson("/api/investments/trades")).rejects.toThrow(
      "insufficientShares",
    )
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json(
            { code: "private database information" },
            { status: 400 },
          ),
        ),
    )
    await expect(requestJson("/api/investments/trades")).rejects.toThrow(
      "invalidInput",
    )
  })
  it("returns successful responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ id: 1 })))
    expect(await requestJson("/api/accounts")).toEqual({ id: 1 })
  })

  it.each([
    [400, "invalidInput"],
    [404, "recordMissing"],
    [409, "recordConflict"],
    [500, "serviceUnavailable"],
  ])("maps HTTP %s to localized recovery guidance", async (status, message) => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("private database details", { status: Number(status) }),
        ),
    )
    await expect(requestJson("/api/transactions")).rejects.toThrow(
      String(message),
    )
  })

  it("distinguishes connection failures from empty data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    )
    await expect(requestJson("/api/accounts")).rejects.toThrow("networkError")
  })

  it("preserves cancellation without reporting a connection failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("Cancelled", "AbortError")),
    )
    await expect(requestJson("/api/accounts")).rejects.toHaveProperty(
      "name",
      "AbortError",
    )
  })

  it("handles a successful response without a body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    )
    expect(
      await requestJson("/api/transactions/1", { method: "DELETE" }),
    ).toBeUndefined()
  })

  it("reports invalid response bodies without exposing technical errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("not json")))
    await expect(requestJson("/api/accounts")).rejects.toThrow(
      "serviceUnavailable",
    )
  })

  it("sends financial input as JSON", () => {
    expect(jsonBody("POST", { amount: 1000 })).toEqual({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"amount":1000}',
    })
  })
})
