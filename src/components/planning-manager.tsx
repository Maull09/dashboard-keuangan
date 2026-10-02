"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, getToday, type TransactionType } from "@/lib/finance"
import type { Account } from "@/lib/types"

type Recurring = { id: number; name: string; type: TransactionType; amount: number; category: string; accountId: number; frequency: "weekly" | "monthly"; startDate: string; lastExecutedDate: string | null }
type Forecast = { payday: string; currentBalance: number; forecastBalance: number; scheduled: Recurring[] }

export function PlanningManager() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [recurring, setRecurring] = useState<Recurring[]>([])
  const [payday, setPayday] = useState(getToday())
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [name, setName] = useState("")
  const [type, setType] = useState<TransactionType>("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [accountId, setAccountId] = useState("")
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("monthly")
  const [startDate, setStartDate] = useState(getToday())
  const [error, setError] = useState("")

  async function load() {
    const [accountsResponse, recurringResponse] = await Promise.all([fetch("/api/accounts"), fetch("/api/recurring")])
    if (accountsResponse.ok) setAccounts(await accountsResponse.json())
    if (recurringResponse.ok) setRecurring(await recurringResponse.json())
  }

  useEffect(() => { void load() }, [])

  async function createRecurring(event: React.FormEvent) {
    event.preventDefault()
    const response = await fetch("/api/recurring", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, type, amount, category, accountId, frequency, startDate }) })
    if (!response.ok) { setError((await response.json()).error ?? "Jadwal rutin tidak dapat disimpan."); return }
    setName(""); setAmount(""); setCategory(""); setAccountId(""); setError(""); await load()
  }

  async function loadForecast() {
    const response = await fetch(`/api/forecast?payday=${payday}`)
    if (!response.ok) { setError((await response.json()).error ?? "Forecast tidak dapat dibuat."); return }
    setForecast(await response.json()); setError("")
  }

  async function executeRecurring(id: number) {
    const response = await fetch(`/api/recurring/${id}/execute`, { method: "POST" })
    if (!response.ok) { setError("Jadwal rutin tidak dapat dicatat."); return }
    window.dispatchEvent(new Event("finance-data-changed")); await load()
  }

  async function deleteRecurring(id: number) {
    if (!window.confirm("Hapus jadwal rutin ini?")) return
    await fetch(`/api/recurring/${id}`, { method: "DELETE" }); await load()
  }

  return <div className="space-y-6"><div><h1 className="text-3xl font-bold tracking-tight">Rencana keuangan</h1><p className="mt-2 text-muted-foreground">Lihat estimasi saldo menuju gajian dan kelola transaksi yang berulang.</p></div>{error && <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<div className="grid gap-4 xl:grid-cols-2"><Card><CardHeader><CardTitle>Forecast sampai gajian</CardTitle><CardDescription>Proyeksi memakai saldo saat ini dan jadwal rutin aktif.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex gap-2"><Input type="date" value={payday} onChange={(event) => setPayday(event.target.value)} /><Button onClick={() => void loadForecast()}>Hitung forecast</Button></div>{forecast && <div className="rounded-lg bg-muted p-4"><p className="text-sm text-muted-foreground">Estimasi saldo pada {forecast.payday}</p><p className={`mt-1 text-2xl font-bold ${forecast.forecastBalance < 0 ? "text-rose-700" : "text-primary"}`}>{formatCurrency(forecast.forecastBalance)}</p><p className="mt-2 text-sm text-muted-foreground">Saldo saat ini {formatCurrency(forecast.currentBalance)} · {forecast.scheduled.length} jadwal diperhitungkan</p></div>}</CardContent></Card><Card><CardHeader><CardTitle>Tambah jadwal rutin</CardTitle><CardDescription>Gunakan untuk gaji, tagihan, langganan, atau cicilan.</CardDescription></CardHeader><CardContent><form onSubmit={createRecurring} className="grid gap-3 sm:grid-cols-2"><Input placeholder="Nama, misalnya Internet" value={name} onChange={(event) => setName(event.target.value)} required /><Input type="number" min="1" placeholder="Jumlah" value={amount} onChange={(event) => setAmount(event.target.value)} required /><Select value={type} onValueChange={(value) => setType(value as TransactionType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="income">Pemasukan</SelectItem><SelectItem value="expense">Pengeluaran</SelectItem></SelectContent></Select><Input placeholder="Kategori" value={category} onChange={(event) => setCategory(event.target.value)} required /><Select value={accountId} onValueChange={setAccountId}><SelectTrigger><SelectValue placeholder="Pilih akun" /></SelectTrigger><SelectContent>{accounts.map((account) => <SelectItem key={account.id} value={String(account.id)}>{account.name}</SelectItem>)}</SelectContent></Select><Select value={frequency} onValueChange={(value) => setFrequency(value as "weekly" | "monthly")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="monthly">Bulanan</SelectItem><SelectItem value="weekly">Mingguan</SelectItem></SelectContent></Select><Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required /><Button type="submit" disabled={!accountId}>Simpan jadwal</Button></form></CardContent></Card></div><Card><CardHeader><CardTitle>Jadwal aktif</CardTitle></CardHeader><CardContent className="space-y-3">{recurring.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada jadwal rutin.</p> : recurring.map((item) => <div key={item.id} className="flex flex-col justify-between gap-3 rounded-lg border p-3 sm:flex-row sm:items-center"><div><p className="font-semibold">{item.name}</p><p className="text-sm text-muted-foreground">{item.frequency === "monthly" ? "Bulanan" : "Mingguan"} · {formatCurrency(item.amount)} · mulai {item.startDate}</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => void executeRecurring(item.id)}>Catat sekarang</Button><Button variant="ghost" className="text-destructive" onClick={() => void deleteRecurring(item.id)}>Hapus</Button></div></div>)}</CardContent></Card></div>
}
