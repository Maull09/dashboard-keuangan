"use client"

import { useEffect, useRef, useState } from "react"
import { FlaskConical, Loader2 } from "lucide-react"
import { useLanguage } from "./language-provider"
import { ErrorNotice, Field, PageHeading } from "./feedback"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { getCurrentMonth, getNextMonthStart, getToday } from "@/lib/finance"
import { jsonBody, requestJson } from "@/lib/client-api"
import type { SimulationData } from "@/lib/planning-types"

function endOfNextMonth() {
  const nextMonth = getNextMonthStart(getCurrentMonth()).slice(0, 7)
  const end = new Date(getNextMonthStart(nextMonth) + "T00:00:00Z")
  end.setUTCDate(end.getUTCDate() - 1)
  return end.toISOString().slice(0, 10)
}

export function FinancialSimulation() {
  const { t, formatCurrency, formatMonth } = useLanguage()
  const [payment, setPayment] = useState("")
  const [startDate, setStartDate] = useState(getToday())
  const [endDate, setEndDate] = useState(endOfNextMonth())
  const [result, setResult] = useState<SimulationData | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [stale, setStale] = useState(false)
  const controller = useRef<AbortController | null>(null)
  const compared = useRef(false)

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
  async function compare(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    const request = new AbortController()
    controller.current = request
    compared.current = true
    setBusy(true)
    setError("")
    setResult(null)
    setStale(false)
    try {
      const data = await requestJson<SimulationData>("/api/simulation", {
        ...jsonBody("POST", { monthlyPayment: payment, startDate, endDate }),
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
        onSubmit={compare}
        className="space-y-4 rounded-xl border bg-white p-5"
      >
        <fieldset disabled={busy} className="grid gap-4 md:grid-cols-3">
          <Field id="simulation-payment" label={t("monthlyPayment")} required>
            <Input
              id="simulation-payment"
              type="number"
              min="1"
              max="2147483647"
              step="1"
              value={payment}
              onChange={(event) => {
                setPayment(event.target.value)
                invalidate()
              }}
              required
            />
          </Field>
          <Field id="simulation-start" label={t("firstPayment")} required>
            <Input
              id="simulation-start"
              type="date"
              min={getToday()}
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value)
                invalidate()
              }}
              required
            />
          </Field>
          <Field id="simulation-end" label={t("simulateUntil")} required>
            <Input
              id="simulation-end"
              type="date"
              min={startDate}
              max={new Date(Date.parse(getToday()) + 730 * 86400000)
                .toISOString()
                .slice(0, 10)}
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value)
                invalidate()
              }}
              required
            />
          </Field>
        </fieldset>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("simulationHint")}
        </p>
        <ErrorNotice message={error} />
        <Button
          type="submit"
          disabled={
            busy || Number(payment) <= 0 || !startDate || endDate < startDate
          }
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FlaskConical className="h-4 w-4" />
          )}
          {t(busy ? "comparing" : "runSimulation")}
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
            {t("simulationOnly")}{" "}
            {t("simulatedPayments", { count: result.payments })}
          </div>
          <dl className="grid gap-5 rounded-xl border bg-white p-5 sm:grid-cols-3">
            {[
              ["baseline", result.baseline],
              ["scenario", result.scenario],
              ["scenarioDifference", result.difference],
            ].map(([key, value]) => (
              <div key={String(key)}>
                <dt className="text-sm text-muted-foreground">
                  {t(String(key))}
                </dt>
                <dd
                  className={
                    "mt-2 text-xl font-semibold tabular-nums " +
                    (Number(value) < 0 ? "text-rose-700" : "")
                  }
                >
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
                  {[
                    "period",
                    "income",
                    "expenses",
                    "monthlyPayment",
                    "baseline",
                    "scenario",
                  ].map((key, index) => (
                    <th
                      scope="col"
                      key={key}
                      className={
                        "p-3 font-medium text-muted-foreground " +
                        (index ? "text-right" : "text-left")
                      }
                    >
                      {t(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.month} className="border-t">
                    <td className="whitespace-nowrap p-3">
                      {formatMonth(row.month)}
                    </td>
                    {[
                      row.income,
                      row.expense,
                      row.extraExpense,
                      row.baseline,
                      row.scenario,
                    ].map((amount, index) => (
                      <td
                        key={index}
                        className={
                          "p-3 text-right tabular-nums " +
                          (amount < 0 ? "text-rose-700" : "")
                        }
                      >
                        {formatCurrency(amount)}
                      </td>
                    ))}
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
