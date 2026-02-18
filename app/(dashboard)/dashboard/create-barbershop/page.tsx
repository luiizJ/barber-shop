import { authOptions } from "@/app/lib/auth"
import { CreateShopDialog } from "../[slug]/components/CreateShopDialog"
import { getServerSession } from "next-auth"
import { db } from "@/app/lib/prisma"
import { redirect } from "next/navigation"

const page = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return redirect("/")
  }

  // 1. Buscamos os dados necessários para o contrato do Componente
  const user = await db.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      stripeSubscriptionStatus: true,
      ownedBarbershops: {
        select: { id: true },
      },
    },
  })

  const isPro = user?.stripeSubscriptionStatus === "active"
  const shopCount = user?.ownedBarbershops.length || 0

  return (
    <div className="flex h-screen w-full items-center justify-center">
      {/* Agora passamos as props obrigatórias que o TypeScript exigiu */}
      <CreateShopDialog shopCount={shopCount} isPro={isPro} />
    </div>
  )
}
export default page
