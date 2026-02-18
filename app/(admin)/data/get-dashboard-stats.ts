import { db } from "@/app/lib/prisma"

export async function getDashboardStats() {
  // 1. Busca Dados (Já está correto com o include)
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

  // 2. Cálculos de Negócio Refatorados
  const totalShops = allBarbershops.length

  // ✅ Agora acessamos via shop.owner e comparamos com "active"
  const activeSubs = allBarbershops.filter(
    (shop) => shop.owner?.stripeSubscriptionStatus === "active",
  ).length

  const inactiveSubs = totalShops - activeSubs

  // ✅ Cálculo do MRR (Mensalidade recorrente)
  const mrr = allBarbershops.reduce((acc, shop) => {
    // Verificamos se o plano é PRO e se a assinatura do dono está ativa
    if (
      shop.plan === "PRO" &&
      shop.owner?.stripeSubscriptionStatus === "active"
    ) {
      return acc + 97.0
    }
    return acc
  }, 0)

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
