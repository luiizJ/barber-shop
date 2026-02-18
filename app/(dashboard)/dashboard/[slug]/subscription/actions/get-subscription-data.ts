"use server"

import { db } from "@/app/lib/prisma"
import { differenceInDays } from "date-fns"

export async function getSubscriptionData(userId: string) {
  const shop = await db.barberShop.findFirst({
    where: { ownerId: userId },
    include: {
      owner: true,
    },
  })

  if (!shop || !shop.owner) return null

  const now = new Date()

  // 1. O status do Stripe é a "Verdade Única" para ser PRO
  const isPro = shop.owner.stripeSubscriptionStatus === "active"

  // 2. Ele está ativo se for PRO (independente da data) OU se estiver no Trial
  const isActive = isPro || (!!shop.trialEndsAt && shop.trialEndsAt > now)

  // 3. TRIAL SÓ EXISTE SE NÃO FOR PRO
  // Isso mata o banner amarelo no momento que o cara vira PRO
  const isTrial = !isPro && !!shop.trialEndsAt && shop.trialEndsAt > now

  // Se ele é PRO ou se está no Trial, ele está ATIVO.

  // 4. Determina a data de expiração para o cálculo de dias restantes
  const endDate = isPro
    ? (shop.subscriptionEndsAt ?? now)
    : (shop.trialEndsAt ?? now)

  const daysRemaining = differenceInDays(endDate, now)

  return {
    shopId: shop.id,
    plan: {
      isActive, // ✅ Nome mantido! O Front nem vai perceber a mudança.
      isPro,
      isTrial,
      isExpired: !isActive,
      endDate,
      daysRemaining: daysRemaining < 0 ? 0 : daysRemaining,
    },
  }
}
