import { db } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Check, AlertTriangle, Calendar, CreditCard } from "lucide-react"
import { differenceInDays, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { BuyButton } from "./components/BuyButton"

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect("/")

  const shop = await db.barberShop.findFirst({
    where: { ownerId: session.user.id },
  })

  if (!shop) return redirect("/dashboard")

  // --- LÓGICA DE DATAS E STATUS ---
  const isPro = shop.plan === "PRO"
  const isTrial = !!shop.trialEndsAt && shop.trialEndsAt > new Date()
  const isExpired = !shop.stripeSubscriptionStatus && !isTrial // Não pagou e não é trial

  // Data de referência (ou fim do trial ou fim da assinatura paga)
  const endDate: Date =
    isTrial && shop.trialEndsAt
      ? shop.trialEndsAt
      : (shop.subscriptionEndsAt ?? new Date())

  // Calcula a diferença em dias
  const daysRemaining = differenceInDays(endDate, new Date())
  // Texto dinâmico do botão
  const buttonText = isTrial ? "Garantir Assinatura" : "Renovar Agora"

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assinatura</h1>
          <p className="text-muted-foreground">
            Gerencie seu plano e faturamento.
          </p>
        </div>
      </div>

      {/* CARD DE STATUS ATUAL */}
      <Card
        className={`border-l-4 ${isExpired ? "border-l-red-500" : isTrial ? "border-l-yellow-500" : "border-l-green-500"}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                Status Atual
                {isExpired && <Badge variant="destructive">Expirado</Badge>}
                {isTrial && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-500/20 text-yellow-600"
                  >
                    Período de Teste
                  </Badge>
                )}
                {!isExpired && !isTrial && (
                  <Badge className="bg-green-500">Ativo</Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-2">
                {isExpired
                  ? "Sua assinatura está suspensa. Realize o pagamento para liberar o acesso."
                  : isTrial
                    ? `Você tem ${daysRemaining} dias restantes de teste gratuito.`
                    : `Sua assinatura renova automaticamente em ${
                        // 👇 Só mostra a data se ela for maior que o ano 2000 (evita o bug de 1969)
                        endDate.getFullYear() > 2000
                          ? format(endDate, "dd 'de' MMMM 'de' yyyy", {
                              locale: ptBR,
                            })
                          : "Breve"
                      }.`}
              </CardDescription>
            </div>
            <CreditCard className="text-muted-foreground h-6 w-6" />
          </div>
        </CardHeader>
      </Card>

      {/* GRADE DE PLANOS */}
      <div className="grid gap-8 md:grid-cols-2 lg:max-w-4xl">
        {/* PLANO START */}
        <Card
          className={`flex flex-col ${!isPro ? "border-primary shadow-md" : ""}`}
        >
          <CardHeader>
            <CardTitle className="text-xl">Plano Start</CardTitle>
            <div className="mt-2 text-3xl font-bold">
              R$ 29,90{" "}
              <span className="text-muted-foreground text-sm font-normal">
                / mês
              </span>
            </div>
            <CardDescription>Para quem está começando.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-500" /> Agenda Ilimitada
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-500" /> Página
                Personalizada
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-500" /> Até 1 Barbeiro
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-500" /> Relatórios
                Básicos
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <BuyButton
              plan="START"
              text={buttonText}
              variant={!isPro ? "secondary" : "outline"}
              isCurrent={!isPro && !isExpired} // Se ele é Start e não tá expirado, é o plano atual
            />
          </CardFooter>
        </Card>

        {/* PLANO PRO */}
        <Card
          className={`flex flex-col ${isPro ? "border-primary bg-slate-900 text-white shadow-md" : "opacity-90"}`}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-xl">
              Plano Pro
              <Badge className="border-none bg-linear-to-r from-yellow-400 to-orange-500 text-black">
                RECOMENDADO
              </Badge>
            </CardTitle>
            <div className="mt-2 text-3xl font-bold text-white">
              R$ 59,90{" "}
              <span className="text-sm font-normal text-slate-400">/ mês</span>
            </div>
            <CardDescription className="text-slate-400">
              Para barbearias em crescimento.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-2 text-sm text-slate-200">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-yellow-400" /> Tudo do Start
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-yellow-400" /> Barbeiros
                Ilimitados
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-yellow-400" /> Lembretes via
                WhatsApp
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-yellow-400" /> Taxa Zero em
                Pagamentos
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <BuyButton
              plan="PRO"
              text={
                isPro && isExpired
                  ? "Renovar Pro"
                  : isPro
                    ? "Plano Atual"
                    : "Fazer Upgrade"
              }
              variant="default" // Botão mais chamativo
              isCurrent={isPro && !isExpired}
            />
          </CardFooter>
        </Card>
      </div>

      <p className="text-muted-foreground pt-8 text-center text-xs">
        Pagamentos processados com segurança pelo Stripe. Cancele a qualquer
        momento.
      </p>
    </div>
  )
}
