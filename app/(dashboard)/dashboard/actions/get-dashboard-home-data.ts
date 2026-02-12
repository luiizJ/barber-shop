"use server"

import { db } from "@/app/lib/prisma"

// 👇 Mudança: Agora aceitamos o shopSlug como segundo argumento
export async function getDashboardHomeData(userId: string, shopSlug: string) {
  // 1. Buscamos todas as lojas do usuário (para o menu lateral)
  const allShops = await db.barberShop.findMany({
    where: { ownerId: userId },
    select: { id: true, name: true, slug: true, imageUrl: true },
  })

  if (allShops.length === 0) return null

  // 2. Buscamos a loja específica do slug que está na URL
  const barberShop = await db.barberShop.findUnique({
    where: { slug: shopSlug }, // 👈 Busca exata pelo nome na URL
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

  // 3. Sanitização e Cálculos (Sua lógica original preservada)
  const sanitizedBookings = barberShop.bookings.map((b) => ({
    ...b,
    price: Number(b.price),
    service: { ...b.service!, price: Number(b.service!.price) },
  }))

  const totalRevenue = sanitizedBookings.reduce(
    (acc, curr) => acc + curr.price,
    0,
  )

  // 4. Retorno completo para o componente
  return {
    allShops, // 👈 Enviamos a lista para o seletor
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
      isBlocked: false, // Adicione sua lógica de Stripe aqui se necessário
      isPro: barberShop.plan === "PRO",
    },
  }
}
