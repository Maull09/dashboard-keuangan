"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { ConfirmDelete, useFeedback } from "./feedback"
import { useLanguage } from "./language-provider"
import { Button } from "./ui/button"
import { requestJson } from "@/lib/client-api"

export function RecordDeleteButton({
  url,
  detail,
  description,
  success,
}: {
  url: string
  detail: string
  description: string
  success: string
}) {
  const { t } = useLanguage()
  const notify = useFeedback()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function remove() {
    if (busy) return
    setBusy(true)
    setError("")
    try {
      await requestJson(url, { method: "DELETE" })
      setOpen(false)
      notify(success)
      window.dispatchEvent(new Event("finance-data-changed"))
    } catch (reason) {
      setError((reason as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={t("delete") + " " + detail}
        onClick={() => {
          setError("")
          setOpen(true)
        }}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
        {t("delete")}
      </Button>
      <ConfirmDelete
        open={open}
        onOpenChange={setOpen}
        detail={detail}
        description={t(description)}
        busy={busy}
        error={error}
        onConfirm={() => void remove()}
      />
    </>
  )
}
