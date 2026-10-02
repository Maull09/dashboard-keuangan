"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Account } from "@/lib/types"

export function GoalsManager() {
  const [goals, setGoals] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [contributionAccountId, setContributionAccountId] = useState("")

  // Fetch goals dari API
  const fetchGoals = () => {
    fetch("/api/goals")
      .then((res) => res.json())
      .then(setGoals)
  }

  useEffect(() => {
    fetchGoals()
    fetch("/api/accounts").then((res) => res.json()).then(setAccounts)
  }, [])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date))

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date()
    const diffTime = new Date(targetDate).getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getGoalStatus = (current: number, target: number, targetDate: string) => {
    const percentage = (current / target) * 100
    const daysRemaining = getDaysRemaining(targetDate)
    if (percentage >= 100) return { status: "completed", color: "text-green-600" }
    if (daysRemaining < 0) return { status: "overdue", color: "text-red-600" }
    if (daysRemaining < 30) return { status: "urgent", color: "text-yellow-600" }
    return { status: "on-track", color: "text-blue-600" }
  }

  // Tambah goal ke database
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        targetAmount: Number(targetAmount),
        currentAmount: 0,
        targetDate,
        category: "other",
      }),
    })
    setLoading(false)
    if (res.ok) {
      fetchGoals()
      setTitle("")
      setDescription("")
      setTargetAmount("")
      setTargetDate("")
      setOpen(false)
    } else {
      alert("Gagal menambah tujuan")
    }
  }

  // Tambah kontribusi ke goal (update currentAmount)
  const handleAddContribution = async (goalId: number, amount: number) => {
    if (!contributionAccountId) {
      alert("Pilih akun sumber kontribusi terlebih dahulu")
      return
    }
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return
    const allowedAmount = Math.min(amount, goal.targetAmount - goal.currentAmount)
    const res = await fetch(`/api/goals/${goalId}/contributions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: allowedAmount, accountId: Number(contributionAccountId) }),
    })
    if (res.ok) {
      fetchGoals()
      window.dispatchEvent(new Event("finance-data-changed"))
    }
    else alert("Gagal update kontribusi")
  }

  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const completedGoals = goals.filter((goal) => goal.currentAmount >= goal.targetAmount).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tujuan Keuangan</h2>
          <p className="text-muted-foreground">Tetapkan dan lacak pencapaian tujuan keuangan Anda</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <span className="font-bold text-lg mr-2">+</span> Tambah Tujuan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Tujuan Keuangan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Nama Tujuan</Label>
                <Input
                  id="title"
                  placeholder="Contoh: Dana Darurat"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  placeholder="Deskripsi tujuan keuangan"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Jumlah</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder="0"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Tanggal</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="max-w-sm"><Select value={contributionAccountId} onValueChange={setContributionAccountId}><SelectTrigger><SelectValue placeholder="Pilih akun sumber kontribusi" /></SelectTrigger><SelectContent>{accounts.map((account) => <SelectItem key={account.id} value={String(account.id)}>{account.name}</SelectItem>)}</SelectContent></Select><p className="mt-2 text-sm text-muted-foreground">Kontribusi dicatat sebagai alokasi dari akun ini; saldo akun tidak berkurang.</p></div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tujuan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tujuan Tercapai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalTargetAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Terkumpul</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalCurrentAmount)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="grid gap-4">
        {goals.map((goal) => {
          const percentage = (goal.currentAmount / goal.targetAmount) * 100
          const daysRemaining = getDaysRemaining(goal.targetDate)
          const { status, color } = getGoalStatus(goal.currentAmount, goal.targetAmount, goal.targetDate)

          return (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{goal.title}</CardTitle>
                    <CardDescription>{goal.description}</CardDescription>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      status === "completed"
                        ? "bg-green-100 text-green-800"
                        : status === "overdue"
                        ? "bg-red-100 text-red-800"
                        : status === "urgent"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {status === "completed"
                      ? "Tercapai"
                      : status === "overdue"
                      ? "Terlambat"
                      : status === "urgent"
                      ? "Mendesak"
                      : "Berjalan"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Progress</div>
                    <div className="font-semibold">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Target Tanggal</div>
                    <div className="font-semibold">{formatDate(goal.targetDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Sisa Waktu</div>
                    <div className={`font-semibold ${color}`}>
                      {daysRemaining > 0 ? `${daysRemaining} hari` : daysRemaining === 0 ? "Hari ini" : "Terlambat"}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress: {percentage.toFixed(1)}%</span>
                    <span>Sisa: {formatCurrency(goal.targetAmount - goal.currentAmount)}</span>
                  </div>
                  <Progress value={Math.min(percentage, 100)} className="h-2" />
                </div>
                {percentage < 100 && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleAddContribution(goal.id, 100000)}>
                      +100K
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAddContribution(goal.id, 500000)}>
                      +500K
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAddContribution(goal.id, 1000000)}>
                      +1M
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {goals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-2">
              <div className="text-4xl text-gray-300">🎯</div>
              <h3 className="text-lg font-semibold">Belum ada tujuan keuangan</h3>
              <p className="text-muted-foreground">Mulai dengan menetapkan tujuan keuangan pertama Anda</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
