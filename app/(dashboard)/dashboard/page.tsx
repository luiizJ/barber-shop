import { redirect } from "next/navigation"
import { getDashboardMetrics } from "./actions/get-dashboard-metrics"
import { DashboardKpi } from "./components/dashboard-kpi"
import { DashboardEmptyState } from "./components/dashboard-empty-state"
import { DashboardDateFilter } from "./components/DashboardDateFilter"
import { CreateShopDialog } from "./[slug]/components/CreateShopDialog"
import DashboardShopList from "./components/dashboard-shop-list"

//  Recebe os searchParams (parametro de URL)
export default async function DashboardRootPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const { range } = await searchParams

  // Passa o range escolhido para a busca de dados
  const data = await getDashboardMetrics(range)

  if (!data) return redirect("/")

  if (data.shops.length === 0) {
    return <DashboardEmptyState userName={data.userName} />
  }

  return (
    <div className="animate-in fade-in space-y-8 p-8 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Visão Geral</h2>
          <p className="text-muted-foreground">
            Resumo consolidado da performance da sua equipe.
          </p>
        </div>

        {/*  Controles: Filtro de Data + Botão de Criar */}
        <div className="flex items-center gap-2">
          <DashboardDateFilter />
          <CreateShopDialog />
        </div>
      </div>

      <DashboardKpi
        totalRevenue={data.totalRevenue}
        totalAppointments={data.totalAppointments}
        totalShops={data.shops.length}
        // 👇 Novos dados para o gráfico de tendência
        revenueChange={data.revenueChange}
        appointmentsChange={data.appointmentsChange}
        comparisonLabel={data.comparisonLabel}
      />

      <DashboardShopList shops={data.shops} />
    </div>
  )
}
