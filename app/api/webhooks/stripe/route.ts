import { db } from "@/app/lib/prisma"
import { stripe } from "@/app/lib/stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return new NextResponse("Webhook Secret Missing", { status: 500 })
  }

  const body = await request.text()
  const signature = (await headers()).get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.payment_status !== "paid") break

        const subscriptionId = session.subscription as string
        const customerId = session.customer as string
        const userId = session.metadata?.userId // ✅ Pegamos o ID do Usuário
        const shopId = session.metadata?.shopId

        if (userId && shopId) {
          const nextMonth = new Date()
          nextMonth.setDate(nextMonth.getDate() + 30)

          // 1. Atualiza o USUÁRIO (Status Global e ID do Stripe)
          await db.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: customerId,
              stripeSubscriptionStatus: "active", // ✅ Agora é String!
            },
          })

          // 2. Atualiza a UNIDADE (Plano e Data)
          await db.barberShop.update({
            where: { id: shopId },
            data: {
              stripeSubscriptionId: subscriptionId,
              plan: session.metadata?.planChoice as "START" | "PRO",
              subscriptionEndsAt: nextMonth,
            },
          })

          console.log(
            `✅ Assinatura ativada para o usuário ${userId} na loja ${shopId}`,
          )
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice

        const subscriptionId = (invoice as any).subscription as string
        const customerId = invoice.customer as string

        if (subscriptionId && customerId) {
          const periodEnd = new Date(invoice.lines.data[0].period.end * 1000)

          await db.user.update({
            where: { stripeCustomerId: customerId },
            data: { stripeSubscriptionStatus: "active" },
          })

          await db.barberShop.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: { subscriptionEndsAt: periodEnd },
          })
        }
        break
      }

      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // 1. Marca o Usuário como cancelado ou inadimplente
        await db.user.update({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionStatus:
              event.type === "invoice.payment_failed" ? "past_due" : "canceled",
          },
        })

        console.log(`🚫 Acesso do cliente ${customerId} suspenso/cancelado.`)
        break
      }
    }
  } catch (error: any) {
    console.error("❌ Erro no Webhook:", error)
    return new NextResponse("Database Error", { status: 500 })
  }

  return new NextResponse(null, { status: 200 })
}
