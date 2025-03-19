"use client"

import { useEffect, useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, CreditCard } from "lucide-react"
import { getFinancialSummary } from "@/app/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function FinanceOverview() {
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await getFinancialSummary()
        setSummary(data)
      } catch (error) {
        console.error("Failed to load financial summary:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSummary()
  }, [])

  if (loading) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-6 w-24 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-muted rounded mt-2 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summary.balance.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Updated just now</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Income</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summary.income.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Total income this month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summary.expenses.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Total expenses this month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Savings</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summary.savings.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">10% of your income</p>
        </CardContent>
      </Card>
    </>
  )
}

