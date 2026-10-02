"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { expenseCategories, formatCurrency, getCurrentMonth, formatMonth } from "@/lib/finance"
import type { Budget } from "@/lib/types"

export function BudgetManager() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState("")
  const [budgetAmount, setBudgetAmount] = useState("")
  const [rolloverEnabled, setRolloverEnabled] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function fetchBudgets() {
    const response = await fetch(`/api/budgets?month=${selectedMonth}`)
    if (!response.ok) {
      setError("Anggaran tidak dapat dimuat.")
      return
    }

    setBudgets(await response.json())
    setError("")
  }

  useEffect(() => { void fetchBudgets() }, [selectedMonth])
  useEffect(() => {
    const refresh = () => void fetchBudgets()
    window.addEventListener("finance-data-changed", refresh)
    return () => window.removeEventListener("finance-data-changed", refresh)
  }, [selectedMonth])

  async function handleAddBudget(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")
    const response = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, budget: budgetAmount, periodStart: selectedMonth, rolloverEnabled }),
    })
    setLoading(false)

    if (!response.ok) {
      const result = await response.json().catch(() => null)
      setError(result?.error ?? "Anggaran tidak dapat disimpan.")
      return
    }

    setOpen(false)
    setCategory("")
    setBudgetAmount("")
    setRolloverEnabled(false)
    await fetchBudgets()
  }

  const totalBudget = budgets.reduce((total, budget) => total + budget.budget, 0)
  const totalSpent = budgets.reduce((total, budget) => total + budget.spent, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><h2 className="text-3xl font-bold tracking-tight">Anggaran</h2><p className="text-muted-foreground">Batas belanja yang otomatis mengikuti transaksi Anda.</p></div>
        <div className="flex gap-2"><Input type="month" aria-label="Pilih bulan anggaran" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} /><Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button>Tambah anggaran</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Tambah anggaran {formatMonth(selectedMonth)}</DialogTitle></DialogHeader><form onSubmit={handleAddBudget} className="space-y-4"><div className="space-y-2"><Label>Kategori</Label><Select value={category} onValueChange={setCategory} required><SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger><SelectContent>{expenseCategories.filter((item) => !budgets.some((budget) => budget.category === item)).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="budget">Batas anggaran</Label><Input id="budget" type="number" min="1" step="1" inputMode="numeric" placeholder="0" value={budgetAmount} onChange={(event) => setBudgetAmount(event.target.value)} required /></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={rolloverEnabled} onChange={(event) => setRolloverEnabled(event.target.checked)} />Bawa sisa anggaran ke bulan berikutnya</label><DialogFooter><Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan anggaran"}</Button></DialogFooter></form></DialogContent></Dialog></div>
      </div>
      {error && <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>}
      <div className="grid gap-3 md:grid-cols-3"><BudgetTotal label="Total anggaran" value={formatCurrency(totalBudget)} /><BudgetTotal label="Terpakai" value={formatCurrency(totalSpent)} tone="text-rose-700" /><BudgetTotal label="Sisa" value={formatCurrency(totalBudget - totalSpent)} tone={totalBudget - totalSpent < 0 ? "text-rose-700" : "text-emerald-700"} /></div>
      <div className="grid gap-4">
        {budgets.map((budget) => <BudgetCard key={budget.id} budget={budget} />)}
        {budgets.length === 0 && <Card><CardContent className="py-12 text-center"><p className="font-semibold">Belum ada anggaran untuk {formatMonth(selectedMonth)}</p><p className="mt-1 text-sm text-muted-foreground">Tambahkan batas belanja untuk mulai memantau pengeluaran.</p></CardContent></Card>}
      </div>
    </div>
  )
}

function BudgetTotal({ label, value, tone = "text-foreground" }: { label: string; value: string; tone?: string }) {
  return <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{label}</p><p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p></CardContent></Card>
}

function BudgetCard({ budget }: { budget: Budget }) {
  const effectiveBudget = budget.effectiveBudget ?? budget.budget
  const carryover = budget.carryover ?? 0
  const percentage = Math.round((budget.spent / effectiveBudget) * 100)
  const status = percentage >= 100 ? "Melebihi batas" : percentage >= 80 ? "Hampir habis" : "Terkendali"
  const tone = percentage >= 100 ? "text-rose-700" : percentage >= 80 ? "text-amber-700" : "text-emerald-700"

  return <Card><CardHeader className="pb-3"><div className="flex items-center justify-between gap-4"><CardTitle className="text-lg">{budget.category}</CardTitle><span className={`text-sm font-semibold ${tone}`}>{status} · {percentage}%</span></div></CardHeader><CardContent className="space-y-3"><Progress value={Math.min(percentage, 100)} className="h-2" /><div className="flex justify-between text-sm"><span className="text-muted-foreground">Terpakai {formatCurrency(budget.spent)}</span><span className="font-medium">dari {formatCurrency(effectiveBudget)}</span></div>{carryover > 0 && <p className="text-sm text-primary">Termasuk rollover {formatCurrency(carryover)}</p>}<p className={`text-sm ${tone}`}>{percentage > 100 ? `Melebihi ${formatCurrency(budget.spent - effectiveBudget)}` : `Sisa ${formatCurrency(effectiveBudget - budget.spent)}`}</p></CardContent></Card>
}
