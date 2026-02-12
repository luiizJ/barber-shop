import { authOptions } from "@/app/lib/auth"
import { db } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns"

export async function getDashboardMetrics(range: string = "today") {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  // 1. Definição de Datas (Atual vs Anterior)
  let dateStart: Date, dateEnd: Date
  let prevDateStart: Date, prevDateEnd: Date
  let comparisonLabel: string

  const now = new Date()

  switch (range) {
    case "month":
      dateStart = startOfMonth(now)
      dateEnd = endOfMonth(now)
      prevDateStart = startOfMonth(subMonths(now, 1))
      prevDateEnd = endOfMonth(subMonths(now, 1))
      comparisonLabel = "vs. mês anterior"
      break
    case "yesterday":
      dateStart = startOfDay(subDays(now, 1))
      dateEnd = endOfDay(subDays(now, 1))
      prevDateStart = startOfDay(subDays(now, 2))
      prevDateEnd = endOfDay(subDays(now, 2))
      comparisonLabel = "vs. anteontem"
      break
    default: // "today"
      dateStart = startOfDay(now)
      dateEnd = endOfDay(now)
      prevDateStart = startOfDay(subDays(now, 1))
      prevDateEnd = endOfDay(subDays(now, 1))
      comparisonLabel = "vs. ontem"
      break
  }

  // 2. Função auxiliar para buscar dados
  const fetchMetrics = async (start: Date, end: Date) => {
    const shops = await db.barberShop.findMany({
      where: { ownerId: session.user.id },
      include: {
        bookings: {
          // ⚠️ Confirme se é 'bookings' ou 'appointments'
          where: { date: { gte: start, lte: end } },
          include: { service: true },
        },
      },
    })

    const appointments = shops.reduce(
      (acc, shop) => acc + shop.bookings.length,
      0,
    )
    const revenue = shops.reduce((acc, shop) => {
      return (
        acc + shop.bookings.reduce((sum, b) => sum + Number(b.service.price), 0)
      )
    }, 0)

    return { shops, appointments, revenue }
  }

  // 3. Executa as buscas em paralelo (Performance 🚀)
  const [currentData, prevData] = await Promise.all([
    fetchMetrics(dateStart, dateEnd),
    fetchMetrics(prevDateStart, prevDateEnd),
  ])

  // 4. Cálculo de Porcentagem
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  return {
    shops: currentData.shops,
    totalRevenue: currentData.revenue,
    totalAppointments: currentData.appointments,
    revenueChange: calculateChange(currentData.revenue, prevData.revenue),
    appointmentsChange: calculateChange(
      currentData.appointments,
      prevData.appointments,
    ),
    comparisonLabel,
    userName: session.user.name,
  }
}
