"use client"

import { useEffect, useState } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { formatCurrency, getToday } from "@/lib/finance"
import type { AccountSummary as AccountSummaryData } from "@/lib/types"

export function AccountSummary() {
  const [accounts, setAccounts] = useState<AccountSummaryData[]>([])

  async function fetchAccounts() {
    const response = await fetch("/api/accounts/summary")
    if (response.ok) setAccounts(await response.json())
  }

  useEffect(() => {
    void fetchAccounts()
    window.addEventListener("finance-data-changed", fetchAccounts)
    return () => window.removeEventListener("finance-data-changed", fetchAccounts)
  }, [])

  if (accounts.length === 0) return null

  return (
    <section aria-labelledby="account-summary-title">
      <div className="mb-3 flex items-baseline justify-between"><h3 id="account-summary-title" className="font-semibold">Saldo per akun</h3><span className="text-sm text-muted-foreground">Dihitung dari saldo awal dan transaksi</span></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {accounts.map((account) => <Card key={account.id} className="border-l-4 border-l-primary/60"><CardContent className="p-4"><p className="text-xs text-muted-foreground">{account.type}</p><p className="mt-1 font-semibold">{account.name}</p><p className={`mt-2 text-lg font-bold ${account.balance < 0 ? "text-rose-700" : "text-foreground"}`}>{formatCurrency(account.balance)}</p><ReconcileAccount account={account} /></CardContent></Card>)}
      </div>
    </section>
  )
}

function ReconcileAccount({ account }: { account: AccountSummaryData }) {
  const [open, setOpen] = useState(false)
  const [actualBalance, setActualBalance] = useState("")
  const [result, setResult] = useState("")

  async function reconcile(event: React.FormEvent) {
    event.preventDefault()
    const response = await fetch(`/api/accounts/${account.id}/reconciliations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actualBalance, date: getToday() }) })
    if (!response.ok) { setResult("Saldo aktual tidak valid."); return }
    const data = await response.json()
    setResult(data.difference === 0 ? "Saldo cocok dengan catatan." : `Selisih ${formatCurrency(data.difference)} dari catatan.`)
  }

  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="ghost" size="sm" className="mt-2 h-auto px-0 text-primary">Rekonsiliasi saldo</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Rekonsiliasi {account.name}</DialogTitle></DialogHeader><form onSubmit={reconcile} className="space-y-3"><p className="text-sm text-muted-foreground">Saldo menurut catatan: {formatCurrency(account.balance)}</p><Input type="number" placeholder="Saldo aktual di rekening" value={actualBalance} onChange={(event) => setActualBalance(event.target.value)} required />{result && <p className="text-sm text-primary">{result}</p>}<DialogFooter><Button type="submit">Bandingkan saldo</Button></DialogFooter></form></DialogContent></Dialog>
}
