import { authOptions } from "@/app/lib/auth"
import { db } from "@/app/lib/prisma"
import {
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns"
import { getServerSession } from "next-auth"

export async function getDashboardMetrics(
  range: string = "today",
  slug?: string,
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  // 1. Busca os dados do Usuário + Todas as Lojas (Ordenadas por criação)
  const user = await db.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      ownedBarbershops: {
        orderBy: { createdAt: "asc" }, // A primeira [0] sempre será a MATRIZ
      },
    },
  })

  if (!user) return null

  // ✅ IDENTIFICAÇÃO DA MATRIZ
  const mainShop = user.ownedBarbershops[0]
  const isMainShop = mainShop?.slug === slug
  const userShopsCount = user.ownedBarbershops.length

  const isPro = user?.stripeSubscriptionStatus === "active"

  // 2. Definição de Datas (Manteve igual)
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

  // 3. Função auxiliar para buscar dados
  const fetchMetrics = async (start: Date, end: Date) => {
    const shops = await db.barberShop.findMany({
      where: { ownerId: (session.user as any).id },
      include: {
        bookings: {
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

  // 4. Executa as buscas em paralelo
  const [currentData, prevData] = await Promise.all([
    fetchMetrics(dateStart, dateEnd),
    fetchMetrics(prevDateStart, prevDateEnd),
  ])

  // 5. Cálculo de Porcentagem
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  // --- RESULTADO FINAL ---
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
    userName: user?.name || session.user.name,
    isPro,
    // ✅ NOVAS PROPRIEDADES PARA O FRONT-END
    isMainShop,
    userShopsCount,
  }
}
