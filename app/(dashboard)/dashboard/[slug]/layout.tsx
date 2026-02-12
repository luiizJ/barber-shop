import { db } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "../components/Sidebar"

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  // 1. OBRIGATÓRIO: Aguardar o params
  const resolvedParams = await params
  const slug = resolvedParams.slug

  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect("/")

  // 2. Busca a loja específica. Se o slug for undefined, isso vai falhar e sair do loop
  if (!slug) {
    console.error("ERRO: Slug não chegou no Layout")
    return redirect("/")
  }

  const allShops = await db.barberShop.findMany({
    where: { ownerId: session.user.id },
    select: { id: true, name: true, slug: true, imageUrl: true },
  })

  const currentShop = allShops.find((s) => s.slug === slug)

  if (!currentShop) {
    console.log("Loja não encontrada para o slug:", slug)
    return redirect("/")
  }

  return (
    <div className="bg-muted/40 flex min-h-screen w-full">
      <Sidebar shops={allShops} currentShop={currentShop} />
      <main className="flex-1 md:ml-64">
        <div className="h-full w-full p-5">{children}</div>
      </main>
    </div>
  )
}
