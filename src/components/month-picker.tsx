"use client"

import { useLanguage } from "./language-provider"

const selectClass = "min-h-11 min-w-0 rounded-lg border border-input bg-card px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"

export function MonthPicker({ id, value, onChange, min = "1900-01", max = "2100-12" }: {
  id: string
  value: string
  onChange: (month: string) => void
  min?: string
  max?: string
}) {
  const { locale, t } = useLanguage()
  const [year, month] = value.split("-")
  const firstYear = Number(min.slice(0, 4))
  const lastYear = Number(max.slice(0, 4))
  const formatter = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", { month: "long", timeZone: "UTC" })

  function changeYear(nextYear: string) {
    const next = nextYear + "-" + month
    onChange(next < min ? min : next > max ? max : next)
  }

  return (
    <div className="flex max-w-full gap-2">
      <select id={id} aria-label={t("periodMonth")} className={selectClass + " flex-1"} value={month}
        onChange={(event) => onChange(year + "-" + event.target.value)}>
        {Array.from({ length: 12 }, (_, index) => {
          const number = String(index + 1).padStart(2, "0")
          const period = year + "-" + number
          return <option key={number} value={number} disabled={period < min || period > max}>
            {formatter.format(new Date(Date.UTC(2000, index, 1)))}
          </option>
        })}
      </select>
      <select id={id + "-year"} aria-label={t("periodYear")} className={selectClass + " shrink-0"} value={year}
        onChange={(event) => changeYear(event.target.value)}>
        {Array.from({ length: lastYear - firstYear + 1 }, (_, index) => {
          const number = firstYear + index
          return <option key={number} value={number}>{number}</option>
        })}
      </select>
    </div>
  )
}
