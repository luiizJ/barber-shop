import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import {
  CalendarDays,
  DollarSign,
  Store,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react"

interface DashboardKpiProps {
  totalRevenue: number
  totalAppointments: number
  totalShops: number
  revenueChange: number
  appointmentsChange: number
  comparisonLabel: string
}

// Sub-componente para mostrar a porcentagem colorida
function ChangeIndicator({ value, label }: { value: number; label: string }) {
  const isPositive = value > 0
  const isNeutral = value === 0
  const isNegative = value < 0

  return (
    <div className="mt-1 flex items-center gap-1 text-xs">
      {isPositive && <TrendingUp className="h-3 w-3 text-emerald-500" />}
      {isNegative && <TrendingDown className="h-3 w-3 text-red-500" />}
      {isNeutral && <Minus className="text-muted-foreground h-3 w-3" />}

      <span
        className={
          isPositive
            ? "font-medium text-emerald-500"
            : isNegative
              ? "font-medium text-red-500"
              : "text-muted-foreground"
        }
      >
        {isNeutral ? "0%" : `${Math.abs(value).toFixed(1)}%`}
      </span>
      <span className="text-muted-foreground ml-1">{label}</span>
    </div>
  )
}

export function DashboardKpi({
  totalRevenue,
  totalAppointments,
  totalShops,
  revenueChange,
  appointmentsChange,
  comparisonLabel,
}: DashboardKpiProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* CARD FATURAMENTO */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Faturamento Global
          </CardTitle>
          <DollarSign className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(totalRevenue)}
          </div>
          <ChangeIndicator value={revenueChange} label={comparisonLabel} />
        </CardContent>
      </Card>

      {/* CARD AGENDAMENTOS */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
          <CalendarDays className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAppointments}</div>
          <ChangeIndicator value={appointmentsChange} label={comparisonLabel} />
        </CardContent>
      </Card>

      {/* CARD UNIDADES (Sem comparação de tempo pois muda pouco) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Unidades / Equipe
          </CardTitle>
          <Store className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalShops}</div>
          <p className="text-muted-foreground mt-1 text-xs">
            Ativos no sistema
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
