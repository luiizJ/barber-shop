import { db } from "@/app/lib/prisma"

export async function getDashboardStats() {
  // 1. Busca Dados
  const allBarbershops = await db.barberShop.findMany({
    include: {
      owner: true,
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // 2. Cálculos de Negócio
  const totalShops = allBarbershops.length

  const activeSubs = allBarbershops.filter(
    (shop) => shop.stripeSubscriptionStatus === true,
  ).length

  const inactiveSubs = totalShops - activeSubs

  const mrr = allBarbershops.reduce((acc, shop) => {
    if (shop.plan === "PRO" && shop.stripeSubscriptionStatus === true) {
      return acc + 97.0
    }
    return acc
  }, 0)

  // Retorna um objeto limpo, pronto para o Front usar
  return {
    allBarbershops,
    kpis: {
      totalShops,
      activeSubs,
      inactiveSubs,
      mrr,
      churn: 0,
    },
  }
}
