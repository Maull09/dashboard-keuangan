"use client"

import { useId, useState } from "react"
import { Plus } from "lucide-react"
import { useLanguage } from "./language-provider"
import { ErrorNotice, Field, SubmitButton, useFeedback } from "./feedback"
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
import { accountTypes, type AccountType } from "@/lib/finance"
import { jsonBody, requestJson } from "@/lib/client-api"

export function AddAccountForm({ onAdded }: { onAdded?: () => void }) {
  const { t } = useLanguage()
  const notify = useFeedback()
  const id = useId()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<AccountType>("bank")
  const [initialBalance, setInitialBalance] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setError("")
    try {
      await requestJson(
        "/api/accounts",
        jsonBody("POST", { name, type, initialBalance, description }),
      )
      setOpen(false)
      setName("")
      setInitialBalance("")
      setDescription("")
      notify("accountSaved")
      onAdded?.()
      window.dispatchEvent(new Event("finance-data-changed"))
    } catch (reason) {
      setError((reason as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          setOpen(value)
          setError("")
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          {t("addAccount")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addAccount")}</DialogTitle>
          <DialogDescription>{t("requiredHint")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={loading} className="space-y-4">
            <Field id={id + "-name"} label={t("name")} required>
              <Input
                id={id + "-name"}
                placeholder={t("accountName")}
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={120}
                required
              />
            </Field>
            <Field id={id + "-type"} label={t("accountType")} required>
              <Select
                value={type}
                onValueChange={(value) => setType(value as AccountType)}
              >
                <SelectTrigger id={id + "-type"}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((item) => (
                    <SelectItem key={item} value={item}>
                      {t(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field
              id={id + "-balance"}
              label={t("openingBalance")}
              hint={t("openingBalanceHint")}
            >
              <Input
                id={id + "-balance"}
                aria-describedby={id + "-balance-hint"}
                type="number"
                step="1"
                inputMode="numeric"
                placeholder="0"
                value={initialBalance}
                onChange={(event) => setInitialBalance(event.target.value)}
              />
            </Field>
            <Field id={id + "-note"} label={t("note")}>
              <Input
                id={id + "-note"}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Field>
          </fieldset>
          <ErrorNotice message={error} />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => setOpen(false)}
            >
              {t("cancel")}
            </Button>
            <SubmitButton busy={loading} disabled={!name.trim()}>
              {t("saveAccount")}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
