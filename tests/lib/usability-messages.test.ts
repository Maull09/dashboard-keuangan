import { describe, expect, it } from "vitest"
import { usabilityMessages } from "@/lib/usability-messages"
import { interfaceMessages } from "@/lib/interface-messages"

describe("usability translations", () => {
  it("provides matching English and Indonesian keys and placeholders", () => {
    for (const messages of [usabilityMessages, interfaceMessages]) {
      expect(Object.keys(messages.id).sort()).toEqual(
        Object.keys(messages.en).sort(),
      )
      for (const key of Object.keys(messages.en)) {
        expect(messages.en[key].trim()).not.toBe("")
        expect(messages.id[key].trim()).not.toBe("")
        expect(messages.id[key].match(/\{\w+\}/g) ?? []).toEqual(
          messages.en[key].match(/\{\w+\}/g) ?? [],
        )
      }
    }
  })
})
