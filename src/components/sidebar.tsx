"use client"

import { useEffect, useState } from "react"
import { CalendarClock, Home, PieChartIcon, Plus, Target, TrendingUp, Wallet, X } from "lucide-react"

import { AddAccountForm } from "./accounts-form"
import { useLanguage } from "./language-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

const menuItems = [
  { key: "dashboard", label: "dashboard", icon: Home },
  { key: "transactions", label: "transactions", icon: Plus },
  { key: "budget", label: "budget", icon: TrendingUp },
  { key: "goals", label: "goals", icon: Target },
  { key: "reports", label: "reports", icon: PieChartIcon },
  { key: "planning", label: "planning", icon: CalendarClock },
  { key: "debts", label: "debts", icon: Wallet },
]

export function Sidebar({ activeTab, setActiveTab, open = true, onClose }: { activeTab: string; setActiveTab: (tab: string) => void; open?: boolean; onClose?: () => void }) {
  const [accounts, setAccounts] = useState<Array<{ id: number; name: string; type: string }>>([])
  const { locale, setLocale, t } = useLanguage()

  async function fetchAccounts() {
    const response = await fetch("/api/accounts")
    if (response.ok) setAccounts(await response.json())
  }

  useEffect(() => { void fetchAccounts() }, [])

  return (
    <>
      {open && <button type="button" className="fixed inset-0 z-30 bg-black/30 md:hidden" aria-label={t("closeMenu")} onClick={onClose} />}
      <aside className={`fixed z-40 flex min-h-screen w-64 flex-col border-r bg-background transition-transform duration-200 md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-2 border-b px-4 py-4"><Wallet className="h-6 w-6 text-primary" /><span className="text-lg font-semibold">Finance Tracker</span><button type="button" className="ml-auto rounded p-1 hover:bg-muted md:hidden" onClick={onClose} aria-label={t("closeMenu")}><X className="h-5 w-5" /></button></div>
        <nav className="flex-1 py-4"><ul className="space-y-1 px-2">{menuItems.map(({ key, label, icon: Icon }) => <li key={key}><button type="button" className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left transition ${activeTab === key ? "bg-muted font-semibold text-primary" : "hover:bg-muted"}`} onClick={() => { setActiveTab(key); onClose?.() }}><Icon className="h-4 w-4" />{t(label)}</button></li>)}</ul><div className="mt-8 px-4"><p className="mb-2 text-xs text-muted-foreground">{t("accounts")}</p><ul className="mb-3 space-y-1 text-sm">{accounts.map((account) => <li key={account.id}>{account.name} <span className="text-xs text-muted-foreground">({account.type})</span></li>)}</ul><AddAccountForm onAdded={fetchAccounts} /></div></nav>
        <div className="border-t p-4"><label className="mb-2 block text-xs text-muted-foreground" htmlFor="language">{t("language")}</label><Select value={locale} onValueChange={(value) => setLocale(value as "en" | "id")}><SelectTrigger id="language"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="id">Bahasa Indonesia</SelectItem></SelectContent></Select></div>
      </aside>
    </>
  )
}
