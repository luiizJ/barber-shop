"use server"

import { db } from "@/app/lib/prisma"
import { differenceInDays } from "date-fns"

export async function getSubscriptionData(userId: string) {
  const shop = await db.barberShop.findFirst({
    where: { ownerId: userId },
  })

  if (!shop) return null

  const now = new Date()

  // 1. Status Base (Forçamos boolean com o '!!' e checagem de data)
  const isActive =
    !!shop.stripeSubscriptionStatus && // Garante que não é null
    !!shop.subscriptionEndsAt && // Garante que existe data
    shop.subscriptionEndsAt > now

  // 2. Cálculo do Trial
  const isTrial = !isActive && !!shop.trialEndsAt && shop.trialEndsAt > now

  // 3. Expirado?
  const isExpired = !isActive && !isTrial

  // 4. É PRO?
  const isPro = shop.plan === "PRO"

  // 5. Data Final (Fallback para agora se for nulo)
  const endDate = isActive
    ? (shop.subscriptionEndsAt ?? now)
    : (shop.trialEndsAt ?? now)

  const daysRemaining = differenceInDays(endDate, now)

  // 👇 RETORNO BLINDADO (Sem Nulls)
  return {
    shopId: shop.id,
    plan: {
      isActive, // É boolean puro
      isPro, // É boolean puro
      isTrial, // É boolean puro
      isExpired, // É boolean puro
      endDate, // É Date puro
      daysRemaining, // É number puro
    },
  }
}
