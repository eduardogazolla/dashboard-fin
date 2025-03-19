"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { supabase, type Transaction } from "@/lib/supabase"
import { createServerClient, getUser, isUserAuthorized } from "@/lib/auth"

export async function getTransactions() {
  // Get the current user
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is authorized
  const authorized = await isUserAuthorized(user.id)

  if (!authorized) {
    return []
  }

  // Get authorized users to show their transactions
  const authorizedUsers = await getAuthorizedUsers()

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .in("user_id", authorizedUsers)
    .order("date", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Error fetching transactions:", error)
    return []
  }

  return data as Transaction[]
}

export async function getFinancialSummary() {
  // Get the current user
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is authorized
  const authorized = await isUserAuthorized(user.id)

  if (!authorized) {
    return {
      balance: 0,
      income: 0,
      expenses: 0,
      savings: 0,
    }
  }

  // Get authorized users to show their transactions
  const authorizedUsers = await getAuthorizedUsers()

  const { data: transactions, error } = await supabase.from("transactions").select("*").in("user_id", authorizedUsers)

  if (error) {
    console.error("Error fetching financial summary:", error)
    return {
      balance: 0,
      income: 0,
      expenses: 0,
      savings: 0,
    }
  }

  const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const expenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return {
    balance: income - expenses,
    income,
    expenses,
    savings: income * 0.1, // Example: 10% of income goes to savings
  }
}

export async function getExpenseBreakdown() {
  // Get the current user
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is authorized
  const authorized = await isUserAuthorized(user.id)

  if (!authorized) {
    return []
  }

  // Get authorized users to show their transactions
  const authorizedUsers = await getAuthorizedUsers()

  const { data, error } = await supabase
    .from("transactions")
    .select("category, amount")
    .eq("type", "expense")
    .in("user_id", authorizedUsers)

  if (error) {
    console.error("Error fetching expense breakdown:", error)
    return []
  }

  // Group expenses by category
  const categories: Record<string, number> = {}
  data.forEach((transaction) => {
    const category = transaction.category
    if (!categories[category]) {
      categories[category] = 0
    }
    categories[category] += Math.abs(transaction.amount)
  })

  // Convert to array format for chart
  return Object.entries(categories).map(([label, value]) => ({
    label,
    value,
  }))
}

