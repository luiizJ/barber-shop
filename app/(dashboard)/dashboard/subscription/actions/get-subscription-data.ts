"use server"

import { db } from "@/app/lib/prisma"
import { differenceInDays } from "date-fns"

export async function getSubscriptionData(userId: string) {
  const shop = await db.barberShop.findFirst({
    where: { ownerId: userId },
  })

  if (!shop) return null

  // --- LÓGICA DE NEGÓCIO ---

  // 1. Status Base
  const isActive = shop.stripeSubscriptionStatus === true
  const isPro = shop.plan === "PRO"

  // 2. Cálculo do Trial
  // Só é trial se NÃO pagou ainda E a data futura existe
  const isTrial =
    !isActive && !!shop.trialEndsAt && shop.trialEndsAt > new Date()

  // 3. Cálculo de Expirado
  const isExpired = !isActive && !isTrial

  // 4. Data de Referência (Vencimento ou Fim do Trial)
  const endDate = isActive
    ? (shop.subscriptionEndsAt ?? new Date())
    : (shop.trialEndsAt ?? new Date())

  const daysRemaining = differenceInDays(endDate, new Date())

  return {
    shopId: shop.id,
    plan: {
      isActive,
      isPro,
      isTrial,
      isExpired,
      endDate,
      daysRemaining,
    },
  }
}
