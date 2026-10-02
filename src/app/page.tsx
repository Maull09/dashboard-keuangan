"use client"

import { useCallback, useEffect, useState } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ArrowDownRight, ArrowUpRight, Calendar, DollarSign, Menu, TrendingUp } from "lucide-react"

import { AccountSummary } from "@/components/account-summary"
import { BudgetManager } from "@/components/budget-manager"
import { DebtManager } from "@/components/debt-manager"
import { GoalsManager } from "@/components/goals-manager"
import { PlanningManager } from "@/components/planning-manager"
import { Sidebar } from "@/components/sidebar"
import { useLanguage } from "@/components/language-provider"
import { TransactionList } from "@/components/transaction-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { getCurrentMonth } from "@/lib/finance"
import type { DashboardData } from "@/lib/types"

const chartColors = ["#0f766e", "#2563eb", "#d97706", "#be123c", "#7c3aed", "#475569"]

export default function FinanceTracker() {
  const { locale, t } = useLanguage()
  const [tab, setTab] = useState("dashboard")
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    const response = await fetch("/api/dashboard")

    if (!response.ok) {
      setError(t("summaryUnavailable"))
      setLoading(false)
      return
    }

    setData(await response.json())
    setError("")
    setLoading(false)
  }, [t])

  useEffect(() => {
    void loadDashboard()
    const refresh = () => void loadDashboard()
    window.addEventListener("finance-data-changed", refresh)
    return () => window.removeEventListener("finance-data-changed", refresh)
  }, [loadDashboard])

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-950">
      <Sidebar activeTab={tab} setActiveTab={setTab} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
          <button className="rounded-md p-2 hover:bg-muted md:hidden" onClick={() => setSidebarOpen(true)} aria-label={t("openMenu")}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" /><span>{new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", { year: "numeric", month: "long" }).format(new Date())}</span></div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsContent value="dashboard"><Dashboard data={data} loading={loading} error={error} /></TabsContent>
            <TabsContent value="transactions"><TransactionList /></TabsContent>
            <TabsContent value="budget"><BudgetManager /></TabsContent>
            <TabsContent value="goals"><GoalsManager /></TabsContent>
            <TabsContent value="debts"><DebtManager /></TabsContent>
            <TabsContent value="reports"><Reports data={data} loading={loading} error={error} /></TabsContent>
            <TabsContent value="planning"><PlanningManager /></TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

function Dashboard({ data, loading, error }: { data: DashboardData | null; loading: boolean; error: string }) {
  const { formatCurrency, t } = useLanguage()
  if (loading) return <LoadingPanel />
  if (!data || error) return <ErrorPanel message={error} />

  return (
    <div className="space-y-6">
      <div className="max-w-2xl"><p className="text-sm font-medium text-primary">{t("currentFinancialPosition")}</p><h1 className="mt-1 text-3xl font-bold tracking-tight">{t("moneyAtAGlance")}</h1><p className="mt-2 text-muted-foreground">{t("dashboardDescription")}</p></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("totalBalance")} value={formatCurrency(data.runningBalance)} icon={<DollarSign className="h-5 w-5" />} tone={data.runningBalance < 0 ? "text-rose-700" : "text-primary"} />
        <MetricCard label={t("monthlyIncome")} value={formatCurrency(data.income)} icon={<ArrowUpRight className="h-5 w-5" />} tone="text-emerald-700" />
        <MetricCard label={t("monthlyExpense")} value={formatCurrency(data.expense)} icon={<ArrowDownRight className="h-5 w-5" />} tone="text-rose-700" />
        <MetricCard label={t("monthlySavingRate")} value={`${data.savingRate}%`} icon={<TrendingUp className="h-5 w-5" />} tone={data.savingRate < 0 ? "text-rose-700" : "text-primary"} />
      </div>
      <AccountSummary />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card><CardHeader><CardTitle>Arus kas enam bulan</CardTitle><CardDescription>Bandingkan pemasukan dengan pengeluaran per bulan.</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={data.monthlyData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000000} jt`} /><Tooltip formatter={(value: number) => formatCurrency(value)} /><Bar dataKey="income" fill="#059669" name="Pemasukan" radius={[4, 4, 0, 0]} /><Bar dataKey="expense" fill="#e11d48" name="Pengeluaran" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader><CardTitle>Perkembangan saldo</CardTitle><CardDescription>Saldo kumulatif dari saldo awal dan seluruh arus kas.</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><AreaChart data={data.balanceHistory}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000000} jt`} /><Tooltip formatter={(value: number) => formatCurrency(value)} /><Area type="monotone" dataKey="balance" stroke="#0f766e" fill="#0f766e" fillOpacity={0.16} name="Saldo" /></AreaChart></ResponsiveContainer></CardContent></Card>
      </div>
    </div>
  )
}

