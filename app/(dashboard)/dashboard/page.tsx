import { redirect } from "next/navigation"
import { getDashboardMetrics } from "./actions/get-dashboard-metrics"
import { DashboardKpi } from "./components/dashboard-kpi"
import { DashboardEmptyState } from "./components/dashboard-empty-state"
import DashboardShopList from "./components/dashboard-shop-list"
import { DashboardDateFilter } from "./components/DashboardDateFilter"
import { CreateShopDialog } from "./[slug]/components/CreateShopDialog"

export default async function DashboardRootPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const { range } = await searchParams
  // Passa o range escolhido para a busca de dados
  const data = await getDashboardMetrics(range)
  // Se não retornou dados (usuário deslogado), redireciona
  if (!data) return redirect("/")
  // Se o usuário não tem nenhuma loja, mostra tela de "Criar Primeira Loja"
  if (data.shops.length === 0) {
    return <DashboardEmptyState userName={data.userName} />
  }
  return (
    <div className="animate-in fade-in space-y-8 p-8 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Visão Geral</h2>
          <p className="text-muted-foreground">
            Resumo da performance da sua equipe.
          </p>
        </div>

        {/*  Controles: Filtro de Data + Botão de Criar */}
        <div className="flex items-center gap-2">
          <DashboardDateFilter />
          <CreateShopDialog />
        </div>
      </div>

      {/* Cards de Métricas (KPIs) */}
      <DashboardKpi
        totalRevenue={data.totalRevenue}
        totalAppointments={data.totalAppointments}
        totalShops={data.shops.length}
        revenueChange={data.revenueChange}
        appointmentsChange={data.appointmentsChange}
        comparisonLabel={data.comparisonLabel}
      />

      {/* Lista de Lojas / Barbeiros */}
      <DashboardShopList shops={data.shops} />
    </div>
  )
}
