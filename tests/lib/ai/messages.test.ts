import { expect, it } from "vitest"
import { aiMessages } from "@/lib/ai/messages"

it("keeps English and Indonesian assistant copy in sync", () => {
  expect(Object.keys(aiMessages.id).sort()).toEqual(Object.keys(aiMessages.en).sort())
  expect(Object.values(aiMessages.id).every(Boolean)).toBe(true)
})
