import Link from "next/link"
import { Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { getUser } from "@/lib/auth"

export async function DashboardHeader() {
  const user = await getUser()

  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="font-semibold text-lg">
          FinTrack
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notificações</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Configurações</span>
          </Button>
          {user && <UserNav user={user} />}
        </nav>
      </div>
    </header>
  )
}

