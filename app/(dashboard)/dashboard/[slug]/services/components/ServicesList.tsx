import { ManageServiceDialog } from "./ManageServiceDialog"
import { AlertTriangle, Info } from "lucide-react"
import { Progress } from "@/app/components/ui/progress"
import { Button } from "@/app/components/ui/button"
import Link from "next/link"
import { Prisma } from "@prisma/client"
import ServiceItem from "./ServiceItem"

// Tipo "Sanitizado" (Preço já é number)
type SanitizedService = Omit<Prisma.BarberServicesGetPayload<{}>, "price"> & {
  price: number
}

interface ServicesListProps {
  services: SanitizedService[]
  plan: {
    isPro: boolean
    currentUsage: number
    maxLimit: number
    percentage: number
    isLimitReached: boolean
  }
  shopId: string
}

const ServicesList = ({ services, plan, shopId }: ServicesListProps) => {
  return (
    <div className="space-y-6">
      {/* 1. CABEÇALHO DA LISTA */}
      <div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie o cardápio da sua barbearia.
          </p>
        </div>

        {/* Botão Novo Serviço (Respeitando Limite) */}
        {!plan.isPro && plan.isLimitReached ? (
          <Button disabled variant="outline">
            Limite Atingido
          </Button>
        ) : (
          <ManageServiceDialog shopId={shopId} />
        )}
      </div>

      {/* 2. BARRA DE PROGRESSO DO PLANO (Se for Free) */}
      {!plan.isPro && (
        <div className="bg-muted/30 space-y-3 rounded-xl border p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium">
              <Info className="text-primary h-4 w-4" />
              Uso do Plano Start
            </span>
            <span
              className={`${plan.isLimitReached ? "font-bold text-red-500" : "text-muted-foreground"}`}
            >
              {plan.currentUsage} / {plan.maxLimit} serviços
            </span>
          </div>

          <Progress value={plan.percentage} className="h-2" />

          {plan.isLimitReached && (
            <div className="flex items-center justify-between rounded-md bg-yellow-500/10 p-3 text-xs text-yellow-600 sm:text-sm">
              <span className="flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4" />
                Você atingiu o limite do plano grátis.
              </span>
              <Link
                href="/dashboard/subscription"
                className="underline hover:text-yellow-700"
              >
                Virar PRO ⚡
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 3. GRID DE SERVIÇOS */}
      {services.length === 0 ? (
        <div className="bg-muted/10 rounded-xl border-2 border-dashed py-20 text-center">
          <h3 className="text-lg font-semibold">Nenhum serviço cadastrado</h3>
          <p className="text-muted-foreground mt-1 mb-4 text-sm">
            Comece adicionando seu primeiro corte.
          </p>
          <ManageServiceDialog shopId={shopId} />
        </div>
      ) : (
        // Grid Responsivo
        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <ServiceItem
              key={service.id}
              service={service} // Já vem como number da action
            />
          ))}
        </div>
      )}
    </div>
  )
}
export default ServicesList