export async function addTransaction(formData: FormData) {
  // Get the current user
  const user = await getUser()

  if (!user) {
    return { success: false, error: "Usuário não autenticado" }
  }

  // Check if user is authorized
  const authorized = await isUserAuthorized(user.id)

  if (!authorized) {
    return { success: false, error: "Usuário não autorizado" }
  }

  const description = formData.get("description") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const category = formData.get("category") as string
  const type = formData.get("type") as "income" | "expense"
  const date = new Date().toISOString()

  // For expenses, store amount as negative
  const finalAmount = type === "expense" ? -Math.abs(amount) : amount

  const { error } = await supabase.from("transactions").insert({
    description,
    amount: finalAmount,
    category,
    date,
    type,
    user_id: user.id, // Use the current user's ID
  })

  if (error) {
    console.error("Error adding transaction:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function getCategories(type?: "income" | "expense") {
  // Get the current user
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is authorized
  const authorized = await isUserAuthorized(user.id)

  if (!authorized) {
    return []
  }

  // Get authorized users to show their categories
  const authorizedUsers = await getAuthorizedUsers()

  const query = supabase.from("categories").select("*").in("user_id", authorizedUsers)

  if (type) {
    query.eq("type", type)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data
}

export async function addCategory(formData: FormData) {
  // Get the current user
  const user = await getUser()

  if (!user) {
    return { success: false, error: "Usuário não autenticado" }
  }

  // Check if user is authorized
  const authorized = await isUserAuthorized(user.id)

  if (!authorized) {
    return { success: false, error: "Usuário não autorizado" }
  }

  const name = formData.get("name") as string
  const type = formData.get("type") as "income" | "expense"

  if (!name || !type) {
    return { success: false, error: "Nome e tipo são obrigatórios" }
  }

  const { error } = await supabase.from("categories").insert({
    name,
    type,
    user_id: user.id, // Use the current user's ID
  })

  if (error) {
    console.error("Error adding category:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function getMonthlyData(year: number) {
  // Get the current user
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is authorized
  const authorized = await isUserAuthorized(user.id)

  if (!authorized) {
    return []
  }

  // Get authorized users to show their transactions
  const authorizedUsers = await getAuthorizedUsers()

  // Example months
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  // Get data from Supabase
  const startDate = new Date(year, 0, 1).toISOString()
  const endDate = new Date(year, 11, 31).toISOString()

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .in("user_id", authorizedUsers)
    .gte("date", startDate)
    .lte("date", endDate)

  if (error) {
    console.error("Error fetching monthly data:", error)
    return []
  }

  // Process data by month
  const monthlyData = months.map((month, index) => {
    const monthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() === index
    })

    const income = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const expenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return {
      month,
      income,
      expenses,
    }
  })

  return monthlyData
}

export async function getSpendingTrends(period: string, category = "all") {
  // Get the current user
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is authorized
  const authorized = await isUserAuthorized(user.id)

  if (!authorized) {
    return []
  }

  // Get authorized users to show their transactions
  const authorizedUsers = await getAuthorizedUsers()

  // Calculate date range based on period
  const endDate = new Date()
  const startDate = new Date()

  switch (period) {
    case "30days":
      startDate.setDate(startDate.getDate() - 30)
      break
    case "3months":
      startDate.setMonth(startDate.getMonth() - 3)
      break
    case "6months":
      startDate.setMonth(startDate.getMonth() - 6)
      break
    case "1year":
      startDate.setFullYear(startDate.getFullYear() - 1)
      break
    default:
      startDate.setMonth(startDate.getMonth() - 6) // Default to 6 months
  }

  // Get data from Supabase
  let query = supabase
    .from("transactions")
    .select("*")
    .in("user_id", authorizedUsers)
    .eq("type", "expense")
    .gte("date", startDate.toISOString())
    .lte("date", endDate.toISOString())

  if (category !== "all") {
    query = query.eq("category", category)
  }

  const { data: transactions, error } = await query

  if (error) {
    console.error("Error fetching trend data:", error)
    return []
  }

  // Group by date (daily, weekly, or monthly depending on period)
  const groupedData: Record<string, number> = {}

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date)
    let key: string

    if (period === "30days") {
      // Daily for 30 days
      key = date.toISOString().split("T")[0]
    } else if (period === "3months") {
      // Weekly for 3 months
      const weekNumber = Math.floor(date.getDate() / 7)
      key = `${date.getFullYear()}-${date.getMonth() + 1}-W${weekNumber}`
    } else {
      // Monthly for 6 months or 1 year
      key = `${date.getFullYear()}-${date.getMonth() + 1}`
    }

    if (!groupedData[key]) {
      groupedData[key] = 0
    }

    groupedData[key] += Math.abs(transaction.amount)
  })

  // Convert to array and sort by date
  const trendData = Object.entries(groupedData)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return trendData
}

export async function getBudgetComparison(month: number, year: number) {
  // Get the current user
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is authorized
  const authorized = await isUserAuthorized(user.id)

  if (!authorized) {
    return []
  }

  // Get authorized users to show their transactions
  const authorizedUsers = await getAuthorizedUsers()

  // Get data from Supabase
  const startDate = new Date(year, month, 1).toISOString()
  const endDate = new Date(year, month + 1, 0).toISOString()

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .in("user_id", authorizedUsers)
    .eq("type", "expense")
    .gte("date", startDate)
    .lte("date", endDate)

  if (error) {
    console.error("Error fetching budget data:", error)
    return []
  }

  // Example budget data (in a real app, this would come from a budget table)
  const budgets = [
    { category: "Housing", budget: 1200 },
    { category: "Food", budget: 500 },
    { category: "Transportation", budget: 300 },
    { category: "Entertainment", budget: 200 },
    { category: "Utilities", budget: 200 },
  ]

  // Calculate actual spending by category
  const actualByCategory: Record<string, number> = {}

  transactions.forEach((transaction) => {
    if (!actualByCategory[transaction.category]) {
      actualByCategory[transaction.category] = 0
    }

    actualByCategory[transaction.category] += Math.abs(transaction.amount)
  })

  // Combine budget and actual data
  const budgetData = budgets.map((budget) => ({
    category: budget.category,
    budget: budget.budget,
    actual: actualByCategory[budget.category] || 0,
  }))

  return budgetData
}

// Helper function to get authorized users
async function getAuthorizedUsers() {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("authorized_users").select("user_id")

  if (error) {
    console.error("Error fetching authorized users:", error)
    return []
  }

  return data.map((item) => item.user_id)
}

