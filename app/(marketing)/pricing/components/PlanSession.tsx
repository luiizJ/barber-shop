import { Button } from "@/app/components/ui/button"
import { FeatureItem } from "../utils/FeatureItem"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import SubscribeButton from "./SubscribeButton"

const PlanSection = async () => {
  const session = await getServerSession(authOptions)

  return (
    <section id="planos" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl">
            Planos transparentes
          </h2>
          <p className="text-lg text-zinc-400">
            Comece grátis. Evolua quando precisar.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl items-start gap-8 md:grid-cols-2">
          {/* PLANO START (TRIAL) */}
          <div className="shadow-primary/10 relative flex flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl transition-transform hover:scale-[1.02] md:p-8">
            <div className="bg-primary text-primary-foreground absolute top-0 right-0 rounded-bl-xl px-4 py-1.5 text-xs font-bold tracking-wider uppercase">
              Recomendado
            </div>
            <h3 className="mb-2 text-xl font-bold text-white md:text-2xl">
              Plano Start
            </h3>
            <div className="mb-4 text-4xl font-bold text-white md:mb-6 md:text-5xl">
              R$ 0
              <span className="ml-2 text-base font-normal text-zinc-500 md:text-lg">
                / 15 dias
              </span>
            </div>
            <p className="mb-6 text-sm text-zinc-400 md:mb-8 md:text-base">
              Ideal para testar e organizar sua barbearia hoje mesmo.
            </p>

            <ul className="mb-8 flex-1 space-y-4">
              <FeatureItem text="Agenda Ilimitada" />
              <FeatureItem text="Link de Agendamento (Seu Nome)" />
              <FeatureItem text="Gestão de Serviços e Preços" />
              <FeatureItem text="Dashboard Financeiro" />
              <FeatureItem text="Suporte Prioritário" />
            </ul>

            <div className="mt-auto">
              <SubscribeButton userId={session?.user?.id} />
              <p className="mt-4 text-center text-xs text-zinc-500">
                Depois, apenas R$ 29,90/mês. Cancele quando quiser.
              </p>
            </div>
          </div>

          {/* PLANO PRO (EM BREVE) */}
          <div className="relative flex flex-col rounded-3xl border border-zinc-800 bg-zinc-950/50 p-6 opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0 md:p-8">
            <h3 className="mb-2 text-xl font-bold text-white md:text-2xl">
              Plano Pro
            </h3>
            <div className="mb-4 text-4xl font-bold text-white md:mb-6 md:text-5xl">
              R$ 59,90
              <span className="ml-2 text-base font-normal text-zinc-500 md:text-lg">
                / mês
              </span>
            </div>
            <p className="mb-6 text-sm text-zinc-400 md:mb-8 md:text-base">
              Para quem quer escalar com múltiplos barbeiros.
            </p>

            <ul className="mb-8 flex-1 space-y-4">
              <FeatureItem text="Tudo do Plano Start" />
              <FeatureItem text="Múltiplos Profissionais" />
              <FeatureItem text="Lembretes Automáticos (WhatsApp)" />
              <FeatureItem text="Comissões Automáticas" />
              <FeatureItem text="Relatórios Avançados" />
            </ul>

            <div className="mt-auto">
              <Button
                className="h-12 w-full text-base"
                variant="outline"
                disabled
              >
                Em Breve
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
export default PlanSection
