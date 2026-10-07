"use client"

import Link from "next/link"
import { Landmark } from "lucide-react"
import { useLanguage } from "./language-provider"
import { Button } from "./ui/button"

export function PublicHeader() {
  const { locale, setLocale, t } = useLanguage()
  return (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-8">
      <Link
        href="/"
        className="flex min-h-11 items-center gap-3 font-semibold tracking-tight"
      >
        <span className="rounded-lg bg-brand p-2 text-white">
          <Landmark className="size-5" aria-hidden="true" />
        </span>
        Finance Tracker
      </Link>
      <div className="flex items-center gap-3">
        <label className="sr-only" htmlFor="public-language">
          {t("language")}
        </label>
        <select
          id="public-language"
          value={locale}
          onChange={(event) => setLocale(event.target.value as "en" | "id")}
          className="min-h-11 rounded-md border bg-white px-2 text-sm"
        >
          <option value="en">English</option>
          <option value="id">Indonesia</option>
        </select>
        <Button asChild variant="outline" className="min-h-11">
          <Link href="/sign-in">{t("signIn")}</Link>
        </Button>
      </div>
    </header>
  )
}
