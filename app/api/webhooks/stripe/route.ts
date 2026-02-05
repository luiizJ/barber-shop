import { db } from "@/app/lib/prisma"
import { stripe } from "@/app/lib/stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error("❌ ERRO CRÍTICO: STRIPE_WEBHOOK_SECRET não configurado.")
    return new NextResponse("Webhook Secret Missing", { status: 500 })
  }

  const body = await request.text()
  const signature = (await headers()).get("Stripe-Signature") as string

  let event: Stripe.Event

  // 🛡️ SEGURANÇA MÁXIMA: Verifica se o evento veio mesmo do Stripe
  // Se um hacker tentar enviar um JSON falso, essa função explode e trava tudo.
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch (error: any) {
    console.error(`⚠️ Webhook Signature Error: ${error.message}`)
    return new NextResponse(`Webhook Error: Invalid Signature`, { status: 400 })
  }

  try {
    switch (event.type) {
      //  CASO 1: Checkout Completo (Primeira Compra)
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        //  TRAVA EXTRA: Garante que o dinheiro realmente entrou
        // Evita liberar acesso se o cartão foi recusado no último segundo
        if (session.payment_status !== "paid") {
          console.log("⚠️ Checkout completou mas pagamento não foi confirmado.")
          break
        }

        const subscriptionId = session.subscription as string
        const customerId = session.customer as string
        const shopId = session.metadata?.shopId

        if (shopId) {
          //  FIX DA RACE CONDITION:
          // Calculamos "Hoje + 30 dias" manualmente para garantir que o banco
          // tenha uma data válida imediatamente, sem esperar o evento de fatura.
          const nextMonth = new Date()
          nextMonth.setDate(nextMonth.getDate() + 30)

          await db.barberShop.update({
            where: { id: shopId },
            data: {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              plan: session.metadata?.planChoice as "START" | "PRO",
              stripeSubscriptionStatus: true,
              subscriptionEndsAt: nextMonth,
            },
          })
          console.log(
            `✅ Loja ${shopId} ativada com sucesso até ${nextMonth.toISOString()}`,
          )
        }
        break
      }

      //  CASO 2: Renovação Mensal (Pagamento Recorrente)
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice

        const subscriptionField = (invoice as any).subscription
        const subscriptionId =
          typeof subscriptionField === "string"
            ? subscriptionField
            : subscriptionField?.id

        if (subscriptionId) {
          // Pega data exata do Stripe (* 1000 pois vem em segundos)
          const periodEnd = new Date(invoice.lines.data[0].period.end * 1000)

          await db.barberShop.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: {
              stripeSubscriptionStatus: true,
              subscriptionEndsAt: periodEnd,
            },
          })
          console.log(
            `🔄 Assinatura ${subscriptionId} renovada até ${periodEnd.toISOString()}`,
          )
        }
        break
      }

      //  CASO 3: Cancelamento ou Falha de Pagamento
      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        const subscription = event.data.object as Stripe.Subscription
        const subscriptionId = subscription.id

        if (subscriptionId) {
          await db.barberShop.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: {
              stripeSubscriptionStatus: false,
            },
          })
          console.log(`🚫 Assinatura ${subscriptionId} suspensa/cancelada.`)
        }
        break
      }
    }
  } catch (error: any) {
    console.error("❌ Erro no banco de dados durante Webhook:", error)
    return new NextResponse("Database Error", { status: 500 })
  }

  return new NextResponse(null, { status: 200 })
}
