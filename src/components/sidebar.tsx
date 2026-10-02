import {
  Home,
  Plus,
  TrendingUp,
  Wallet,
  Target,
  PieChartIcon,
  CalendarClock,
  X
} from "lucide-react"

import { useEffect, useState } from "react"
import { AddAccountForm } from "./accounts-form"

const menu = [
    { key: "dashboard", label: "Dashboard", icon: <Home className="h-4 w-4" /> },
    { key: "transactions", label: "Transaksi", icon: <Plus className="h-4 w-4" /> },
    { key: "budget", label: "Anggaran", icon: <TrendingUp className="h-4 w-4" /> },
    { key: "goals", label: "Tujuan Keuangan", icon: <Target className="h-4 w-4" /> },
    { key: "reports", label: "Laporan", icon: <PieChartIcon className="h-4 w-4" /> },
    { key: "planning", label: "Rencana", icon: <CalendarClock className="h-4 w-4" /> },
    { key: "debts", label: "Utang", icon: <Wallet className="h-4 w-4" /> }
]

export function Sidebar({
  activeTab,
  setActiveTab,
  open = true,
  onClose,
}: {
  activeTab: string
  setActiveTab: (tab: string) => void
  open?: boolean
  onClose?: () => void
}) {
  const [accounts, setAccounts] = useState<any[]>([])

  const fetchAccounts = () => {
    fetch("/api/accounts").then(res => res.json()).then(setAccounts)
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  // Sidebar classes: fixed di mobile, static di desktop
  const sidebarClass =
    "z-40 bg-background border-r flex flex-col min-h-screen transition-transform duration-200 " +
    (open
      ? "translate-x-0"
      : "-translate-x-full") +
    " w-64 fixed md:static md:translate-x-0"

  return (
    <>
      {/* Overlay untuk mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={sidebarClass}>
        {/* Tombol close di mobile */}
        <div className="flex items-center gap-2 px-4 py-4 border-b">
          <Wallet className="h-6 w-6" />
          <span className="font-semibold text-lg">Finance Tracker</span>
          <button
            className="ml-auto md:hidden"
            onClick={onClose}
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {menu.map((item) => (
              <li key={item.key}>
                <button
                  className={`flex items-center gap-2 w-full px-4 py-2 rounded transition ${
                    activeTab === item.key
                      ? "bg-muted text-primary font-semibold"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => {
                    setActiveTab(item.key)
                    onClose?.()
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-8 px-4">
            <div className="text-xs text-muted-foreground mb-2">Akun Saya</div>
            <ul className="space-y-1">
              {accounts.map((acc) => (
                <li key={acc.id} className="flex justify-between items-center">
                  <span>
                    {acc.name} <span className="text-xs text-muted-foreground">({acc.type})</span>
                  </span>
                </li>
              ))}
            </ul>
            <AddAccountForm onAdded={fetchAccounts} />
          </div>
        </nav>
      </aside>
    </>
  )
}
