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
                className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                    <Building2 className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{shop.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {shop.bookings.length} agendamentos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-medium">
                      {Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(revenue)}
                    </p>
                    <p className="text-muted-foreground text-xs">Hoje</p>
                  </div>
                  <Link href={`/dashboard/${shop.slug}`}>
                    <Button variant="outline" size="sm">
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
