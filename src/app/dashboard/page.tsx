"use client"

import { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Menu,
  RefreshCw,
} from "lucide-react"
import { AccountSummary } from "@/components/account-summary"
import { BudgetManager } from "@/components/budget-manager"
import { DebtManager } from "@/components/debt-manager"
import { GoalsManager } from "@/components/goals-manager"
import { PlanningManager } from "@/components/planning-manager"
import { InvestmentsManager } from "@/components/investments-manager"
import { NetWorth } from "@/components/net-worth"
import { FinancialCalendar } from "@/components/financial-calendar"
import { FinancialSimulation } from "@/components/financial-simulation"
import { SinkingFunds } from "@/components/sinking-funds"
import { ReportDistribution } from "@/components/report-distribution"
import { Sidebar, navigationItems } from "@/components/sidebar"
import { QuickGuide } from "@/components/quick-guide"
import { useLanguage } from "@/components/language-provider"
import { TransactionList } from "@/components/transaction-list"
import {
  EmptyState,
  ErrorNotice,
  Field,
  LoadingState,
  PageHeading,
} from "@/components/feedback"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getCurrentMonth } from "@/lib/finance"
import { useRemoteData } from "@/lib/use-remote-data"
import type { DashboardData } from "@/lib/types"

const chartColors = [
  "#0052ff",
  "#4771ff",
  "#d97706",
  "#be123c",
  "#7c3aed",
  "#475569",
]

export default function FinanceTracker() {
  const { locale, t } = useLanguage()
  const [tab, setTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useEffect(() => {
    const navigate = () => {
      const next = window.location.hash.slice(1)
      if (next === "main-content") return
      setTab(
        navigationItems.some((item) => item.key === next) ? next : "dashboard",
      )
    }
    navigate()
    window.addEventListener("hashchange", navigate)
    return () => window.removeEventListener("hashchange", navigate)
  }, [])
  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <a
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById("main-content")?.focus()
        }}
        className="sr-only z-[60] rounded bg-white p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t("skipToContent")}
      </a>
      <Sidebar
        activeTab={tab}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white/95 px-4 backdrop-blur-sm sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-muted md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label={t("openMenu")}
              aria-expanded={sidebarOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="truncate text-sm font-semibold">{t(tab)}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className="mr-3 hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
              <Calendar className="h-4 w-4" />
              {new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
                month: "long",
                year: "numeric",
                timeZone: "Asia/Jakarta",
              }).format(new Date())}
            </span>
            <QuickGuide />
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto max-w-[1440px] p-4 outline-none sm:p-7 lg:p-8"
        >
          {tab === "dashboard" && <Dashboard />}
          {tab === "transactions" && <TransactionList />}
          {tab === "budget" && <BudgetManager />}
          {tab === "goals" && <GoalsManager />}
          {tab === "debts" && <DebtManager />}
          {tab === "reports" && <Reports />}
          {tab === "planning" && <PlanningManager />}
          {tab === "investments" && <InvestmentsManager />}
          {tab === "netWorth" && <NetWorth />}
          {tab === "calendar" && <FinancialCalendar />}
          {tab === "simulation" && <FinancialSimulation />}
          {tab === "funds" && <SinkingFunds />}
        </main>
      </div>
    </div>
  )
}
function Dashboard() {
  const { locale, t, formatCurrency } = useLanguage()
  const records = useRemoteData<DashboardData>(
    "/api/dashboard?locale=" + locale,
  )
  const data = records.data
  return (
    <div className="space-y-6">
      <PageHeading
        title={t("moneyAtAGlance")}
        description={t("dashboardDescription")}
      >
        <Button
          variant="outline"
          onClick={records.reload}
          disabled={records.loading || records.refreshing}
        >
          <RefreshCw
            className={
              "h-4 w-4 " +
              (records.loading || records.refreshing ? "animate-spin" : "")
            }
          />
          {t(records.loading || records.refreshing ? "refreshing" : "refresh")}
        </Button>
        <Button asChild>
          <a href="#transactions">{t("addTransaction")}</a>
        </Button>
      </PageHeading>
      <ErrorNotice message={records.error} onRetry={records.reload} />
      {records.refreshing && (
        <p role="status" className="text-sm text-muted-foreground">
          {t("refreshing")}
        </p>
      )}
      {records.loading ? (
        <LoadingState />
      ) : (
        data && (
          <>
            <section
              aria-label={t("overview")}
              className="overflow-hidden rounded-xl border bg-white"
            >
              <div className="grid divide-y sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-4">
                <div className="bg-brand-soft p-5 sm:p-6">
                  <p className="text-sm text-brand-active">{t("totalBalance")}</p>
                  <p
                    className={
                      "mt-3 break-words text-3xl font-semibold tracking-tight tabular-nums " +
                      (data.runningBalance < 0
                        ? "text-rose-700"
                        : "text-foreground")
                    }
                  >
                    {formatCurrency(data.runningBalance)}
                  </p>
                  <p className="mt-3 text-xs text-brand-active">
                    {t("accountBalanceDescription")}
                  </p>
                </div>
                <Metric
                  label={t("monthlyIncome")}
                  amount={formatCurrency(data.income)}
                  icon={<ArrowDownLeft className="h-4 w-4" />}
                  tone="text-emerald-700"
                />
                <Metric
                  label={t("monthlyExpense")}
                  amount={formatCurrency(data.expense)}
                  icon={<ArrowUpRight className="h-4 w-4" />}
                  tone="text-rose-700"
                />
                <Metric
                  label={t("monthlySavingRate")}
                  amount={data.savingRate + "%"}
                  tone={
                    data.savingRate < 0 ? "text-rose-700" : "text-foreground"
                  }
                />
              </div>
            </section>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <a href="#transactions">{t("viewTransactions")}</a>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <a href="#budget">{t("viewBudget")}</a>
              </Button>
            </div>
            <AccountSummary />
            <Button asChild variant="outline">
              <a href="#netWorth">{t("viewNetWorth")}</a>
            </Button>
            <div className="grid gap-5 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("cashFlow")}</CardTitle>
                  <CardDescription>{t("cashFlowDescription")}</CardDescription>
                  <div className="mt-3 flex gap-4 text-xs">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-600" />
                      {t("income")}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-600" />
                      {t("expenses")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.monthlyData} accessibilityLayer>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                      />
                      <YAxis
                        width={48}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) =>
                          value / 1000000 + " " + t("shortMillion")
                        }
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Bar
                        isAnimationActive={false}
                        dataKey="income"
                        fill="#059669"
                        name={t("income")}
                        radius={[3, 3, 0, 0]}
                      />
                      <Bar
                        isAnimationActive={false}
                        dataKey="expense"
                        fill="#e11d48"
                        name={t("expenses")}
                        radius={[3, 3, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("balanceProgress")}</CardTitle>
                  <CardDescription>
                    {t("balanceProgressDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={282}>
                    <AreaChart data={data.balanceHistory} accessibilityLayer>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                      />
                      <YAxis
                        width={48}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) =>
                          value / 1000000 + " " + t("shortMillion")
                        }
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Area
                        isAnimationActive={false}
                        type="monotone"
                        dataKey="balance"
                        stroke="#0052ff"
                        fill="#0052ff"
                        fillOpacity={0.1}
                        name={t("balance")}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )
      )}
    </div>
  )
}
function Metric({
  label,
  amount,
  icon,
  tone,
}: {
  label: string
  amount: string
  icon?: React.ReactNode
  tone: string
}) {
  return (
    <div className="border-border p-5 sm:border-l sm:p-6">
      <p className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        {label}
        {icon}
      </p>
      <p
        className={
          "mt-3 break-words text-2xl font-semibold tracking-tight tabular-nums " +
          tone
        }
      >
        {amount}
      </p>
    </div>
  )
}

