"use server"

import { db } from "@/app/lib/prisma"

export async function getDashboardHomeData(userId: string) {
  // 1. Busca Barbearia e Contagem de Lojas (para o botão de filial)
  const [barberShop, userShopsCount] = await Promise.all([
    db.barberShop.findFirst({
      where: { ownerId: userId },
      include: {
        bookings: {
          where: {
            date: { gte: new Date() }, // Apenas futuros ou hoje
            status: { not: "CANCELLED" },
          },
          include: {
            service: true,
            user: true,
          },
          orderBy: { date: "asc" },
        },
      },
    }),
    db.barberShop.count({
      where: { ownerId: userId },
    }),
  ])

  // Se não tem loja, retorna null para tratar na page
  if (!barberShop) return null

  // 2. Filtragem de Segurança (Evita agendamentos corrompidos)
  const validBookings = barberShop.bookings.filter(
    (b) => b.service !== null && b.user !== null,
  )

  // 3. SANITIZAÇÃO (Decimal -> Number) 🚨
  // Isso evita o erro de "Decimal object" nos Client Components
  const sanitizedBookings = validBookings.map((b) => ({
    ...b,
    price: Number(b.price),
    service: {
      ...b.service!,
      price: Number(b.service!.price),
    },
  }))

  // 4. Cálculo de Faturamento (Apenas confirmados)
  const totalRevenue = sanitizedBookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((acc, curr) => acc + curr.price, 0)

  // 5. Lógica de Acesso (Bloqueio)
  const isStripeActive = barberShop.stripeSubscriptionStatus === true
  const hasActiveDate = barberShop.subscriptionEndsAt
    ? barberShop.subscriptionEndsAt > new Date()
    : false
  const hasActiveTrial = barberShop.trialEndsAt
    ? barberShop.trialEndsAt > new Date()
    : false

  // Se tudo for falso, está bloqueado
  const isBlocked = !isStripeActive && !hasActiveDate && !hasActiveTrial

  // 6. Definição de PRO
  const isPro = barberShop.plan === "PRO"

  return {
    barberShop: {
      ...barberShop,
      bookings: sanitizedBookings,
    },
    metrics: {
      totalRevenue,
      futureBookingsCount: sanitizedBookings.length,
      userShopsCount,
    },
    access: {
      isBlocked,
      isPro,
    },
  }
}
