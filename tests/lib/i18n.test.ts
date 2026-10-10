import { describe, expect, it } from "vitest"
import { messages } from "@/lib/i18n"
import { financeErrorCodes } from "@/lib/finance-errors"

describe("translations", () => {
  it("keeps all English and Indonesian keys, copy, and placeholders aligned", () => {
    expect(Object.keys(messages.id).sort()).toEqual(Object.keys(messages.en).sort())
    for (const key of Object.keys(messages.en)) {
      expect(messages.en[key].trim()).not.toBe("")
      expect(messages.id[key].trim()).not.toBe("")
      expect(messages.id[key].match(/\{\w+\}/g) ?? []).toEqual(
        messages.en[key].match(/\{\w+\}/g) ?? [],
      )
    }
  })

  it("provides feedback for every financial error in both languages", () => {
    for (const code of financeErrorCodes)
      for (const locale of ["en", "id"] as const)
        expect(messages[locale][code]).toBeTruthy()
  })
})
