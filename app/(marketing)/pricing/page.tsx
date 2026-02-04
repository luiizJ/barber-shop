import { Check } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { SubscribeButton } from "./components/SubscribeButton"

export default async function PricingPage() {
  const session = await getServerSession(authOptions)

  // Se o cara já tem barbearia, não faz sentido ver preços, manda pro dashboard
  // (Você pode remover isso se quiser que ele veja para fazer upgrade)

  return (
    <div className="mx-auto max-w-7xl px-4 py-20">
      <div className="mb-16 text-center">
        <h1 className="from-primary mb-4 bg-linear-to-r to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
          Profissionalize sua Barbearia
        </h1>
        <p className="text-lg text-zinc-400">
          Comece grátis por 15 dias. Cancele a qualquer momento.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        {/* PLANO START (TRIAL) */}
        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="bg-primary/20 text-primary absolute top-0 right-0 rounded-bl-lg px-3 py-1 text-xs font-bold">
            RECOMENDADO PARA COMEÇAR
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Plano Start</h2>
          <div className="mb-6 text-4xl font-bold text-white">
            R$ 0{" "}
            <span className="text-lg font-normal text-zinc-500">/ 15 dias</span>
          </div>
          <p className="mb-8 text-zinc-400">
            Teste todas as funcionalidades essenciais sem pagar nada.
          </p>

          <ul className="mb-8 flex-1 space-y-4">
            <FeatureItem text="Agenda Ilimitada" />
            <FeatureItem text="Link de Agendamento Personalizado" />
            <FeatureItem text="Gestão de Serviços" />
            <FeatureItem text="Dashboard Financeiro Básico" />
          </ul>

          <SubscribeButton userId={session?.user?.id} />
          <p className="mt-4 text-center text-xs text-zinc-500">
            Após 15 dias, apenas R$ 29,90/mês
          </p>
        </div>

        {/* PLANO PRO (FUTURO) */}
        <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-8 opacity-60 transition-opacity hover:opacity-100">
          <h2 className="mb-2 text-2xl font-bold text-white">Plano Pro</h2>
          <div className="mb-6 text-4xl font-bold text-white">
            R$ 59,90{" "}
            <span className="text-lg font-normal text-zinc-500">/ mês</span>
          </div>
          <p className="mb-8 text-zinc-400">
            Para barbearias que querem escalar e fidelizar clientes.
          </p>

          <ul className="mb-8 flex-1 space-y-4">
            <FeatureItem text="Tudo do Plano Start" />
            <FeatureItem text="Lembretes via WhatsApp (API)" />
            <FeatureItem text="Múltiplos Barbeiros" />
            <FeatureItem text="Relatórios Avançados" />
          </ul>

          <Button className="w-full" variant="outline" disabled>
            Em Breve
          </Button>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-primary/20 rounded-full p-1">
        <Check size={14} className="text-primary" />
      </div>
      <span className="text-sm text-zinc-300">{text}</span>
    </div>
  )
}
