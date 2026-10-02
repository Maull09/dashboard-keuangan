"use client"

import { useEffect, useState } from "react"

import { AddDebtForm } from "@/components/debt-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, getToday } from "@/lib/finance"
import type { Account } from "@/lib/types"

type Debt = { id: number; type: "utang" | "piutang"; name: string; amount: number; paidAmount: number; description: string | null; status: "unpaid" | "paid" }

export function DebtManager() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])

  async function fetchData() {
    const [debtResponse, accountResponse] = await Promise.all([fetch("/api/debts"), fetch("/api/accounts")])
    if (debtResponse.ok) setDebts(await debtResponse.json())
    if (accountResponse.ok) setAccounts(await accountResponse.json())
  }

  useEffect(() => { void fetchData() }, [])

  return <div className="space-y-6"><div className="flex items-center justify-between"><div><h2 className="text-3xl font-bold tracking-tight">Utang & piutang</h2><p className="text-muted-foreground">Catat pembayaran bertahap dan riwayat pelunasannya.</p></div><AddDebtForm onAdded={fetchData} /></div><div className="grid gap-4">{debts.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">Belum ada data utang atau piutang.</CardContent></Card>}{debts.map((debt) => <DebtCard key={debt.id} debt={debt} accounts={accounts} onPaid={fetchData} />)}</div></div>
}

function DebtCard({ debt, accounts, onPaid }: { debt: Debt; accounts: Account[]; onPaid: () => void }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [accountId, setAccountId] = useState("")
  const [error, setError] = useState("")
  const remaining = debt.amount - debt.paidAmount

  async function recordPayment(event: React.FormEvent) {
    event.preventDefault()
    const response = await fetch(`/api/debts/${debt.id}/payments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount, accountId, date: getToday() }) })
    if (!response.ok) { setError((await response.json()).error ?? "Pembayaran tidak dapat disimpan."); return }
    setOpen(false); setAmount(""); setAccountId(""); onPaid(); window.dispatchEvent(new Event("finance-data-changed"))
  }

  return <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>{debt.type === "utang" ? "Utang ke" : "Piutang dari"} {debt.name}</CardTitle><span className={`rounded-full px-2 py-1 text-xs font-semibold ${debt.status === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{debt.status === "paid" ? "Lunas" : "Berjalan"}</span></CardHeader><CardContent className="space-y-3"><div className="grid gap-2 sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">Total</p><p className="font-bold">{formatCurrency(debt.amount)}</p></div><div><p className="text-xs text-muted-foreground">Sudah dibayar</p><p className="font-bold text-primary">{formatCurrency(debt.paidAmount)}</p></div><div><p className="text-xs text-muted-foreground">Sisa</p><p className="font-bold text-rose-700">{formatCurrency(remaining)}</p></div></div>{debt.status === "unpaid" && <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button size="sm">Catat pembayaran</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Catat pembayaran {debt.name}</DialogTitle></DialogHeader><form onSubmit={recordPayment} className="space-y-3"><Input type="number" min="1" max={remaining} placeholder="Jumlah pembayaran" value={amount} onChange={(event) => setAmount(event.target.value)} required /><Select value={accountId} onValueChange={setAccountId}><SelectTrigger><SelectValue placeholder="Akun yang digunakan" /></SelectTrigger><SelectContent>{accounts.map((account) => <SelectItem key={account.id} value={String(account.id)}>{account.name}</SelectItem>)}</SelectContent></Select>{error && <p className="text-sm text-destructive">{error}</p>}<DialogFooter><Button type="submit" disabled={!accountId}>Simpan pembayaran</Button></DialogFooter></form></DialogContent></Dialog>}</CardContent></Card>
}
