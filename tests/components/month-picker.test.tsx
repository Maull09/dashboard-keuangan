// @vitest-environment jsdom
import { act, useState } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { interfaceMessages } from "@/lib/interface-messages"

const language = vi.hoisted(() => ({ locale: "id" as "id" | "en" }))
vi.mock("@/components/language-provider", () => ({ useLanguage: () => ({
  locale: language.locale,
  t: (key: keyof typeof interfaceMessages.en) => interfaceMessages[language.locale][key],
}) }))
import { MonthPicker } from "@/components/month-picker"

describe("localized month selection", () => {
  let root: Root
  let container: HTMLDivElement
  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
    language.locale = "id"
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
  })
  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
  })

  it("follows the application language without changing the selected period", async () => {
    const changed = vi.fn()
    async function render() {
      await act(async () => root.render(<MonthPicker id="period" value="2026-10" onChange={changed} />))
    }
    await render()
    const month = container.querySelector<HTMLSelectElement>("#period")!
    expect(month.selectedOptions[0].textContent).toBe("Oktober")
    expect(month.getAttribute("aria-label")).toBe("Bulan")
    expect(container.querySelector("#period-year")?.getAttribute("aria-label")).toBe("Tahun")
    language.locale = "en"
    await render()
    expect(month.selectedOptions[0].textContent).toBe("October")
    expect(month.getAttribute("aria-label")).toBe("Month")
    expect(month.value).toBe("10")
    expect(container.querySelector<HTMLSelectElement>("#period-year")?.value).toBe("2026")
    expect(changed).not.toHaveBeenCalled()
  })

  it("keeps month and year changes within the page's allowed range", async () => {
    function Period() {
      const [value, setValue] = useState("2025-11")
      return <MonthPicker id="period" value={value} onChange={setValue} min="2025-03" max="2026-06" />
    }
    await act(async () => root.render(<Period />))
    const month = container.querySelector<HTMLSelectElement>("#period")!
    const year = container.querySelector<HTMLSelectElement>("#period-year")!
    expect([...year.options].map((option) => option.value)).toEqual(["2025", "2026"])
    expect(month.options[0].disabled).toBe(true)
    await act(async () => {
      year.value = "2026"
      year.dispatchEvent(new Event("change", { bubbles: true }))
    })
    expect(month.value).toBe("06")
    expect(month.options[6].disabled).toBe(true)
    await act(async () => {
      month.value = "04"
      month.dispatchEvent(new Event("change", { bubbles: true }))
    })
    expect(month.value).toBe("04")
    expect(year.value).toBe("2026")
  })
})
