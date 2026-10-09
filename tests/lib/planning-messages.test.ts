import { expect, it } from "vitest"
import { planningMessages } from "@/lib/planning-messages"
import { financeErrorCodes } from "@/lib/finance-errors"
import { usabilityMessages } from "@/lib/usability-messages"
import { authMessages } from "@/lib/auth-messages"
import { aiMessages } from "@/lib/ai/messages"

it("keeps planning copy and placeholders available in both languages", () => {
  expect(Object.keys(planningMessages.en).sort()).toEqual(
    Object.keys(planningMessages.id).sort(),
  )
  for (const key of Object.keys(planningMessages.en)) {
    expect(planningMessages.en[key].trim()).not.toBe("")
    expect(planningMessages.id[key].trim()).not.toBe("")
    expect(planningMessages.id[key].match(/\{\w+\}/g) ?? []).toEqual(
      planningMessages.en[key].match(/\{\w+\}/g) ?? [],
    )
  }
  for (const code of financeErrorCodes)
    for (const locale of ["en", "id"] as const)
      expect(
        aiMessages[locale][code] ??
          authMessages[locale][code] ??
          planningMessages[locale][code] ??
          usabilityMessages[locale][code],
      ).toBeTruthy()
})
