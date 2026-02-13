import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { SubscriptionContent } from "./components/SubscriptionContent"
import { getSubscriptionData } from "./actions/get-subscription-data"
// 👇 Ajuste os caminhos de importação conforme onde seus arquivos estão
// Se a pasta 'actions' estiver na raiz de 'app/subscription', use @/app/...

export default async function ShopSubscriptionPage() {
  // 1. Auth
  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect("/")

  // 2. Fetch Data
  const data = await getSubscriptionData(session.user.id)

  // Se der erro, retorna null ou trata o erro (não redirecione para dashboard para evitar loop)
  if (!data)
    return (
      <div className="p-4 text-red-500">Erro ao carregar dados do plano.</div>
    )

  // 3. Render
  return (
    <div className="animate-in fade-in mx-auto max-w-4xl duration-500">
      <h1 className="mb-6 text-2xl font-bold">Gerenciar Assinatura</h1>
      <SubscriptionContent plan={data.plan} />
    </div>
  )
}
