import { describe, expect, it } from "vitest"
import { parseTransactionInput } from "@/lib/validation"

const expense = {
  type: "expense", amount: 100_000, category: "Makanan",
  date: "2026-10-09", accountId: 1,
}

describe("transaction groups", () => {
  it("normalizes group names and accepts transactions without a group", () => {
    expect(parseTransactionInput({ ...expense, groupName: "  Liburan Jepang  " }))
      .toMatchObject({ groupName: "Liburan Jepang", amount: 100_000 })
    for (const groupName of [undefined, null, "", "   "])
      expect(parseTransactionInput({ ...expense, groupName })).toMatchObject({ groupName: null })
  })
  it.each([42, {}, [], true, "x".repeat(101)])("rejects invalid group names: %s", (groupName) => {
    expect(parseTransactionInput({ ...expense, groupName })).toBeNull()
  })
  it("accepts a group name at the length limit", () => {
    expect(parseTransactionInput({ ...expense, groupName: "x".repeat(100) }))
      .toMatchObject({ groupName: "x".repeat(100) })
  })
})
