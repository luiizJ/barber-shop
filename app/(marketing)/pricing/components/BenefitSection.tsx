import {
  CalendarDays,
  Check,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Users,
} from "lucide-react"
import { FeatureCard } from "../utils/FeatureItem"

const BenefitSection = () => {
  return (
    <section className="border-y border-zinc-800 bg-zinc-900/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
            Feito para quem corta cabelo
          </h2>
          <p className="text-muted-foreground text-lg">
            Funcionalidades essenciais para você focar no corte, não na gestão.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Smartphone className="text-primary h-8 w-8" />}
            title="100% Mobile"
            description="Gerencie sua barbearia de qualquer lugar, direto pelo celular. Sem computador."
          />
          <FeatureCard
            icon={<CalendarDays className="text-primary h-8 w-8" />}
            title="Agenda Automática"
            description="Link exclusivo para seus clientes agendarem sozinhos, sem te interromper."
          />
          <FeatureCard
            icon={<TrendingUp className="text-primary h-8 w-8" />}
            title="Financeiro Simples"
            description="Saiba seu faturamento diário e mensal em tempo real. Adeus caderninho."
          />
          <FeatureCard
            icon={<Users className="text-primary h-8 w-8" />}
            title="Gestão de Clientes"
            description="Histórico de cortes e dados dos clientes para um atendimento VIP."
          />
          <FeatureCard
            icon={<ShieldCheck className="text-primary h-8 w-8" />}
            title="Segurança Total"
            description="Seus dados salvos na nuvem. Se perder o celular, não perde a agenda."
          />
          <FeatureCard
            icon={<Check className="text-primary h-8 w-8" />}
            title="Fácil de Usar"
            description="Interface limpa e intuitiva. Criada para quem não gosta de sistemas complicados."
          />
        </div>
      </div>
    </section>
  )
}
export default BenefitSection
