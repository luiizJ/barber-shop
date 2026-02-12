import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/app/lib/prisma"
import { CreateShopDialog } from "./components/CreateShopDialog"

export default async function DashboardRootPage() {
  const session = await getServerSession(authOptions)

  // 1. Proteção de Login
  if (!session?.user) return redirect("/")

  // 2. Busca a loja no banco
  const firstShop = await db.barberShop.findFirst({
    where: { ownerId: session.user.id },
    select: { slug: true },
  })

  // 3. CENÁRIO A: O usuário já tem loja
  // Redireciona ele para a URL dinâmica: /dashboard/nome-da-loja
  if (firstShop) {
    return redirect(`/dashboard/${firstShop.slug}`)
  }

  // 4. CENÁRIO B: O usuário é novo (não tem loja)
  // Renderizamos a tela de criação aqui mesmo, na URL /dashboard
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-zinc-950 p-4 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl">
          Quase lá, {session.user.name?.split(" ")[0]}! ✂️
        </h1>
        <p className="max-w-[600px] text-zinc-400 md:text-xl">
          Sua conta foi criada. Agora, cadastre sua primeira unidade para
          começar a gerenciar sua agenda.
        </p>
      </div>

      {/* Esse é o componente que você já tem com o formulário */}
      <CreateShopDialog />

      <p className="text-xs text-zinc-500">
        Configuração rápida em menos de 1 minuto.
      </p>
    </div>
  )
}
