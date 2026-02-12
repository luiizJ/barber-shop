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
import { CheckCircle2, Ban } from "lucide-react"
import { ManageShopSheet } from "./ManageShopSheet"
import { BarberShopPlan } from "@prisma/client"

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
  // Função auxiliar visual (CORRIGIDA)
  function getDaysStatus(date: Date | null) {
    if (!date) return { text: "Sem data", color: "text-muted-foreground" }

    const now = new Date()
    const diffTime = new Date(date).getTime() - now.getTime()
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (days < 0)
      return {
        text: `Venceu há ${Math.abs(days)} dias`,
        color: "text-red-600 font-bold",
      }
    if (days === 0)
      return { text: "Vence hoje!", color: "text-orange-600 font-bold" }

    return { text: `${days} dias restantes`, color: "text-green-600" }
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
            const statusInfo = getDaysStatus(shop.subscriptionEndsAt)

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
                    //  AQUI: Usamos statusInfo.color e statusInfo.text direto
                    <span className={`text-xs ${statusInfo.color}`}>
                      ({statusInfo.text})
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
