import { describe, expect, it } from "vitest"
import { safeNextPath, authErrorKey } from "@/lib/auth"
import { authMessages } from "@/lib/auth-messages"

describe("authentication redirects", () => {
  it.each([
    null,
    undefined,
    "https://evil.test/dashboard",
    "//evil.test/dashboard",
    "/\\evil.test/dashboard",
    "/sign-in",
    "/dashboard/../../api/accounts",
    "javascript:alert(1)",
    "/dashboard\n",
  ])("rejects unsafe destination %s", (value) => {
    expect(safeNextPath(value)).toBe("/dashboard")
  })
  it("preserves dashboard destinations and section links", () => {
    expect(safeNextPath("/dashboard?month=2026-10#transactions")).toBe(
      "/dashboard?month=2026-10#transactions",
    )
  })
})

describe("auth feedback", () => {
  it("does not expose account existence or raw provider errors", () => {
    expect(authErrorKey("user_already_exists")).toBe("authFailed")
    expect(authErrorKey("private_database_failure")).toBe("authFailed")
  })
  it("keeps both languages and interpolation variables aligned", () => {
    expect(Object.keys(authMessages.en).sort()).toEqual(
      Object.keys(authMessages.id).sort(),
    )
    for (const key of Object.keys(authMessages.en))
      expect(authMessages.en[key].match(/\{\w+\}/g)).toEqual(
        authMessages.id[key].match(/\{\w+\}/g),
      )
  })
})
