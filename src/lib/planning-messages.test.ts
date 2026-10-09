import { expect, it } from "vitest"
import { planningMessages } from "./planning-messages"
import { financeErrorCodes } from "./finance-errors"
import { usabilityMessages } from "./usability-messages"
import { authMessages } from "./auth-messages"
import { aiMessages } from "./ai/messages"

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
