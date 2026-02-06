import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { getServicesData } from "./actions/get-services-data"
import ServicesList from "./components/ServicesList"

export default async function ServicesPage() {
  // 1. Auth Check
  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect("/")

  // 2. Fetch Data
  const data = await getServicesData(session.user.id)

  if (!data) return redirect("/dashboard")

  // 3. Render
  return (
    <div className="animate-in fade-in duration-500">
      <ServicesList services={data.services} plan={data.plan} />
    </div>
  )
}
