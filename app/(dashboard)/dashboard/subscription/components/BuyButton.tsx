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
}

function SubmitButton({
  text,
  variant,
  isCurrent,
}: Omit<BuyButtonProps, "plan">) {
  const { pending } = useFormStatus()

  if (isCurrent) {
    return (
      <Button
        disabled
        variant="outline"
        className="w-full border-green-500 bg-green-50 text-green-600"
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
      disabled={pending}
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {text}
    </Button>
  )
}

export function BuyButton({ plan, text, variant, isCurrent }: BuyButtonProps) {
  // Bind cria uma nova função com o argumento 'plan' já preenchido
  const bindedAction = createCheckoutSession.bind(null, plan)

  return (
    <form action={bindedAction} className="w-full">
      <SubmitButton text={text} variant={variant} isCurrent={isCurrent} />
    </form>
  )
}
