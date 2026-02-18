import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Building2 } from "lucide-react"
import Link from "next/link"

interface ShopSummary {
  id: string
  name: string
  slug: string
  bookings: { service: { price: number | unknown } }[]
}

interface DashboardShopListProps {
  shops: ShopSummary[]
}

const DashboardShopList = ({ shops }: DashboardShopListProps) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Desempenho por Unidade</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {shops.map((shop) => {
            const revenue = shop.bookings.reduce(
              (sum, booking) => sum + Number(booking.service.price),
              0,
            )

            return (
              <div
                key={shop.id}
                /* Ajuste aqui: flex-col no mobile, flex-row no desktop */
                className="hover:bg-muted/50 flex flex-col gap-4 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
              >
                {/* LADO ESQUERDO: Nome e Icone */}
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    <Building2 className="text-primary h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    {" "}
                    {/* min-w-0 evita que nomes longos quebrem o layout */}
                    <p className="truncate font-medium">{shop.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {shop.bookings.length} agendamentos
                    </p>
                  </div>
                </div>

                {/* LADO DIREITO: Preço e Botão */}
                <div className="flex w-full items-center justify-between gap-4 border-t pt-4 sm:w-auto sm:justify-end sm:gap-6 sm:border-none sm:pt-0">
                  <div className="flex flex-col sm:text-right">
                    <p className="font-medium">
                      {Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(revenue)}
                    </p>
                    <p className="text-muted-foreground text-xs">Hoje</p>
                  </div>

                  <Link href={`/dashboard/${shop.slug}`} className="shrink-0">
                    <Button variant="outline" size="sm" className="px-4">
                      Gerenciar
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default DashboardShopList
