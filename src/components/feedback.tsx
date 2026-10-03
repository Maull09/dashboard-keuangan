"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, Inbox, Loader2, X } from "lucide-react"
import { useLanguage } from "./language-provider"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Label } from "./ui/label"

const FeedbackContext = createContext<(message: string) => void>(() => {})

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState("")
  const { t } = useLanguage()
  useEffect(() => {
    if (!message) return
    const timeout = window.setTimeout(() => setMessage(""), 8000)
    return () => window.clearTimeout(timeout)
  }, [message])
  return (
    <FeedbackContext.Provider value={setMessage}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 left-4 z-50 sm:left-auto sm:max-w-md"
      >
        {message && (
          <div className="flex items-start gap-3 rounded-xl border border-teal-200 bg-white p-4 text-sm text-teal-950 shadow-lg">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
            <p className="flex-1">{t(message)}</p>
            <button
              type="button"
              aria-label={t("done")}
              className="rounded p-1 hover:bg-muted"
              onClick={() => setMessage("")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  return useContext(FeedbackContext)
}

export function Field({
  id,
  label,
  hint,
  required,
  children,
}: {
  id: string
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-destructive">
            {" "}
            *
          </span>
        )}
      </Label>
      {children}
      {hint && (
        <p
          id={`${id}-hint`}
          className="text-xs leading-relaxed text-muted-foreground"
        >
          {hint}
        </p>
      )}
    </div>
  )
}

export function PageHeading({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1 basis-64">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {children && (
        <div className="flex max-w-full flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </div>
  )
}

export function LoadingState() {
  const { t } = useLanguage()
  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-xl border bg-card p-6 text-sm text-muted-foreground"
    >
      <Loader2 className="h-4 w-4 animate-spin" />
      {t("loading")}
    </div>
  )
}

export function ErrorNotice({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  const { t } = useLanguage()
  if (!message) return null
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 sm:flex-row sm:items-start"
    >
      <AlertCircle className="h-5 w-5 shrink-0" />
      <p className="flex-1 leading-relaxed">{t(message)}</p>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          {t("retry")}
        </Button>
      )}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-dashed bg-card px-5 py-10 text-center">
      <Inbox className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
      <h2 className="font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {children && (
        <div className="mt-5 flex justify-center gap-2">{children}</div>
      )}
    </div>
  )
}

export function SubmitButton({
  busy,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { busy: boolean }) {
  const { t } = useLanguage()
  return (
    <Button
      type="submit"
      {...props}
      disabled={busy || props.disabled}
      aria-busy={busy}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {busy ? t("saving") : children}
    </Button>
  )
}

export function ConfirmDelete({
  open,
  onOpenChange,
  detail,
  description,
  busy,
  error,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  detail: string
  description: string
  busy: boolean
  error: string
  onConfirm: () => void
}) {
  const { t } = useLanguage()
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!busy) onOpenChange(value)
      }}
    >
      <DialogContent
        onEscapeKeyDown={(event) => {
          if (busy) event.preventDefault()
        }}
        onPointerDownOutside={(event) => {
          if (busy) event.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>{t("confirmDelete")}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <p className="rounded-lg border bg-muted p-3 text-sm font-medium">
          {detail}
        </p>
        <ErrorNotice message={error} />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            autoFocus
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? t("deleting") : t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
