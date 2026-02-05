"use client"

import { Button } from "@/app/components/ui/button"
import Link from "next/link"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

const HeroSection = () => {
  const { data: session } = useSession()
  const router = useRouter()

  const handleLoginClick = () => {
    if (session?.user) {
      router.push("/dashboard")
    } else {
      signIn("google", { callbackUrl: "/dashboard" })
    }
  }

  return (
    <section className="relative overflow-hidden px-4 pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">
      <div className="container mx-auto max-w-5xl text-center">
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Aposente a agenda de papel da sua{" "}
          <span className="from-primary bg-linear-to-r to-purple-400 bg-clip-text text-transparent">
            Barbearia
          </span>
          .
        </h1>
        <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg sm:text-xl md:text-2xl">
          Agendamento online 24h, gestão financeira automática e fidelização de
          clientes. Tudo no seu bolso.
        </p>

        <div className="flex w-full flex-col justify-center gap-4 px-4 sm:w-auto sm:flex-row">
          {/* BOTÃO 1: Começar Grátis -> Rola a tela até os Planos */}
          <Link href="#planos" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="h-14 w-full px-8 text-lg font-bold sm:w-auto"
            >
              Começar Grátis
            </Button>
          </Link>

          {/* BOTÃO 2: Já tenho conta -> Login Inteligente */}
          {/* Removemos o <Link href="/login"> pois ele dava erro 404 */}
          <Button
            variant="outline"
            size="lg"
            className="h-14 w-full px-8 text-lg sm:w-auto"
            onClick={handleLoginClick} // 👈 A mágica acontece aqui
          >
            Já tenho conta
          </Button>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
