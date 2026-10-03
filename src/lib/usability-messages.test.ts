import { describe, expect, it } from "vitest"
import { usabilityMessages } from "./usability-messages"

describe("usability translations", () => {
  it("provides matching English and Indonesian keys and placeholders", () => {
    expect(Object.keys(usabilityMessages.id).sort()).toEqual(
      Object.keys(usabilityMessages.en).sort(),
    )
    for (const key of Object.keys(usabilityMessages.en)) {
      expect(usabilityMessages.en[key].trim()).not.toBe("")
      expect(usabilityMessages.id[key].trim()).not.toBe("")
      expect(usabilityMessages.id[key].match(/\{\w+\}/g) ?? []).toEqual(
        usabilityMessages.en[key].match(/\{\w+\}/g) ?? [],
      )
    }
  })
})
