"use server"

import { db } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { stripe } from "@/app/lib/stripe"
import { redirect } from "next/navigation"
import type Stripe from "stripe"

export async function createCheckoutSession(plan: "START" | "PRO") {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email || !session?.user?.id) {
    return redirect("/")
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"

  // 1. Buscamos o USUÁRIO (onde estão os dados do Stripe) e sua primeira loja
  const user = await db.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      ownedBarbershops: {
        take: 1,
        select: { id: true, subscriptionEndsAt: true, plan: true },
      },
    },
  })

  if (!user || user.ownedBarbershops.length === 0) {
    return redirect("/dashboard")
  }

  const shop = user.ownedBarbershops[0]

  // 2. Lógica de Assinatura Ativa
  const hasActivePlan =
    shop.plan === plan &&
    user.stripeSubscriptionStatus === "active" &&
    shop.subscriptionEndsAt &&
    new Date(shop.subscriptionEndsAt) > new Date()

  if (hasActivePlan) {
    return redirect("/dashboard?error=already_subscribed")
  }

  const priceId =
    plan === "PRO"
      ? process.env.STRIPE_PRICE_PRO
      : process.env.STRIPE_PRICE_START

  if (!priceId) {
    throw new Error("Erro de configuração: ID do plano não encontrado.")
  }

  let sessionConfig: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    metadata: {
      shopId: shop.id,
      userId: user.id,
      planChoice: plan,
    },
    success_url: `${appUrl}/dashboard?success=true`,
    cancel_url: `${appUrl}/dashboard/subscription?canceled=true`,
  }

  if (user.stripeCustomerId) {
    sessionConfig.customer = user.stripeCustomerId
  } else {
    sessionConfig.customer_email = user.email!
  }

  const checkoutSession = await stripe.checkout.sessions.create(sessionConfig)

  if (!checkoutSession.url) {
    throw new Error("Erro ao gerar link de pagamento")
  }

  redirect(checkoutSession.url)
}
