import { db } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "./components/Sidebar"
import { checkSubscription } from "@/app/lib/subscription"
// 👇 Importe o novo guarda
import { ShopGuard } from "./components/ShopGuard"

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect("/")

  // 1. Verifica se tem acesso (mas NÃO redireciona aqui mais)
  const hasAccess = await checkSubscription(session.user.id)

  // 2. Validações de Loja
  if (!slug) return redirect("/")

  const allShops = await db.barberShop.findMany({
    where: { ownerId: session.user.id },
    select: { id: true, name: true, slug: true, imageUrl: true },
  })

  const currentShop = allShops.find((s) => s.slug === slug)

  if (!currentShop) return redirect("/")

  return (
    <div className="bg-muted/40 flex min-h-screen w-full">
      {/* Sidebar fica FORA do Guard, para continuar visível */}
      <Sidebar shops={allShops} currentShop={currentShop} />

      <main className="flex-1 md:ml-64">
        <div className="h-full w-full p-5">
          {/*  O Guard decide: Mostra o conteúdo ou a Tela Vermelha */}
          <ShopGuard hasAccess={hasAccess} slug={slug}>
            {children}
          </ShopGuard>
        </div>
      </main>
    </div>
  )
}
