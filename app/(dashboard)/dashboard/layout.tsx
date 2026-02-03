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

  // Se não tiver loja ainda, renderiza o conteúdo normal (que vai ser a tela de criar loja)
  if (!shop) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <div className="bg-muted/20 min-h-screen">
      {/* Sidebar Fixa */}
      <Sidebar shopName={shop.name} shopImage={shop.imageUrl} />

      {/* Conteúdo da Página (com margem para não ficar embaixo da sidebar) */}
      <main className="pl-64">
        <div className="container px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
