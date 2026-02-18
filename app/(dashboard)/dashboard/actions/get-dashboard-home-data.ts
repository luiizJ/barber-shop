"use server"

import { db } from "@/app/lib/prisma"

export async function getDashboardHomeData(userId: string, shopSlug: string) {
  // 1. Buscamos o Usuário e TODAS as suas lojas ordenadas por criação
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      ownedBarbershops: {
        orderBy: { createdAt: "asc" }, // A primeira da lista [0] é a Matriz
      },
    },
  })

  if (!user || user.ownedBarbershops.length === 0) return null

  const allShops = user.ownedBarbershops
  const mainShop = allShops[0] // ✅ Esta é a Matriz oficial

  // 2. Buscamos a loja específica do slug que está na URL
  const barberShop = await db.barberShop.findUnique({
    where: { slug: shopSlug },
    include: {
      bookings: {
        where: {
          date: { gte: new Date() },
          status: { not: "CANCELLED" },
        },
        include: { service: true, user: true },
        orderBy: { date: "asc" },
      },
    },
  })

  if (!barberShop || barberShop.ownerId !== userId) return null

  // 3. Identificação de Poder (Matriz vs Filial)
  const isMainShop = barberShop.id === mainShop.id

  // Usamos o status do Stripe do usuário (Soberania do Dono)
  const isPro = user.stripeSubscriptionStatus === "active"

  // 4. Sanitização e Cálculos
  const sanitizedBookings = barberShop.bookings.map((b) => ({
    ...b,
    price: Number(b.price),
    service: { ...b.service!, price: Number(b.service!.price) },
  }))

  const totalRevenue = sanitizedBookings.reduce(
    (acc, curr) => acc + curr.price,
    0,
  )

  // 5. Retorno completo para o componente
  return {
    allShops: allShops.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      imageUrl: s.imageUrl,
    })),
    currentShop: {
      id: barberShop.id,
      name: barberShop.name,
      slug: barberShop.slug,
      imageUrl: barberShop.imageUrl,
    },
    barberShop: { ...barberShop, bookings: sanitizedBookings },
    metrics: {
      totalRevenue,
      futureBookingsCount: sanitizedBookings.length,
      userShopsCount: allShops.length,
    },
    access: {
      isBlocked: false,
      isPro,
      isMainShop, // ✅ O front-end usará isso para ocultar o botão
    },
  }
}
