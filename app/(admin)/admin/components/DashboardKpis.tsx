import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { DollarSign, Store, CreditCard, AlertCircle } from "lucide-react"

interface DashboardKpisProps {
  data: {
    mrr: number
    totalShops: number
    activeSubs: number
    inactiveSubs: number
    churn: number
  }
}

export function DashboardKpis({ data }: DashboardKpisProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {/* MRR */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">MRR (Mensal)</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(data.mrr)}
          </div>
          <p className="text-muted-foreground text-xs">
            Receita recorrente atual
          </p>
        </CardContent>
      </Card>

      {/* Lojas Ativas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lojas Ativas</CardTitle>
          <Store className="text-primary h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalShops}</div>
          <p className="text-muted-foreground text-xs">
            {data.activeSubs} pagantes / {data.inactiveSubs} free
          </p>
        </CardContent>
      </Card>

      {/* Assinaturas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Assinaturas Ativas
          </CardTitle>
          <CreditCard className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.activeSubs}</div>
          <p className="text-muted-foreground text-xs">
            Clientes pagando em dia
          </p>
        </CardContent>
      </Card>

      {/* Churn */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.churn}%</div>
          <p className="text-muted-foreground text-xs">
            Cancelamentos este mês
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
