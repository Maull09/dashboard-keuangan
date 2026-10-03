import { describe, expect, it } from "vitest"
import {
  findEnglishCategoryMatches,
  parseTransactionFilters,
} from "./transaction-filters"

describe("transaction filter inputs", () => {
  it("accepts an inclusive period and a destination account filter", () => {
    expect(
      parseTransactionFilters(
        new URLSearchParams(
          "type=transfer&account=2&from=2026-10-01&to=2026-10-31&search=rent",
        ),
      ),
    ).toEqual({
      search: "rent",
      type: "transfer",
      accountId: 2,
      from: "2026-10-01",
      to: "2026-10-31",
    })
  })
  it("rejects a reversed range instead of silently showing no records", () => {
    expect(
      parseTransactionFilters(
        new URLSearchParams("from=2026-10-31&to=2026-10-01"),
      ),
    ).toBeNull()
  })
  it.each(["from=2026-02-30", "type=unknown", "account=-1", "account=1.5"])(
    "rejects invalid filters: %s",
    (query) => {
      expect(parseTransactionFilters(new URLSearchParams(query))).toBeNull()
    },
  )
  it("searches all records when filters are cleared", () => {
    expect(parseTransactionFilters(new URLSearchParams())).toEqual({
      search: "",
      type: "all",
      accountId: null,
      from: "",
      to: "",
    })
  })
  it("matches English category labels without rewriting stored categories", () => {
    expect(findEnglishCategoryMatches(" FOOD ")).toEqual(["Makanan"])
    expect(findEnglishCategoryMatches("bill")).toEqual(["Tagihan"])
    expect(findEnglishCategoryMatches("")).toEqual([])
    expect(findEnglishCategoryMatches("custom note")).toEqual([])
  })
})
