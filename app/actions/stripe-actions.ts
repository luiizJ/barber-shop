"use server"

import { db } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { stripe } from "@/app/lib/stripe"
import { redirect } from "next/navigation"
import type Stripe from "stripe"

// Recebe "START" ou "PRO" como parâmetro
export async function createCheckoutSession(plan: "START" | "PRO") {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email || !session?.user?.id) {
    return redirect("/")
  }

  // 1. Busca a barbearia do dono
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
  // Evitar Dupla Assinatura
  // Se o cara já está no plano que clicou e está ativo, não deixa pagar de novo.
  if (shop.plan === plan && shop.stripeSubscriptionStatus) {
    // Aqui idealmente mandamos para o Portal de Gerenciamento,
    // mas por enquanto mandamos para o dashboard com aviso.
    return redirect("/dashboard?error=already_subscribed")
  }

  // 2. Seleciona o ID do preço baseado na escolha
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
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
  }

  //  Gestão de Identidade no Stripe
  if (shop.stripeCustomerId) {
    // Se ele já comprou antes, usamos o MESMO ID (histórico unificado)
    sessionConfig.customer = shop.stripeCustomerId
  } else {
    // Se é a primeira vez, preenchemos o e-mail para ele não ter que digitar
    // (O Stripe cria o Customer ID novo automaticamente)
    sessionConfig.customer_email = session.user.email
  }

  // 4. Cria a sessão
  const checkoutSession = await stripe.checkout.sessions.create(sessionConfig)

  if (!checkoutSession.url) {
    throw new Error("Erro ao gerar link de pagamento")
  }

  redirect(checkoutSession.url)
}
