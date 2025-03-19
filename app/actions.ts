"use server"

import { revalidatePath } from "next/cache"
import { supabase, type Transaction } from "@/lib/supabase"

// Use a fixed UUID for testing purposes
// In a real app, this would come from the authenticated user
const TEST_USER_UUID = "fddd076b-bf13-464c-bde1-bb6cdbea3dbc"

export async function getTransactions() {
  const { data, error } = await supabase.from("transactions").select("*").order("date", { ascending: false }).limit(10)

  if (error) {
    console.error("Error fetching transactions:", error)
    return []
  }

  return data as Transaction[]
}

export async function getFinancialSummary() {
  const { data: transactions, error } = await supabase.from("transactions").select("*")

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
  const { data, error } = await supabase.from("transactions").select("category, amount").eq("type", "expense")

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
    user_id: TEST_USER_UUID, // Using the fixed UUID
  })

  if (error) {
    console.error("Error adding transaction:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function getCategories(type?: "income" | "expense") {
  const query = supabase.from("categories").select("*")

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
  const name = formData.get("name") as string
  const type = formData.get("type") as "income" | "expense"

  if (!name || !type) {
    return { success: false, error: "Name and type are required" }
  }

  const { error } = await supabase.from("categories").insert({
    name,
    type,
    user_id: TEST_USER_UUID, // Using the fixed UUID instead of the string
  })

  if (error) {
    console.error("Error adding category:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

