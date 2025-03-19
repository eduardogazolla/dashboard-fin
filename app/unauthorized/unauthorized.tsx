import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full max-w-[500px] flex-col justify-center space-y-6 p-4">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Acesso não autorizado</h1>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar este dashboard. Entre em contato com o administrador para solicitar
            acesso.
          </p>
        </div>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/login">Voltar para o login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

