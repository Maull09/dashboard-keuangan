import { describe, expect, it } from "vitest"
import {
  fundBalance,
  monthlyFundSaving,
  scheduleOccurrences,
  simulateCashflow,
  type Schedule,
} from "./planning"

const salary: Schedule = {
  id: 1,
  name: "Salary",
  type: "income",
  amount: 5000000,
  frequency: "monthly",
  startDate: "2026-01-31",
  accountId: 1,
}

describe("recurring calendar and projections", () => {
  it("clamps a month-end occurrence without drifting the anchor day", () => {
    expect(
      scheduleOccurrences(salary, "2026-01-01", "2026-04-30").map(
        (item) => item.date,
      ),
    ).toEqual(["2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30"])
  })
  it("uses February 29 in leap years", () => {
    expect(
      scheduleOccurrences(
        { ...salary, startDate: "2028-01-31" },
        "2028-02-01",
        "2028-02-29",
      )[0].date,
    ).toBe("2028-02-29")
  })
  it("expands all weekly occurrences including the final day", () => {
    expect(
      scheduleOccurrences(
        { ...salary, frequency: "weekly", startDate: "2026-10-02" },
        "2026-10-01",
        "2026-10-31",
      ).map((item) => item.date),
    ).toEqual([
      "2026-10-02",
      "2026-10-09",
      "2026-10-16",
      "2026-10-23",
      "2026-10-30",
    ])
  })
  it("excludes already-recorded occurrences and respects an end date", () => {
    expect(
      scheduleOccurrences(
        { ...salary, lastExecutedDate: "2026-02-28", endDate: "2026-03-31" },
        "2026-01-01",
        "2026-12-31",
      ).map((item) => item.date),
    ).toEqual(["2026-03-31"])
  })
  it("returns no occurrences before a schedule starts", () => {
    expect(scheduleOccurrences(salary, "2025-01-01", "2025-12-31")).toEqual([])
  })
  it("seeks directly into a distant calendar month without losing dates", () => {
    expect(
      scheduleOccurrences(
        { ...salary, startDate: "1900-01-31" },
        "2026-10-01",
        "2026-10-31",
      ).map((item) => item.date),
    ).toEqual(["2026-10-31"])
  })
  it("compares an additional monthly payment without changing schedules", () => {
    const schedules = [
      salary,
      { ...salary, id: 2, name: "Rent", type: "expense", amount: 1000000 },
    ]
    const original = JSON.stringify(schedules)
    const result = simulateCashflow(
      2000000,
      schedules,
      "2026-01-01",
      "2026-01-15",
      "2026-03-31",
      500000,
    )
    expect(result).toMatchObject({
      baseline: 14000000,
      scenario: 12500000,
      difference: -1500000,
      payments: 3,
    })
    expect(result.rows.map((row) => row.scenario)).toEqual([
      5500000, 9000000, 12500000,
    ])
    expect(JSON.stringify(schedules)).toBe(original)
  })
  it("ignores internal transfers in the combined cash projection", () => {
    expect(
      simulateCashflow(
        1000000,
        [{ ...salary, type: "transfer" }],
        "2026-01-01",
        "2026-01-01",
        "2026-01-31",
        100000,
      ).scenario,
    ).toBe(900000)
  })
})

describe("sinking funds", () => {
  it("subtracts releases and spending from allocations exactly once", () => {
    expect(
      fundBalance([
        { kind: "allocate", amount: 1000000 },
        { kind: "release", amount: 100000 },
        { kind: "spend", amount: 250000 },
      ]),
    ).toBe(650000)
  })
  it("suggests savings across calendar months including the current month", () => {
    expect(monthlyFundSaving(1200000, 300000, "2026-12-01", "2026-10-03")).toBe(
      300000,
    )
    expect(
      monthlyFundSaving(1000000, 1000000, "2026-12-01", "2026-10-03"),
    ).toBe(0)
    expect(monthlyFundSaving(1000000, 100000, "2026-09-01", "2026-10-03")).toBe(
      900000,
    )
  })
})
