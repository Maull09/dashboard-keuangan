"use client"

import { useEffect, useRef, useState } from "react"
import { Calculator, Loader2, Plus, Trash2 } from "lucide-react"
import { useLanguage } from "./language-provider"
import { ErrorNotice, Field, PageHeading } from "./feedback"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { getNextMonthStart, getToday } from "@/lib/finance"
import { jsonBody, requestJson } from "@/lib/client-api"
import type { PlannedExpense, SimulationData } from "@/lib/planning-types"

type ExpenseDraft = Omit<PlannedExpense, "amount"> & { amount: string }

function endOfNextMonth() {
  const nextMonth = getNextMonthStart(getToday().slice(0, 7)).slice(0, 7)
  const end = new Date(getNextMonthStart(nextMonth) + "T00:00:00Z")
  end.setUTCDate(end.getUTCDate() - 1)
  return end.toISOString().slice(0, 10)
}

function maximumProjectionDate() {
  return new Date(Date.parse(getToday()) + 730 * 86400000)
    .toISOString()
    .slice(0, 10)
}

export function FinancialSimulation() {
  const { t, formatCurrency, formatMonth } = useLanguage()
  const [endDate, setEndDate] = useState(endOfNextMonth())
  const [expenses, setExpenses] = useState<ExpenseDraft[]>([])
  const [result, setResult] = useState<SimulationData | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [stale, setStale] = useState(false)
  const controller = useRef<AbortController | null>(null)
  const compared = useRef(false)
  const today = getToday()

  function invalidate() {
    controller.current?.abort()
    setResult(null)
    setBusy(false)
    setError("")
    setStale(compared.current)
  }

  useEffect(() => {
    window.addEventListener("finance-data-changed", invalidate)
    return () => {
      window.removeEventListener("finance-data-changed", invalidate)
      controller.current?.abort()
    }
  }, [])

  function updateExpense(index: number, update: Partial<ExpenseDraft>) {
    invalidate()
    setExpenses((current) =>
      current.map((expense, expenseIndex) =>
        expenseIndex === index ? { ...expense, ...update } : expense,
      ),
    )
  }

  function addExpense() {
    invalidate()
    setExpenses((current) => [
      ...current,
      { name: "", amount: "", date: today },
    ])
  }

  function removeExpense(index: number) {
    invalidate()
    setExpenses((current) =>
      current.filter((_, expenseIndex) => expenseIndex !== index),
    )
  }

  const invalidExpense = expenses.some(
    (expense) =>
      !expense.name.trim() ||
      Number(expense.amount) <= 0 ||
      !Number.isInteger(Number(expense.amount)) ||
      !expense.date ||
      expense.date < today ||
      expense.date > endDate,
  )
  const canAddExpense = expenses.length < 20

  async function calculate(event: React.FormEvent) {
    event.preventDefault()
    if (busy || invalidExpense || !endDate) return
    const request = new AbortController()
    controller.current = request
    compared.current = true
    setBusy(true)
    setError("")
    setResult(null)
    setStale(false)
    try {
      const data = await requestJson<SimulationData>("/api/simulation", {
        ...jsonBody("POST", { endDate, extraExpenses: expenses }),
        signal: request.signal,
      })
      if (!request.signal.aborted) setResult(data)
    } catch (reason) {
      if (!request.signal.aborted) setError((reason as Error).message)
    } finally {
      if (!request.signal.aborted) setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title={t("simulation")}
        description={t("simulationDescription")}
      />
      <form
        onSubmit={calculate}
        className="space-y-5 rounded-xl border bg-white p-5"
      >
        <fieldset disabled={busy} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field id="calculator-end" label={t("simulateUntil")} required>
              <Input
                id="calculator-end"
                type="date"
                min={today}
                max={maximumProjectionDate()}
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value)
                  invalidate()
                }}
                required
              />
            </Field>
          </div>
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm leading-relaxed text-teal-950">
            {t("calculatorHint")}
          </div>
          <section aria-labelledby="added-expenses-title" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="added-expenses-title" className="font-semibold">
                  {t("addedExpenses")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("additionalExpenseHint")}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addExpense}
                disabled={!canAddExpense}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t("addExpense")}
              </Button>
            </div>
            {expenses.map((expense, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-lg border bg-slate-50 p-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end"
              >
                <Field
                  id={`expense-name-${index}`}
                  label={t("expenseName")}
                  required
                >
                  <Input
                    id={`expense-name-${index}`}
                    value={expense.name}
                    maxLength={120}
                    onChange={(event) =>
                      updateExpense(index, { name: event.target.value })
                    }
                    required
                  />
                </Field>
                <Field
                  id={`expense-amount-${index}`}
                  label={t("expenseAmount")}
                  required
                >
                  <Input
                    id={`expense-amount-${index}`}
                    type="number"
                    min="1"
                    max="2147483647"
                    step="1"
                    inputMode="numeric"
                    value={expense.amount}
                    onChange={(event) =>
                      updateExpense(index, { amount: event.target.value })
                    }
                    required
                  />
                </Field>
                <Field
                  id={`expense-date-${index}`}
                  label={t("expenseDate")}
                  required
                >
                  <Input
                    id={`expense-date-${index}`}
                    type="date"
                    min={today}
                    max={endDate}
                    value={expense.date}
                    onChange={(event) =>
                      updateExpense(index, { date: event.target.value })
                    }
                    required
                  />
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                  onClick={() => removeExpense(index)}
                  aria-label={t("removeExpense")}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
          </section>
        </fieldset>
        <ErrorNotice message={error} />
        <Button type="submit" disabled={busy || invalidExpense || !endDate}>
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Calculator className="h-4 w-4" aria-hidden="true" />
          )}
          {t(busy ? "calculating" : "calculateExpenses")}
        </Button>
      </form>
      {stale && (
        <p role="status" className="text-sm text-muted-foreground">
          {t("simulationStale")}
        </p>
      )}
      {result && (
        <section className="space-y-5" aria-label={t("monthlyProjection")}>
          <div
            role="status"
            className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900"
          >
            {t("simulationOnly")} {t("plannedExpenseCount", { count: result.extraExpenseCount })}
          </div>
          <dl className="grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["currentCash", result.currentBalance, ""],
              ["scheduledIncome", result.scheduledIncome, "text-emerald-700"],
              ["scheduledExpenses", result.scheduledExpense, "text-rose-700"],
              ["addedExpenses", result.extraExpense, "text-rose-700"],
              ["projectedCash", result.scenario, result.scenario < 0 ? "text-rose-700" : "text-teal-800"],
            ].map(([key, value, tone]) => (
              <div key={String(key)}>
                <dt className="text-sm text-muted-foreground">
                  {t(String(key))}
                </dt>
                <dd className={`mt-2 text-xl font-semibold tabular-nums ${tone}`}>
                  {formatCurrency(Number(value))}
                </dd>
              </div>
            ))}
          </dl>
          {result.rows.some((row) => row.scenario < 0) && (
            <p
              role="status"
              className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            >
              {t("negativeScenario")}
            </p>
          )}
          <div
            role="region"
            aria-label={t("monthlyProjection")}
            tabIndex={0}
            className="overflow-x-auto rounded-xl border bg-white"
          >
            <table className="w-full min-w-[650px] text-sm">
              <caption className="sr-only">{t("monthlyProjection")}</caption>
              <thead className="bg-muted/50">
                <tr>
                  {["period", "income", "expenses", "addedExpenses", "baseline", "projectedCash"].map(
                    (key, index) => (
                      <th
                        scope="col"
                        key={key}
                        className={`p-3 font-medium text-muted-foreground ${index ? "text-right" : "text-left"}`}
                      >
                        {t(key)}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.month} className="border-t">
                    <td className="whitespace-nowrap p-3">
                      {formatMonth(row.month)}
                    </td>
                    {[row.income, row.expense, row.extraExpense, row.baseline, row.scenario].map(
                      (amount, index) => (
                        <td
                          key={index}
                          className={`p-3 text-right tabular-nums ${amount < 0 ? "text-rose-700" : ""}`}
                        >
                          {formatCurrency(amount)}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
