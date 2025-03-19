import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { getSession } from "@/lib/auth"

export default async function LoginPage() {
  const session = await getSession()

  // If the user is already logged in, redirect to the dashboard
  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Entrar na conta</h1>
          <p className="text-sm text-muted-foreground">Entre com seu email e senha para acessar o dashboard</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

