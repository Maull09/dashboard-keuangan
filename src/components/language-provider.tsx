"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

import {
  formatCurrency,
  formatDate,
  formatMonth,
  type Locale,
} from "@/lib/finance"
import { messages } from "@/lib/i18n"

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, values?: Record<string, string | number>) => string
  formatCurrency: (amount: number) => string
  formatDate: (date: string) => string
  formatMonth: (month: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, updateLocale] = useState<Locale>("en")

  function setLocale(value: Locale) {
    window.localStorage.setItem("locale", value)
    updateLocale(value)
  }

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("locale")
    if (savedLocale !== "en" && savedLocale !== "id") return
    const timer = window.setTimeout(() => updateLocale(savedLocale))
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: string, values: Record<string, string | number> = {}) =>
        Object.entries(values).reduce(
          (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
          messages[locale][key] ?? key,
        ),
      formatCurrency: (amount: number) => formatCurrency(amount, locale),
      formatDate: (date: string) => formatDate(date, locale),
      formatMonth: (month: string) => formatMonth(month, locale),
    }),
    [locale],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context)
    throw new Error("useLanguage must be used within LanguageProvider")
  return context
}
