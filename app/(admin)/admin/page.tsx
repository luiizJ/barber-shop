import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { getDashboardStats } from "../data/get-dashboard-stats"
import { CreateShopDialog } from "./components/CreateShopDialog"
import { DashboardKpis } from "./components/DashboardKpis"
import { SubscriptionsTable } from "./components/SubscriptionsTable"

export default async function SuperAdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN") {
    return redirect("/")
  }

  // 1. Uma única linha busca e calcula tudo
  const { kpis, allBarbershops } = await getDashboardStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel Master</h1>
          <p className="text-muted-foreground text-sm">
            Visão geral do seu Império SaaS 🦅
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CreateShopDialog />
          <div className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
            Super Admin
          </div>
        </div>
      </div>

      <DashboardKpis data={kpis} />

      <SubscriptionsTable shops={allBarbershops} />
    </div>
  )
}
