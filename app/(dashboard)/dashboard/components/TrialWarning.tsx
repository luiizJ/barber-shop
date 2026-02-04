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
  // Se já é PRO ou o status do stripe está ativo e não é trial, não mostra nada
  if (plan === "PRO" || (stripeStatus && !trialEndsAt)) return null

  if (!trialEndsAt) return null

  const daysRemaining = differenceInDays(new Date(trialEndsAt), new Date())

  // Caso 1: Trial Expirado (Bloqueio)
  if (daysRemaining < 0) {
    return (
      <div className="mb-6 flex items-center justify-between rounded-r-lg border-l-4 border-red-500 bg-red-900/20 p-4">
        <div className="flex items-center gap-3">
          <Lock className="text-red-500" />
          <div>
            <h3 className="font-bold text-red-500">Teste Grátis Expirado</h3>
            <p className="text-sm text-red-200">
              Suas funcionalidades foram bloqueadas. Assine o PRO para
              continuar.
            </p>
          </div>
        </div>
        <Link href="/settings/billing">
          <Button variant="destructive" size="sm">
            Assinar Agora
          </Button>
        </Link>
      </div>
    )
  }

  // Caso 2: Trial Ativo (Aviso Amarelo)
  return (
    <div className="mb-6 flex items-center justify-between rounded-r-lg border-l-4 border-yellow-500 bg-yellow-900/20 p-4">
      <div className="flex items-center gap-3">
        <AlertTriangle className="text-yellow-500" />
        <div>
          <h3 className="font-bold text-yellow-500">
            Você tem {daysRemaining} dias restantes de teste
          </h3>
          <p className="text-sm text-yellow-200">
            Aproveite para cadastrar todos os seus serviços e clientes.
          </p>
        </div>
      </div>
      <Link href="/settings/billing">
        <Button
          variant="outline"
          className="border-yellow-500 text-yellow-500 hover:bg-yellow-900/50"
          size="sm"
        >
          Assinar Pro
        </Button>
      </Link>
    </div>
  )
}
