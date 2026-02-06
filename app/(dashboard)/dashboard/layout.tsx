import { db } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "./components/Sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect("/")

  // Busca infos básicas da loja para a Sidebar
  const shop = await db.barberShop.findFirst({
    where: { ownerId: session.user.id },
    select: { name: true, imageUrl: true },
  })

  // Se não tiver loja ainda, renderiza o conteúdo normal
  if (!shop) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <div className="bg-muted/20 min-h-screen w-full p-5">
      <Sidebar shopName={shop.name} shopImage={shop.imageUrl} />

      <main className="flex-1 md:pl-64">
        <div className="h-full w-full">{children}</div>
      </main>
    </div>
  )
}