function Reports({ data, loading, error }: { data: DashboardData | null; loading: boolean; error: string }) {
  const { formatCurrency, t } = useLanguage()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [reportData, setReportData] = useState<DashboardData | null>(data)

  useEffect(() => {
    async function loadReport() {
      const response = await fetch(`/api/dashboard?month=${selectedMonth}`)
      if (response.ok) setReportData(await response.json())
    }

    void loadReport()
  }, [selectedMonth])

  if (loading && !reportData) return <LoadingPanel />
  if (!reportData || error) return <ErrorPanel message={error} />

  const expenseData = Object.entries(reportData.expenseByCategory).map(([name, value], index) => ({ name, value, color: chartColors[index % chartColors.length] }))
  const incomeData = Object.entries(reportData.incomeBySource).map(([name, value], index) => ({ name, value, color: chartColors[index % chartColors.length] }))

  return <div className="space-y-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold tracking-tight">Laporan</h1><p className="mt-2 text-muted-foreground">Distribusi pemasukan dan pengeluaran untuk periode pilihan Anda.</p></div><Input type="month" aria-label="Pilih periode laporan" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="sm:w-48" /></div><div className="grid gap-4 xl:grid-cols-2"><DistributionCard title="Pengeluaran per kategori" description="Ke mana uang Anda digunakan." data={expenseData} emptyMessage="Belum ada pengeluaran dalam periode ini." /><DistributionCard title="Sumber pemasukan" description="Dari mana uang Anda datang." data={incomeData} emptyMessage="Belum ada pemasukan dalam periode ini." /></div>{reportData.insights.length > 0 && <Card><CardHeader><CardTitle>Insight perubahan</CardTitle><CardDescription>Perbandingan dengan bulan sebelumnya.</CardDescription></CardHeader><CardContent className="space-y-2">{reportData.insights.map((insight) => <p key={insight} className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">{insight}</p>)}</CardContent></Card>}<Card><CardHeader><CardTitle>Rincian pengeluaran</CardTitle></CardHeader><CardContent className="space-y-4">{expenseData.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada data untuk ditampilkan.</p> : expenseData.map((item) => <div key={item.name} className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} /><span className="font-medium">{item.name}</span></div><span className="font-semibold">{formatCurrency(item.value)}</span></div>)}</CardContent></Card></div>
}

function DistributionCard({ title, description, data, emptyMessage }: { title: string; description: string; data: Array<{ name: string; value: number; color: string }>; emptyMessage: string }) {
  const { formatCurrency } = useLanguage()
  return <Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent>{data.length === 0 ? <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">{emptyMessage}</div> : <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={92}>{data.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value: number) => formatCurrency(value)} /></PieChart></ResponsiveContainer>}</CardContent></Card>
}

function MetricCard({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: string }) {
  return <Card><CardContent className="p-4"><div className="flex items-center justify-between text-muted-foreground"><span className="text-sm">{label}</span>{icon}</div><p className={`mt-3 text-2xl font-bold tracking-tight ${tone}`}>{value}</p></CardContent></Card>
}

function LoadingPanel() {
  const { t } = useLanguage()
  return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">{t("loadingSummary")}</div>
}

function ErrorPanel({ message }: { message: string }) {
  const { t } = useLanguage()
  return <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-destructive">{message || t("dataUnavailable")}</div>
}
