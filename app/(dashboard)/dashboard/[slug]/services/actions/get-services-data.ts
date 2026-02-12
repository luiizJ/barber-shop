"use server"
import { db } from "@/app/lib/prisma"
import { getPlanLimits } from "@/app/lib/plan-limits"

export const getServicesData = async (userId: string) => {
  // 1. Busca Loja e Serviços
  const shop = await db.barberShop.findFirst({
    where: { ownerId: userId },
    include: {
      services: {
        orderBy: { name: "asc" },
      },
    },
  })

  if (!shop) return null

  // 2. Calcula Limites do Plano
  const limits = getPlanLimits(shop.plan)
  const currentServicesCount = shop.services.length

  // Porcentagem de uso (evita divisão por zero)
  const usagePercentage =
    limits.maxServices > 0
      ? (currentServicesCount / limits.maxServices) * 100
      : 0

  const isLimitReached = currentServicesCount >= limits.maxServices
  const isPro = shop.plan === "PRO"

  // 3. Sanitização (Decimal -> Number)
  //  evita o erro "Decimal objects not supported"
  const services = shop.services.map((service) => ({
    ...service,
    price: Number(service.price),
  }))

  return {
    shopId: shop.id, // Caso eu precise no futuro
    services,
    plan: {
      isPro,
      currentUsage: currentServicesCount,
      maxLimit: limits.maxServices,
      percentage: usagePercentage,
      isLimitReached,
    },
  }
}
