"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { ErrorNotice, Field, SubmitButton, useFeedback } from "./feedback"
import { useLanguage } from "./language-provider"
import { Button } from "./ui/button"
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
import { requestJson, jsonBody } from "@/lib/client-api"

export function AddDebtForm({ onAdded }: { onAdded?: () => void }) {
  const { t } = useLanguage()
  const notify = useFeedback()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<"utang" | "piutang">("utang")
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError("")
    try {
      await requestJson(
        "/api/debts",
        jsonBody("POST", { type, name, amount, description, dueDate }),
      )
      setOpen(false)
      setName("")
      setAmount("")
      setDescription("")
      setDueDate("")
      notify("debtSaved")
      onAdded?.()
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
        <Button>
          <Plus className="h-4 w-4" />
          {t("addDebt")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addDebt")}</DialogTitle>
          <DialogDescription>{t("requiredHint")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <fieldset disabled={busy} className="space-y-4">
            <Field id="debt-type" label={t("type")} required>
              <Select
                value={type}
                onValueChange={(value) => setType(value as "utang" | "piutang")}
              >
                <SelectTrigger id="debt-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utang">{t("debt")}</SelectItem>
                  <SelectItem value="piutang">{t("receivable")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field id="debt-name" label={t("counterparty")} required>
              <Input
                id="debt-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </Field>
            <Field id="debt-amount" label={t("amountIdr")} required>
              <Input
                id="debt-amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </Field>
            <Field id="debt-note" label={t("note")}>
              <Input
                id="debt-note"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Field>
            <Field
              id="debt-date"
              label={t("dueDate") + " (" + t("optional") + ")"}
            >
              <Input
                id="debt-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
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
              disabled={!name.trim() || Number(amount) <= 0}
            >
              {t("save")}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
