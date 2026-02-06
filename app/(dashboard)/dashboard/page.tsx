import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import {
  Calendar,
  DollarSign,
  ExternalLink,
  Scissors,
  Settings,
  TrendingUp,
  Zap,
} from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import Link from "next/link"
import { BookingItem } from "./components/BookingItem"
import { CreateShopDialog } from "./components/CreateShopDialog"
import { TrialWarning } from "./components/TrialWarning"
import { NewBranchButton } from "./components/NewBranchButton"
import { getDashboardMetrics } from "./actions/get-dashboard-metrics"

export default async function BarberDashboard() {
  // 1. BUSCA SESSÃO
  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect("/")

  // 2. BUSCA DADOS
  const { barberShop, userShopsCount } = await getDashboardMetrics(
    session.user.id,
  )

  // 3. CASO 1: NÃO TEM NENHUMA LOJA
  if (!barberShop) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <h1 className="text-2xl font-bold">Bem-vindo ao Sistema</h1>
        <p>Para começar, crie sua barbearia.</p>
        <CreateShopDialog />
      </div>
    )
  }

  // --- 4. TRATAMENTO DE DADOS ---
  const validBookings = barberShop.bookings.filter(
    (b) => b.service !== null && b.user !== null,
  )

  const totalRevenue = validBookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((acc, curr) => acc + Number(curr.price), 0)

  // --- 5. LÓGICA DE BLOQUEIO / PAGAMENTO ---
  const isStripeActive = barberShop.stripeSubscriptionStatus === true
  const hasActiveDate = barberShop.subscriptionEndsAt
    ? barberShop.subscriptionEndsAt > new Date()
    : false
  const hasActiveTrial = barberShop.trialEndsAt
    ? barberShop.trialEndsAt > new Date()
    : false

  if (!isStripeActive && !hasActiveDate && !hasActiveTrial) {
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

  const isPro = barberShop.plan === "PRO" || session.user.role === "ADMIN"

  return (
    <div className="animate-in fade-in flex-1 space-y-6 p-4 duration-500 md:space-y-8 md:p-8">
      {/* 1. TOPO: BOAS VINDAS + VER LOJA */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Visão Geral
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Bem-vindo de volta, {session.user.name}
          </p>
        </div>
      </div>

      {/* 2. BARRA DE TÍTULO + BOTÃO INTELIGENTE */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-bold md:text-2xl">Minha Barbearia</h1>

        <div className="flex w-full gap-2 md:w-auto">
          <NewBranchButton userShopsCount={userShopsCount} isPro={isPro} />
          <Button variant="outline" className="md:w-auto" asChild>
            <Link
              href={`/barbershops/${barberShop.slug}`}
              target="_blank"
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" /> Ver Loja Online
            </Link>
          </Button>
        </div>
      </div>

      {/* 3. ALERTA DE TRIAL */}
      <TrialWarning
        trialEndsAt={barberShop.trialEndsAt}
        stripeStatus={barberShop.stripeSubscriptionStatus}
        plan={barberShop.plan}
      />

      {/* 4. BANNER DE UPGRADE */}
      {!isPro && (
        <div className="flex flex-col gap-4 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold md:text-xl">
              <Zap className="fill-yellow-400 text-yellow-400" /> Turbine sua
              Barbearia
            </h3>
            <p className="mt-1 text-sm text-blue-100 md:text-base">
              Você está no plano START. Libere agendamentos ilimitados e taxas
              zero.
            </p>
          </div>
          <Button
            variant="secondary"
            className="w-full font-bold text-blue-700 md:w-auto"
            asChild
          >
            <Link href="/dashboard/subscription">Fazer Upgrade</Link>
          </Button>
        </div>
      )}

      {/* 5. CARDS DE MÉTRICAS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Agendamentos Futuros
            </CardTitle>
            <Calendar className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{validBookings.length}</div>
            <p className="text-muted-foreground mt-1 text-xs">+2 hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Faturamento Estimado
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalRevenue)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Nos próximos dias
            </p>
          </CardContent>
        </Card>

        <Card className={`${isPro ? "border-primary" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Seu Plano</CardTitle>
            <TrendingUp className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{barberShop.plan}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {isPro ? "Assinatura Ativa" : "Plano Gratuito / Trial"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        {/* LISTA DE AGENDAMENTOS */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold">Próximos Clientes</h2>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="w-full justify-start md:w-auto"
            >
              <Link href="/dashboard/calendar">Ver Agenda Completa</Link>
            </Button>
          </div>

          {validBookings.length === 0 ? (
            <Card className="text-muted-foreground flex flex-col items-center justify-center border-dashed p-8">
              <Calendar className="mb-2 h-10 w-10 opacity-20" />
              <p>Agenda livre por enquanto.</p>
            </Card>
          ) : (
            validBookings.map((booking) => (
              <BookingItem
                key={booking.id}
                booking={{
                  ...booking,
                  price: Number(booking.price),
                  service: {
                    ...booking.service!,
                    price: Number(booking.service!.price),
                  },
                }}
              />
            ))
          )}
        </div>

        {/* SIDEBAR DE AÇÕES */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Ações Rápidas</h2>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Gerenciar Loja</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/dashboard/services">
                  <Scissors className="mr-2 h-4 w-4" /> Editar Serviços
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" /> Configurações
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
