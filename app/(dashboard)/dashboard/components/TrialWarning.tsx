"use client"

import { differenceInDays } from "date-fns"
import Link from "next/link"
import { AlertTriangle, Lock } from "lucide-react"
import { Button } from "@/app/components/ui/button"

interface TrialWarningProps {
  trialEndsAt?: Date | null
  stripeStatus?: boolean
  plan: string
}

export function TrialWarning({
  trialEndsAt,
  stripeStatus,
  plan,
}: TrialWarningProps) {
  // Se é PRO e tá pago, ou se é Start e tá pago (sem trial), some.
  if (plan === "PRO" && stripeStatus) return null
  if (stripeStatus && !trialEndsAt) return null
  if (!trialEndsAt) return null

  const daysRemaining = differenceInDays(new Date(trialEndsAt), new Date())

  // Bloqueado
  if (daysRemaining < 0 && !stripeStatus) {
    return (
      <div className="mb-6 flex items-center justify-between rounded-r-lg border-l-4 border-red-500 bg-red-900/20 p-4">
        <div className="flex items-center gap-3">
          <Lock className="text-red-500" />
          <div>
            <h3 className="font-bold text-red-500">Teste Grátis Expirado</h3>
            <p className="text-sm text-red-200">
              Funcionalidades bloqueadas. Assine para continuar.
            </p>
          </div>
        </div>
        {/* 👇 LINK CORRIGIDO PARA /dashboard/subscription */}
        <Link href="/dashboard/subscription">
          <Button variant="destructive" size="sm">
            Assinar Agora
          </Button>
        </Link>
      </div>
    )
  }

  // Aviso Amarelo (Falta pouco)
  if (daysRemaining >= 0 && !stripeStatus) {
    return (
      <div className="mb-6 flex items-center justify-between rounded-r-lg border-l-4 border-yellow-500 bg-yellow-900/20 p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-yellow-500" />
          <div>
            <h3 className="font-bold text-yellow-500">
              {daysRemaining} dias restantes de teste
            </h3>
            <p className="text-sm text-yellow-200">
              Aproveite para testar tudo.
            </p>
          </div>
        </div>
        {/* 👇 LINK CORRIGIDO PARA /dashboard/subscription */}
        <Link href="/dashboard/subscription">
          <Button
            variant="outline"
            className="border-yellow-500 text-yellow-500"
            size="sm"
          >
            Assinar Pro
          </Button>
        </Link>
      </div>
    )
  }

  return null
}
