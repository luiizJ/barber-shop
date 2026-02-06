import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { CreateShopDialog } from "./components/CreateShopDialog"
import { getDashboardHomeData } from "./actions/get-dashboard-home-data" // 👇 Nova Action
import { DashboardContent } from "./components/DashboardContent" // 👇 Novo Componente
import { Button } from "@/app/components/ui/button"
import Link from "next/link"

export default async function BarberDashboard() {
  // 1. BUSCA SESSÃO
  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect("/")

  // 2. BUSCA DADOS (Server Action)
  const data = await getDashboardHomeData(session.user.id)

  // 3. CASO: NÃO TEM LOJA -> Mostra tela de criar
  if (!data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <h1 className="text-2xl font-bold">Bem-vindo ao Sistema</h1>
        <p>Para começar, crie sua barbearia.</p>
        <CreateShopDialog />
      </div>
    )
  }

  // 4. CASO: BLOQUEADO -> Mostra tela de pagamento
  // A lógica de bloqueio está centralizada na Action
  if (data.access.isBlocked) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">Acesso Bloqueado</h1>
        <p>Sua assinatura está inativa. Regularize para continuar.</p>
        <Button asChild variant="destructive">
          <Link href="/dashboard/subscription">Regularizar Pagamento</Link>
        </Button>
      </div>
    )
  }

  // 5. CASO: TUDO CERTO -> Renderiza Dashboard
  return (
    <DashboardContent userName={session.user.name || "Barbeiro"} data={data} />
  )
}
