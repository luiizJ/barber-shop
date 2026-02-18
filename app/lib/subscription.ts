import { db } from "@/app/lib/prisma"

export async function checkSubscription(userId: string) {
  // 1. Buscamos o USUÁRIO e todas as suas lojas em uma única consulta
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      ownedBarbershops: {
        select: {
          id: true,
          name: true,
          subscriptionEndsAt: true,
          trialEndsAt: true,
        },
      },
    },
  })

  // Se o usuário não existe ou não tem lojas, não há o que acessar
  if (!user || !user.ownedBarbershops || user.ownedBarbershops.length === 0) {
    return false
  }

  const now = new Date()
  const isUserActive = user.stripeSubscriptionStatus === "active"

  console.log(`--- 🔍 VERIFICANDO ACESSO: ${user.name} ---`)
  console.log(`Status Global no Stripe: ${user.stripeSubscriptionStatus}`)

  // 2. Verifica se ALGUMA loja garante o acesso
  const hasAccess = user.ownedBarbershops.some((shop) => {
    // A. Tem plano pago ATIVO e a data de expiração é futura?
    const hasPaidAccess =
      isUserActive && !!shop.subscriptionEndsAt && shop.subscriptionEndsAt > now

    // B. Ainda está dentro do período de teste (15 dias)?
    const hasTrialAccess = !!shop.trialEndsAt && shop.trialEndsAt > now

    console.log(
      `> Unidade: ${shop.name} | Pago: ${hasPaidAccess} | Trial: ${hasTrialAccess}`,
    )

    return hasPaidAccess || hasTrialAccess
  })

  console.log(`RESULTADO FINAL: ${hasAccess ? "✅ LIBERADO" : "❌ BLOQUEADO"}`)

  return hasAccess
}
