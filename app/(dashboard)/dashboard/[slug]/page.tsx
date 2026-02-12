import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { getDashboardHomeData } from "../actions/get-dashboard-home-data"
import { DashboardContent } from "./components/DashboardContent"

export default async function BarberDashboard({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user) return redirect("/")
  if (!slug) return redirect("/dashboard")

  const data = await getDashboardHomeData(session.user.id, slug)

  if (!data) return redirect("/")

  return (
    <DashboardContent
      userName={session.user.name || "Barbeiro"}
      data={data}
      allShops={data.allShops}
      currentShop={data.currentShop}
    />
  )
}