function Reports() {
  const { locale, formatCurrency, t } = useLanguage()
  const [month, setMonth] = useState(getCurrentMonth())
  const records = useRemoteData<DashboardData>(
    "/api/dashboard?month=" + month + "&locale=" + locale,
  )
  const data = records.data
  const expenses = Object.entries(data?.expenseByCategory ?? {}).map(
    ([name, value], index) => ({
      name: t(name),
      value,
      color: chartColors[index % chartColors.length],
    }),
  )
  const incomes = Object.entries(data?.incomeBySource ?? {}).map(
    ([name, value], index) => ({
      name: t(name),
      value,
      color: chartColors[index % chartColors.length],
    }),
  )
  return (
    <div className="space-y-6">
      <PageHeading
        title={t("reportsTitle")}
        description={t("reportsDescription")}
      >
        <Field id="report-month" label={t("period")}>
          <Input
            id="report-month"
            type="month"
            value={month}
            onChange={(event) => {
              if (event.target.value) setMonth(event.target.value)
            }}
          />
        </Field>
      </PageHeading>
      {records.error ? (
        <ErrorNotice message={records.error} onRetry={records.reload} />
      ) : records.loading ? (
        <LoadingState />
      ) : (
        data && (
          <>
            <div className="grid gap-5 xl:grid-cols-2">
              <ReportDistribution
                title={t("expensesByCategory")}
                description={t("expensesByCategoryDescription")}
                data={expenses}
                empty={t("noExpenseData")}
              />
              <ReportDistribution
                title={t("incomeSources")}
                description={t("incomeSourcesDescription")}
                data={incomes}
                empty={t("noIncomeData")}
              />
            </div>
            {data.insights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("changeInsights")}</CardTitle>
                  <CardDescription>
                    {t("previousMonthComparison")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.insights.map((insight) => (
                    <p
                      key={insight}
                      className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-3 text-sm text-amber-950"
                    >
                      {insight}
                    </p>
                  ))}
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle>{t("expenseBreakdown")}</CardTitle>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <EmptyState
                    title={t("noData")}
                    description={t("noExpenseData")}
                  />
                ) : (
                  expenses.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-3 border-b py-3 last:border-0"
                    >
                      <span className="flex items-center gap-3 text-sm">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                      </span>
                      <span className="text-sm font-semibold tabular-nums">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )
      )}
    </div>
  )
}
