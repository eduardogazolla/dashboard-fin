import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { FinanceOverview } from "@/components/finance-overview"
import { RecentTransactions } from "@/components/recent-transactions"
import { ExpenseBreakdown } from "@/components/expense-breakdown"
import { BudgetProgress } from "@/components/budget-progress"
import { TransactionButtons } from "@/components/transaction-buttons"
import { getCategories } from "./actions"

export default async function Dashboard() {
  // Fetch categories for the transaction dialogs
  const incomeCategories = await getCategories("income")
  const expenseCategories = await getCategories("expense")

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          <TransactionButtons incomeCategories={incomeCategories} expenseCategories={expenseCategories} />
        </div>

        <Suspense fallback={<div>Loading financial overview...</div>}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FinanceOverview />
          </div>
        </Suspense>

        <div className="grid gap-6 mt-6 md:grid-cols-2">
          <Suspense fallback={<div>Loading expense breakdown...</div>}>
            <ExpenseBreakdown />
          </Suspense>
          <BudgetProgress />
        </div>

        <Suspense fallback={<div>Loading transactions...</div>}>
          <div className="mt-6">
            <RecentTransactions />
          </div>
        </Suspense>
      </main>
    </div>
  )
}

