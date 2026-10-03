import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import {
  recurringTransactions,
  debts,
  debtPayments,
  sinkingFunds,
} from "@/db/schema"
import { financeResponse } from "@/lib/api-response"
import { FinanceError } from "@/lib/finance-errors"
import { isMonth, getNextMonthStart } from "@/lib/finance"
import { scheduleOccurrences } from "@/lib/planning"

export async function GET(request: NextRequest) {
  return financeResponse(async () => {
    const month = new URL(request.url).searchParams.get("month")
    if (
      !isMonth(month) ||
      Number(month.slice(0, 4)) < 1900 ||
      Number(month.slice(0, 4)) > 2100
    )
      throw new FinanceError("invalidInput")
    const from = month + "-01"
    const end = new Date(getNextMonthStart(month) + "T00:00:00Z")
    end.setUTCDate(end.getUTCDate() - 1)
    const to = end.toISOString().slice(0, 10)
    const [schedules, obligations, payments, funds] = await Promise.all([
      db.select().from(recurringTransactions),
      db.select().from(debts),
      db.select().from(debtPayments),
      db.select().from(sinkingFunds),
    ])
    const events: Array<{
      id: string
      name: string
      type: string
      amount: number
      date: string
      source: string
    }> = schedules.flatMap((schedule) =>
      scheduleOccurrences(schedule, from, to).map((item) => ({
        ...item,
        id: `schedule-${item.scheduleId}-${item.date}`,
        source: "recurring",
      })),
    )
    for (const debt of obligations) {
      const remaining =
        debt.amount -
        payments
          .filter((payment) => payment.debtId === debt.id)
          .reduce((total, payment) => total + payment.amount, 0)
      if (
        debt.dueDate &&
        debt.dueDate >= from &&
        debt.dueDate <= to &&
        remaining > 0
      )
        events.push({
          id: `debt-${debt.id}`,
          name: debt.name,
          type: debt.type === "utang" ? "debtDue" : "receivableDue",
          amount: remaining,
          date: debt.dueDate,
          source: "debts",
        })
    }
    for (const fund of funds)
      if (fund.targetDate >= from && fund.targetDate <= to)
        events.push({
          id: `fund-${fund.id}`,
          name: fund.name,
          type: "fundDue",
          amount: fund.targetAmount,
          date: fund.targetDate,
          source: "funds",
        })
    return NextResponse.json({
      month,
      events: events.sort(
        (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
      ),
    })
  })
}
