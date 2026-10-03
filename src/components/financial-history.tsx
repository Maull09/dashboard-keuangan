"use client"

import { useState } from "react"
import { History } from "lucide-react"
import { useLanguage } from "./language-provider"
import { EmptyState, ErrorNotice, LoadingState } from "./feedback"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { useRemoteData } from "@/lib/use-remote-data"
import type { Account } from "@/lib/types"

type Props = { url: string; title: string; detail: string; accounts: Account[] }
type Entry = {
  id: number
  accountId: number
  amount: number
  date: string
  note: string
}

export function FinancialHistory(props: Props) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t(props.title) + " " + props.detail}
        >
          <History className="h-4 w-4" />
          {t(props.title)}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t(props.title)} · {props.detail}
          </DialogTitle>
          <DialogDescription>{t("historyReadOnlyHint")}</DialogDescription>
        </DialogHeader>
        {open && <HistoryEntries {...props} />}
      </DialogContent>
    </Dialog>
  )
}

function HistoryEntries({ url, accounts }: Props) {
  const { t, formatCurrency, formatDate } = useLanguage()
  const records = useRemoteData<Entry[]>(url)
  if (records.error)
    return <ErrorNotice message={records.error} onRetry={records.reload} />
  if (records.loading) return <LoadingState />
  if (!records.data?.length)
    return (
      <EmptyState title={t("noHistory")} description={t("noHistoryHint")} />
    )
  return (
    <ul
      className="max-h-96 space-y-3 overflow-y-auto"
      aria-label={t("history")}
    >
      {records.data.map((entry) => (
        <li key={entry.id} className="rounded-lg border p-3">
          <div className="flex flex-wrap justify-between gap-2">
            <span>{formatDate(entry.date)}</span>
            <span className="font-semibold tabular-nums">
              {formatCurrency(entry.amount)}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("account")}:{" "}
            {accounts.find((account) => account.id === entry.accountId)?.name ??
              t("accountUnavailable")}
          </p>
          {entry.note && (
            <p className="mt-1 break-words text-sm">{entry.note}</p>
          )}
        </li>
      ))}
    </ul>
  )
}
