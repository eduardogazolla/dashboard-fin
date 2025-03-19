import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

// Create a single supabase client for interacting with your database
export const createServerClient = cache(() => {
  const cookieStore = cookies()

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
    },
  })
})

export async function getSession() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

export async function getUser() {
  const session = await getSession()

  if (!session) {
    return null
  }

  return session.user
}

export async function requireUser() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  return user
}

export async function getUserById(userId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  return data
}

export async function getAuthorizedUsers() {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("authorized_users").select("user_id")

  if (error) {
    console.error("Error fetching authorized users:", error)
    return []
  }

  return data.map((item) => item.user_id)
}

export async function isUserAuthorized(userId: string) {
  const authorizedUsers = await getAuthorizedUsers()
  return authorizedUsers.includes(userId)
}

