"use client"

import { Button } from "@/app/components/ui/button"
import { createCheckoutSession } from "@/app/actions/stripe-actions"
import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"

interface BuyButtonProps {
  plan: "START" | "PRO"
  text: string
  variant?: "default" | "outline" | "secondary" | "destructive"
  isCurrent?: boolean
  disabled?: boolean // 👈 Recebemos o bloqueio aqui
}

// O botão interno que sabe se o form está enviando
function SubmitButton({
  text,
  variant,
  isCurrent,
  disabled, // 👈 Recebemos aqui também
}: Omit<BuyButtonProps, "plan">) {
  const { pending } = useFormStatus()

  // Se for o plano atual, mostramos o botão verde fixo
  if (isCurrent) {
    return (
      <Button
        disabled
        variant="outline"
        className="w-full border-green-500 bg-green-50 text-green-600 opacity-100"
      >
        Plano Atual
      </Button>
    )
  }

  return (
    <Button
      type="submit"
      variant={variant || "default"}
      className="w-full font-bold"
      // 👇 O botão fica desativado se estiver carregando (pending) OU se a gente mandou bloquear (disabled)
      disabled={pending || disabled}
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {text}
    </Button>
  )
}

export function BuyButton({
  plan,
  text,
  variant,
  isCurrent,
  disabled,
}: BuyButtonProps) {
  // Prepara a Server Action com o argumento do plano
  const bindedAction = createCheckoutSession.bind(null, plan)

  return (
    <form action={bindedAction} className="w-full">
      <SubmitButton
        text={text}
        variant={variant}
        isCurrent={isCurrent}
        disabled={disabled}
      />
    </form>
  )
}
