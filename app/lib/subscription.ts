import { db } from "@/app/lib/prisma"

export async function checkSubscription(userId: string) {
  // 👇 MUDANÇA: Buscamos TODAS as lojas do usuário, não só a primeira
  const shops = await db.barberShop.findMany({
    where: { ownerId: userId },
    select: {
      id: true,
      name: true,
      stripeSubscriptionStatus: true,
      subscriptionEndsAt: true,
      trialEndsAt: true,
    },
  })

  // Se não tem loja, bloqueia (ou libera para criar, dependendo da sua regra)
  if (!shops || shops.length === 0) return false

  const now = new Date()

  // 👇 DEBUG: Vamos ver no terminal o que ele encontrou
  console.log(`--- VERIFICANDO ${shops.length} LOJAS PARA O USER ${userId} ---`)

  // Verifica se ALGUMA loja tem plano ativo ou trial válido
  const hasActiveShop = shops.some((shop) => {
    const isActivePlan =
      shop.stripeSubscriptionStatus === true &&
      shop.subscriptionEndsAt &&
      shop.subscriptionEndsAt > now

    const isActiveTrial = shop.trialEndsAt && shop.trialEndsAt > now

    console.log(
      `Loja: ${shop.name} | Plano Ativo: ${isActivePlan} | Trial Ativo: ${isActiveTrial}`,
    )
    console.log(
      `Expires: ${shop.subscriptionEndsAt?.toISOString()} | Trial: ${shop.trialEndsAt?.toISOString()}`,
    )

    return isActivePlan || isActiveTrial
  })

  console.log("RESULTADO FINAL DO ACESSO:", hasActiveShop)
  console.log("------------------------------------------------")

  return hasActiveShop
}
