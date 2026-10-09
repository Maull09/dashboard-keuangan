"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { jsonBody, requestJson } from "@/lib/client-api"
import { clearRemoteResourceCache } from "@/lib/remote-resource-cache"
import type { InsightContext, InsightPage, InsightStatus } from "@/lib/ai/insight-contract"
import { useAuth } from "./auth-provider"
import { useLanguage } from "./language-provider"
import { ErrorNotice } from "./feedback"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"

const nextPage: Record<InsightPage, InsightPage> = {
  dashboard: "transactions", transactions: "budget", investments: "netWorth", budget: "transactions",
  goals: "funds", debts: "calendar", reports: "transactions", financialHealth: "budget",
  planning: "calendar", netWorth: "investments", calendar: "debts", simulation: "planning", funds: "goals",
}

export function PageInsights({ context, ready }: { context: InsightContext; ready: boolean }) {
  const { user } = useAuth()
  const { locale } = useLanguage()
  if (!ready || !user) return null
  return <InsightPanel key={JSON.stringify([user.id, context, locale])} context={context} />
}

function InsightPanel({ context }: { context: InsightContext }) {
  const [attempt, setAttempt] = useState(0)
  return <InsightRun key={attempt} context={context} refresh={attempt > 0} retry={() => setAttempt((value) => value + 1)} />
}

function InsightRun({ context, refresh, retry }: { context: InsightContext; refresh: boolean; retry: () => void }) {
  const { locale, t } = useLanguage()
  const [status, setStatus] = useState<InsightStatus | null>(null)
  const [error, setError] = useState("")
  const body = JSON.stringify({ context, locale, refresh })
  useEffect(() => {
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    let resolveDelay: (() => void) | undefined
    function delay(milliseconds: number) {
      return new Promise<void>((resolve) => {
        resolveDelay = resolve
        timer = setTimeout(resolve, milliseconds)
      })
    }
    async function analyse() {
      await delay(600)
      if (controller.signal.aborted) return
      let current = await requestJson<InsightStatus>("/api/ai/insights", { ...jsonBody("POST", JSON.parse(body)), signal: controller.signal })
      const deadline = Date.now() + 7 * 60_000
      let staleRetries = 0
      while (!controller.signal.aborted) {
        if (current.status === "failed" || Date.now() > deadline) throw new Error("insightFailed")
        if (current.status === "stale") {
          if (++staleRetries > 3) throw new Error("insightFailed")
          current = await requestJson<InsightStatus>("/api/ai/insights", { ...jsonBody("POST", { ...JSON.parse(body), refresh: false }), signal: controller.signal })
          continue
        }
        setStatus(current)
        if (current.status === "completed") return
        await delay(3000)
        if (controller.signal.aborted) return
        current = await requestJson<InsightStatus>("/api/ai/insights?jobId=" + current.jobId, { signal: controller.signal })
      }
    }
    void analyse().catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "aiUnavailable")
    })
    return () => {
      controller.abort()
      clearTimeout(timer)
      resolveDelay?.()
    }
  }, [body])
  const pending = !error && status?.status !== "completed"
  const result = status?.result
  const target = nextPage[context.page as InsightPage]
  return <Card aria-busy={pending}>
    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div><CardTitle>{t("pageInsights")}</CardTitle><CardDescription className="mt-2">{t("pageInsightsHint")}</CardDescription></div>
      <Button className="min-h-11 shrink-0" variant="outline" onClick={retry} disabled={pending}>
        <RefreshCw aria-hidden="true" className="size-4" />{t("insightRefresh")}
      </Button>
    </CardHeader>
    <CardContent className="space-y-4">
      {pending && <p role="status" className="text-sm text-muted-foreground">{t(status?.status === "active" ? "insightActive" : "insightWaiting")}</p>}
      <ErrorNotice message={error} onRetry={retry} />
      {result && <div className="space-y-4" aria-live="polite">
        <p className="max-w-prose whitespace-pre-wrap break-words text-sm leading-relaxed">{result.text}</p>
        <p className="text-xs text-muted-foreground">{t("insightGenerated", { time: new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(result.generatedAt)) })}</p>
        <p className="max-w-prose text-xs text-muted-foreground">{t("insightReview")}</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><a href={"#" + target}>{t("insightNext", { page: t(target) })}</a></Button>
          <Button asChild variant="ghost"><a href={"#ai?conversation=" + result.conversationId} onClick={clearRemoteResourceCache}>{t("insightHistory")}</a></Button>
        </div>
      </div>}
    </CardContent>
  </Card>
}
