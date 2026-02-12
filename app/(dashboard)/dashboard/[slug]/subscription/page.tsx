import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { getSubscriptionData } from "./actions/get-subscription-data" // 👇 Action
import { SubscriptionContent } from "./components/SubscriptionContent" // 👇 UI Component

export default async function SubscriptionPage() {
  // 1. Auth
  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect("/")

  // 2. Fetch Data
  const data = await getSubscriptionData(session.user.id)

  if (!data) return redirect("/dashboard")

  // 3. Render
  return (
    <div className="animate-in fade-in duration-500">
      <SubscriptionContent plan={data.plan} />
    </div>
  )
}
