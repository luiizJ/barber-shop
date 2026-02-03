import { db } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert"
import { Progress } from "@/app/components/ui/progress"
import { AlertTriangle, Crown, Info } from "lucide-react"
import { getPlanLimits } from "@/app/lib/plan-limits"
import { Button } from "@/app/components/ui/button"
import Link from "next/link"
import { ManageServiceDialog } from "./components/ManageServiceDialog"
import { ServiceItem } from "./components/ServiceItem"

export default async function ServicesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect("/")

  const shop = await db.barberShop.findFirst({
    where: { ownerId: session.user.id },
    include: {
      services: {
        orderBy: { name: "asc" },
      },
    },
  })

  if (!shop) return redirect("/dashboard")

  // Lógica do Plano
  const limits = getPlanLimits(shop.plan)
  const currentServices = shop.services.length
  const usagePercentage = (currentServices / limits.maxServices) * 100
  const isLimitReached = currentServices >= limits.maxServices
  const isPro = shop.plan === "PRO"

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      {/* 1. CABEÇALHO COM BOTÃO DE CRIAR */}
      <div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie o cardápio da sua barbearia.
          </p>
        </div>

        {/* O Dialog já cuida de renderizar o botão "Novo Serviço" */}
        {/* Se atingiu o limite e não é PRO, desabilita ou mostra aviso */}
        {!isPro && isLimitReached ? (
          <Button disabled variant="outline">
            Limite Atingido
          </Button>
        ) : (
          <ManageServiceDialog />
        )}
      </div>

      {/* 2. BARRA DE PROGRESSO DO PLANO (Se for Free) */}
      {!isPro && (
        <div className="bg-muted/30 space-y-3 rounded-xl border p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium">
              <Info className="text-primary h-4 w-4" />
              Uso do Plano Start
            </span>
            <span
              className={`${isLimitReached ? "font-bold text-red-500" : "text-muted-foreground"}`}
            >
              {currentServices} / {limits.maxServices} serviços
            </span>
          </div>

          <Progress value={usagePercentage} className="h-2" />

          {isLimitReached && (
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
      {shop.services.length === 0 ? (
        <div className="bg-muted/10 rounded-xl border-2 border-dashed py-20 text-center">
          <h3 className="text-lg font-semibold">Nenhum serviço cadastrado</h3>
          <p className="text-muted-foreground mt-1 mb-4 text-sm">
            Comece adicionando seu primeiro corte.
          </p>
          <ManageServiceDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shop.services.map((service) => (
            <ServiceItem
              key={service.id}
              service={{
                ...service,
                price: Number(service.price),
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
