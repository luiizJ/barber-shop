import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card"
import { db } from "@/app/lib/prisma"
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

export default async function BarberDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect("/")

  const barberShop = await db.barberShop.findFirst({
    where: { ownerId: session.user.id },
    include: {
      services: true,
      bookings: {
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 5,
        include: { service: true, user: true },
      },
    },
  })

  if (!barberShop) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold">Bem-vindo ao Sistema</h1>
        <p>Para começar, crie sua barbearia.</p>
        <CreateShopDialog />
      </div>
    )
  }

  if (barberShop.stripeSubscriptionStatus === "inactive") {
    return (
      // ... (seu código de bloqueio mantém igual)
      <div>Bloqueado</div>
    )
  }

  const isPro = barberShop.plan === "PRO"

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      {/* 1. CABEÇALHO DA PÁGINA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {session.user.name}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link
            href={`/barbershops/${barberShop.slug}`}
            target="_blank"
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" /> Ver Loja Online
          </Link>
        </Button>
      </div>

      {/* 2. BANNER DE UPGRADE (Se for Free) */}
      {!isPro && (
        <div className="flex items-center justify-between rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <Zap className="fill-yellow-400 text-yellow-400" /> Turbine sua
              Barbearia
            </h3>
            <p className="mt-1 text-blue-100">
              Você está no plano START. Libere agendamentos ilimitados e taxas
              zero.
            </p>
          </div>
          <Button
            variant="secondary"
            className="font-bold text-blue-700"
            asChild
          >
            <Link href="/dashboard/subscription">Fazer Upgrade</Link>
          </Button>
        </div>
      )}

      {/* 3. CARDS DE MÉTRICAS (Estilizados) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Agendamentos Futuros
            </CardTitle>
            <Calendar className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {barberShop.bookings.length}
            </div>
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
              {/* Soma simples dos agendamentos futuros */}
              {Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(
                barberShop.bookings
                  .filter((b) => b.status !== "CANCELLED")
                  .reduce((acc, curr) => acc + Number(curr.price), 0),
              )}
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
              {isPro ? "Assinatura Ativa" : "Limite de 5 serviços"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        {/* 4. LISTA DE AGENDAMENTOS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Próximos Clientes</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/calendar">Ver Agenda Completa</Link>
            </Button>
          </div>

          {barberShop.bookings.length === 0 ? (
            <Card className="text-muted-foreground flex flex-col items-center justify-center border-dashed p-8">
              <Calendar className="mb-2 h-10 w-10 opacity-20" />
              <p>Agenda livre por enquanto.</p>
            </Card>
          ) : (
            barberShop.bookings.map((booking) => (
              <BookingItem
                key={booking.id}
                booking={{
                  ...booking,
                  price: Number(booking.price),
                  service: {
                    ...booking.service,
                    price: Number(booking.service.price),
                  },
                }}
              />
            ))
          )}
        </div>

        {/* 5. ATALHOS RÁPIDOS (SIDEBAR DIREITA) */}
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
                  <Settings className="mr-2 h-4 w-4" /> Alterar Horários
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-primary text-sm">Suporte</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3 text-xs">
                Precisa de ajuda com a plataforma?
              </p>
              <Button size="sm" className="w-full">
                Chamar no WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
