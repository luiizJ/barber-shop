"use client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"
import { Badge } from "@/app/components/ui/badge"
import { CheckCircle2, AlertCircle, Ban } from "lucide-react"
import { ManageShopSheet } from "./ManageShopSheet"
import { BarberShopPlan } from "@prisma/client"

// Tipagem precisa vir do Prisma ou ser definida aqui
interface Shop {
  id: string
  name: string
  plan: BarberShopPlan
  subscriptionEndsAt: Date | null
  stripeSubscriptionStatus: boolean | null
  owner: { email: string | null } | null
  _count: { bookings: number }
}

interface SubscriptionsTableProps {
  shops: Shop[]
}

export function SubscriptionsTable({ shops }: SubscriptionsTableProps) {
  // Função auxiliar visual
  function getDaysRemaining(date: Date | null) {
    if (!date) return "N/A"
    const now = new Date()
    const diffTime = new Date(date).getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="bg-card rounded-md border">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Gerenciamento de Assinaturas</h2>
        <p className="text-muted-foreground text-sm">
          Controle quem pagou, quem deve e quem está bloqueado.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Barbearia / Dono</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Engajamento</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shops.map((shop) => {
            const daysLeft = getDaysRemaining(shop.subscriptionEndsAt)
            const isPro = shop.plan === "PRO"
            const status = shop.stripeSubscriptionStatus

            return (
              <TableRow key={shop.id}>
                <TableCell>
                  <div className="font-medium">{shop.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {shop.owner?.email || "Sem dono"}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant={isPro ? "default" : "secondary"}>
                    {shop.plan}
                  </Badge>
                </TableCell>

                <TableCell>
                  {status === true && (
                    <div className="flex items-center text-xs font-medium text-green-600">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Ativo
                    </div>
                  )}
                  {status === false && (
                    <div className="flex items-center text-xs font-bold text-red-600">
                      <Ban className="mr-1 h-3 w-3" /> Bloqueado
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  <div className="text-sm">
                    {shop.subscriptionEndsAt
                      ? new Date(shop.subscriptionEndsAt).toLocaleDateString(
                          "pt-BR",
                        )
                      : "—"}
                  </div>
                  {shop.subscriptionEndsAt && (
                    <span
                      className={`text-xs ${Number(daysLeft) < 5 ? "font-bold text-red-500" : "text-muted-foreground"}`}
                    >
                      ({daysLeft} dias restantes)
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  <div className="text-muted-foreground text-xs">
                    {shop._count.bookings} cortes feitos
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <ManageShopSheet shop={shop} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
