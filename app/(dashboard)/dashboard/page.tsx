import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/app/lib/prisma"

export default async function DashboardRootPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect("/")

  const firstShop = await db.barberShop.findFirst({
    where: { ownerId: session.user.id },
    select: { slug: true },
  })

  if (firstShop) {
    return redirect(`/dashboard/${firstShop.slug}`)
  }

  return redirect("/")
}
