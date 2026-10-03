import type { AccountType, TransactionType } from "@/lib/finance"

export type Account = {
  id: number
  name: string
  type: AccountType
  initialBalance: number
  description: string | null
}

export type AccountSummary = Account & {
  balance: number
}

export type Transaction = {
  id: number
  type: TransactionType
  amount: number
  category: string
  description: string | null
  date: string
  accountId: number
  destinationAccountId: number | null
}

export type Budget = {
  id: number
  category: string
  budget: number
  spent: number
  periodStart: string
  rolloverEnabled: boolean
  carryover?: number
  effectiveBudget?: number
}

export type DashboardData = {
  income: number
  expense: number
  runningBalance: number
  savingRate: number
  monthlyData: Array<{ month: string; income: number; expense: number; balance: number }>
  balanceHistory: Array<{ month: string; balance: number }>
  expenseByCategory: Record<string, number>
  incomeBySource: Record<string, number>
  insights: string[]
}
