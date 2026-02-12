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

  if (plan !== "START" && plan !== "PRO") {
    throw new Error("Plano inválido")
  }

  //  FIX: Define a URL Base de forma robusta
  // 1. Tenta pegar a variável pública
  // 2. Se não tiver, pega a do NextAuth (que você já tem)
  // 3. Fallback para localhost (segurança para dev)
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"

  const shop = await db.barberShop.findFirst({
    where: {
      ownerId: session.user.id,
    },
    select: {
      id: true,
      plan: true,
      stripeCustomerId: true,
      stripeSubscriptionStatus: true,
    },
  })

  if (!shop) {
    return redirect("/dashboard")
  }

  if (shop.plan === plan && shop.stripeSubscriptionStatus) {
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
    metadata: {
      shopId: shop.id,
      userId: session.user.id,
      planChoice: plan,
    },
    // 👇 FIX: Agora usa a variável 'appUrl' que garantimos que existe
    success_url: `${appUrl}/dashboard?success=true`,
    cancel_url: `${appUrl}/dashboard/subscription?canceled=true`, // Mudei para voltar pra tela de assinatura
  }

  if (shop.stripeCustomerId) {
    sessionConfig.customer = shop.stripeCustomerId
  } else {
    sessionConfig.customer_email = session.user.email
  }

  const checkoutSession = await stripe.checkout.sessions.create(sessionConfig)

  if (!checkoutSession.url) {
    throw new Error("Erro ao gerar link de pagamento")
  }

  redirect(checkoutSession.url)
}
