"use client"

import { Button } from "@/app/components/ui/button"
import { AlertTriangle, Lock } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface ShopGuardProps {
  children: React.ReactNode
  hasAccess: boolean
  slug: string
}

export function ShopGuard({ children, hasAccess, slug }: ShopGuardProps) {
  const pathname = usePathname()

  // Verifica se o usuário já está na página de assinatura
  const isSubscriptionPage = pathname.includes("/subscription")

  // CENÁRIO 1: Usuário pagou ou está no período grátis
  if (hasAccess) {
    return <>{children}</>
  }

  // CENÁRIO 2: Usuário NÃO pagou, mas está tentando acessar a página de pagar
  // (Deixamos ele passar para poder pagar)
  if (isSubscriptionPage) {
    return <>{children}</>
  }

  // CENÁRIO 3: Usuário NÃO pagou e está tentando ver Agenda/Serviços
  // (Mostramos a tela de bloqueio igual ao seu print)
  return (
    <div className="animate-in fade-in flex h-[80vh] flex-col items-center justify-center text-center duration-500">
      <div className="mb-6 rounded-full bg-red-500/10 p-4 ring-1 ring-red-500/30">
        <Lock className="h-12 w-12 text-red-500" />
      </div>

      <h2 className="mb-2 text-2xl font-bold text-red-500">Acesso Bloqueado</h2>

      <p className="text-muted-foreground mb-8 max-w-md">
        Sua assinatura está inativa ou o período de testes acabou. Para
        continuar gerenciando sua barbearia, regularize seu plano.
      </p>

      <Button
        asChild
        size="lg"
        className="bg-red-600 font-bold hover:bg-red-700"
      >
        <Link href={`/dashboard/${slug}/subscription`}>
          Regularizar Pagamento
        </Link>
      </Button>
    </div>
  )
}
