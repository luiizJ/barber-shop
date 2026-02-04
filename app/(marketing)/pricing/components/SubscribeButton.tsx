"use client"

import { Button } from "@/app/components/ui/button"
import { signIn } from "next-auth/react"
import Link from "next/link"

interface SubscribeButtonProps {
  userId?: string
}

export function SubscribeButton({ userId }: SubscribeButtonProps) {
  if (userId) {
    return (
      <Link href="/dashboard" className="w-full">
        <Button className="w-full font-bold" size="lg" variant="secondary">
          Começar Teste Grátis 🚀
        </Button>
      </Link>
    )
  }

  return (
    <Button
      className="w-full font-bold"
      size="lg"
      variant="secondary"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
    >
      Começar Teste Grátis 🚀
    </Button>
  )
}
