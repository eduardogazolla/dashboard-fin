import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || " ",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || " ",
)

export type Transaction = {
  id: string
  description: string
  amount: number
  date: string
  category: string
  type: "income" | "expense"
  user_id: string
}

export type Category = {
  id: string
  name: string
  type: "income" | "expense"
  user_id: string
}

