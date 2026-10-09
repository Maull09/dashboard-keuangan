"use client"

import { useRemoteData } from "@/lib/use-remote-data"
import { ErrorNotice, Field } from "./feedback"
import { useLanguage } from "./language-provider"
import { Input } from "./ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

export function TransactionGroupField({
  id,
  choice,
  name,
  onChoiceChange,
  onNameChange,
}: {
  id: string
  choice: string
  name: string
  onChoiceChange: (choice: string) => void
  onNameChange: (name: string) => void
}) {
  const { t } = useLanguage()
  const groups = useRemoteData<string[]>("/api/transactions/groups")
  const names = [
    ...new Set([
      ...(groups.data ?? []),
      ...(choice.startsWith("group:") ? [choice.slice(6)] : []),
    ]),
  ]
  return (
    <div className="space-y-3">
      <Field
        id={id}
        label={t("transactionGroupOptional")}
        hint={t("transactionGroupHint")}
      >
        <Select value={choice} onValueChange={onChoiceChange}>
          <SelectTrigger id={id} aria-describedby={id + "-hint"}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t("ungroupedTransactions")}</SelectItem>
            {names.map((group) => (
              <SelectItem key={group} value={"group:" + group}>
                {group}
              </SelectItem>
            ))}
            <SelectItem value="new">{t("newTransactionGroup")}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {groups.loading && (
        <p role="status" className="text-xs text-muted-foreground">
          {t("loadingGroups")}
        </p>
      )}
      <ErrorNotice message={groups.error} onRetry={groups.reload} />
      {choice === "new" && (
        <Field id={id + "-name"} label={t("groupName")} required>
          <Input
            id={id + "-name"}
            value={name}
            maxLength={100}
            required
            placeholder={t("groupExample")}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </Field>
      )}
    </div>
  )
}
