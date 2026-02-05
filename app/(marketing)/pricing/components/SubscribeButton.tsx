"use client"

import { Button } from "@/app/components/ui/button"
import { signIn } from "next-auth/react"
import Link from "next/link"

interface SubscribeButtonProps {
  userId?: string
}

const SubscribeButton = ({ userId }: SubscribeButtonProps) => {
  if (userId) {
    return (
      <Link href="/dashboard" className="w-full">
        <Button className="w-full font-bold" size="lg" variant="secondary">
          Acessar meu Painel 🚀
        </Button>
      </Link>
    )
  }

  return (
    <Button
      className="w-full font-bold"
      size="lg"
      // 👇 AQUI ESTÁ A MÁGICA:
      // Chama o Google direto e manda voltar pro Dashboard
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
    >
      Começar Grátis
    </Button>
  )
}

export default SubscribeButton
