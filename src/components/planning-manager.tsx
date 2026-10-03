"use client"

import { useState } from "react"
import { CalendarClock, Plus, Trash2 } from "lucide-react"
import { useLanguage } from "./language-provider"
import {
  ConfirmDelete,
  EmptyState,
  ErrorNotice,
  Field,
  LoadingState,
  PageHeading,
  SubmitButton,
  useFeedback,
} from "./feedback"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Input } from "./ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { expenseCategories, getToday, incomeCategories } from "@/lib/finance"
import { requestJson, jsonBody } from "@/lib/client-api"
import { useRemoteData } from "@/lib/use-remote-data"
import type { Account } from "@/lib/types"

type Recurring = {
  id: number
  name: string
  type: "income" | "expense"
  amount: number
  category: string
  accountId: number
  frequency: "weekly" | "monthly"
  startDate: string
  lastExecutedDate: string | null
}
type Forecast = {
  payday: string
  currentBalance: number
  forecastBalance: number
  scheduled: Recurring[]
}

export function PlanningManager() {
  const { t, formatCurrency, formatDate } = useLanguage()
  const notify = useFeedback()
  const records = useRemoteData<Recurring[]>("/api/recurring")
  const accountData = useRemoteData<Account[]>("/api/accounts")
  const accounts = accountData.data ?? []
  const [payday, setPayday] = useState(getToday())
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [forecastBusy, setForecastBusy] = useState(false)
  const [forecastError, setForecastError] = useState("")
  const [deleting, setDeleting] = useState<Recurring | null>(null)
  const [recording, setRecording] = useState<Recurring | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function calculate(event: React.FormEvent) {
    event.preventDefault()
    if (forecastBusy) return
    setForecastBusy(true)
    setForecastError("")
    setForecast(null)
    try {
      setForecast(await requestJson<Forecast>("/api/forecast?payday=" + payday))
    } catch (reason) {
      setForecastError((reason as Error).message)
    } finally {
      setForecastBusy(false)
    }
  }
  async function mutateSchedule(action: "delete" | "record") {
    const item = action === "delete" ? deleting : recording
    if (!item || busy) return
    setBusy(true)
    setError("")
    try {
      await requestJson(
        "/api/recurring/" + item.id + (action === "record" ? "/execute" : ""),
        { method: action === "record" ? "POST" : "DELETE" },
      )
      notify(action === "record" ? "scheduleRecorded" : "scheduleDeleted")
      setDeleting(null)
      setRecording(null)
      setForecast(null)
      window.dispatchEvent(new Event("finance-data-changed"))
    } catch (reason) {
      setError((reason as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title={t("planningTitle")}
        description={t("planningDescription")}
      >
        <AddSchedule accounts={accounts} />
      </PageHeading>
      <Card>
        <CardHeader>
          <CardTitle>{t("forecastTitle")}</CardTitle>
          <CardDescription>{t("forecastDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={calculate}
            className="flex flex-col items-start gap-3 sm:flex-row sm:items-end"
          >
            <Field id="forecast-payday" label={t("payDay")} required>
              <Input
                id="forecast-payday"
                type="date"
                min={getToday()}
                value={payday}
                onChange={(event) => {
                  setPayday(event.target.value)
                  setForecast(null)
                }}
                disabled={forecastBusy}
                required
              />
            </Field>
            <SubmitButton
              busy={forecastBusy}
              disabled={!payday || payday < getToday()}
            >
              {t("calculateForecast")}
            </SubmitButton>
          </form>
          <p className="text-xs text-muted-foreground">{t("forecastHint")}</p>
          <ErrorNotice message={forecastError} />
          {forecast && (
            <div role="status" className="rounded-lg border bg-teal-50 p-5">
              <p className="text-sm text-teal-900">
                {t("estimatedBalance", { date: formatDate(forecast.payday) })}
              </p>
              <p
                className={
                  "mt-2 text-3xl font-semibold tabular-nums " +
                  (forecast.forecastBalance < 0
                    ? "text-rose-700"
                    : "text-teal-950")
                }
              >
                {formatCurrency(forecast.forecastBalance)}
              </p>
              <p className="mt-3 text-xs text-teal-800">
                {t("currentBalance", {
                  amount: formatCurrency(forecast.currentBalance),
                })}{" "}
                · {t("schedulesIncluded", { count: forecast.scheduled.length })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      {records.error || accountData.error ? (
        <ErrorNotice
          message={records.error || accountData.error}
          onRetry={() => {
            records.reload()
            accountData.reload()
          }}
        />
      ) : records.loading || accountData.loading ? (
        <LoadingState />
      ) : !records.data?.length ? (
        <EmptyState
          title={t("noSchedules")}
          description={t("noSchedulesHint")}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("activeSchedules")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {records.data.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col justify-between gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                >
                  <div className="flex items-start gap-3">
                    <CalendarClock className="mt-1 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t(item.type)} · {formatCurrency(item.amount)} ·{" "}
                        {t(item.frequency)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {
                          accounts.find(
                            (account) => account.id === item.accountId,
                          )?.name
                        }{" "}
                        · {t("starts")} {formatDate(item.startDate)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.lastExecutedDate
                          ? t("lastRecorded") +
                            ": " +
                            formatDate(item.lastExecutedDate)
                          : t("notRecorded")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={
                        item.startDate > getToday() ||
                        item.lastExecutedDate === getToday()
                      }
                      onClick={() => {
                        setRecording(item)
                        setError("")
                      }}
                    >
                      {t("recordNow")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("delete") + " " + item.name}
                      onClick={() => {
                        setDeleting(item)
                        setError("")
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <ConfirmDelete
        open={Boolean(deleting)}
        onOpenChange={(value) => {
          if (!value) setDeleting(null)
        }}
        detail={
          deleting
            ? deleting.name + " · " + formatCurrency(deleting.amount)
            : ""
        }
        description={t("deleteScheduleHint")}
        busy={busy}
        error={error}
        onConfirm={() => void mutateSchedule("delete")}
      />
      <Dialog
        open={Boolean(recording)}
        onOpenChange={(value) => {
          if (!value && !busy) setRecording(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("recordNow")}</DialogTitle>
            <DialogDescription>{t("recordScheduleHint")}</DialogDescription>
          </DialogHeader>
          {recording && (
            <div className="rounded-lg bg-muted p-4">
              <p className="font-semibold">{recording.name}</p>
              <p className="mt-2 text-sm">
                {t(recording.type)} · {formatCurrency(recording.amount)} ·{" "}
                {formatDate(getToday())}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {
                  accounts.find((account) => account.id === recording.accountId)
                    ?.name
                }
              </p>
            </div>
          )}
          <ErrorNotice message={error} />
          <DialogFooter>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setRecording(null)}
            >
              {t("cancel")}
            </Button>
            <Button
              disabled={busy}
              onClick={() => void mutateSchedule("record")}
            >
              {t(busy ? "saving" : "recordNow")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AddSchedule({ accounts }: { accounts: Account[] }) {
  const { t } = useLanguage()
  const notify = useFeedback()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [accountId, setAccountId] = useState("")
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("monthly")
  const [startDate, setStartDate] = useState(getToday())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError("")
    try {
      await requestJson(
        "/api/recurring",
        jsonBody("POST", {
          name,
          type,
          amount,
          category,
          accountId,
          frequency,
          startDate,
        }),
      )
      setOpen(false)
      setName("")
      setAmount("")
      setCategory("")
      setAccountId("")
      notify("scheduleSaved")
      window.dispatchEvent(new Event("finance-data-changed"))
    } catch (reason) {
      setError((reason as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!busy) {
          setOpen(value)
          setError("")
        }
      }}
    >
      <DialogTrigger asChild>
        <Button disabled={accounts.length === 0}>
          <Plus className="h-4 w-4" />
          {t("addRecurring")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addRecurring")}</DialogTitle>
          <DialogDescription>{t("recurringDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
            <Field id="schedule-name" label={t("name")} required>
              <Input
                id="schedule-name"
                placeholder={t("scheduleName")}
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </Field>
            <Field id="schedule-amount" label={t("amountIdr")} required>
              <Input
                id="schedule-amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </Field>
            <Field id="schedule-type" label={t("type")} required>
              <Select
                value={type}
                onValueChange={(value) => {
                  setType(value as "income" | "expense")
                  setCategory("")
                }}
              >
                <SelectTrigger id="schedule-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">{t("income")}</SelectItem>
                  <SelectItem value="expense">{t("expense")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field id="schedule-category" label={t("category")} required>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="schedule-category">
                  <SelectValue placeholder={t("chooseCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {(type === "income"
                    ? incomeCategories
                    : expenseCategories
                  ).map((item) => (
                    <SelectItem key={item} value={item}>
                      {t(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="schedule-account" label={t("account")} required>
              <Select value={accountId} onValueChange={setAccountId} required>
                <SelectTrigger id="schedule-account">
                  <SelectValue placeholder={t("chooseAccount")} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="schedule-frequency" label={t("frequency")} required>
              <Select
                value={frequency}
                onValueChange={(value) =>
                  setFrequency(value as "weekly" | "monthly")
                }
              >
                <SelectTrigger id="schedule-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t("monthly")}</SelectItem>
                  <SelectItem value="weekly">{t("weekly")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field id="schedule-date" label={t("startDate")} required>
              <Input
                id="schedule-date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </Field>
          </fieldset>
          <ErrorNotice message={error} />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setOpen(false)}
            >
              {t("cancel")}
            </Button>
            <SubmitButton
              busy={busy}
              disabled={
                !name.trim() || !category || !accountId || Number(amount) <= 0
              }
            >
              {t("saveSchedule")}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
