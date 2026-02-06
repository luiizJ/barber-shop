"use server"

import { db } from "@/app/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"

export const getCalendarData = async (userId: string, dateParam?: string) => {
  // 1. Busca a loja do usuário
  const shop = await db.barberShop.findFirst({
    where: { ownerId: userId },
    select: { id: true },
  })

  if (!shop) return null

  // 2. QUERY: Datas com Agendamento
  const bookingsDates = await db.booking.findMany({
    where: {
      barberShopId: shop.id,
      date: { gte: new Date() },
      status: { not: "CANCELLED" },
    },
    select: { date: true },
  })

  const bookedDatesList = bookingsDates.map((b) => b.date)

  // 3. QUERY: Detalhes do Dia Selecionado
  // Se não tiver data na URL, assume hoje
  const selectedDate = dateParam
    ? new Date(`${dateParam}T00:00:00`)
    : new Date()

  const dayBookings = await db.booking.findMany({
    where: {
      barberShopId: shop.id,
      date: {
        gte: startOfDay(selectedDate),
        lte: endOfDay(selectedDate),
      },
    },
    include: {
      service: {
        include: {
          barberShop: true,
        },
      },
      user: true,
    },
    orderBy: {
      date: "asc",
    },
  })
  // 3. SERIALIZAÇÃO (A CORREÇÃO De ERRO)
  // Convertemos o "Decimal" do Prisma para "Number" simples
  const sanitizedBookings = dayBookings.map((booking) => ({
    ...booking,
    price: Number(booking.price), // Decimal -> Number
    service: {
      ...booking.service,
      price: Number(booking.service.price), // Decimal -> Number
    },
  }))

  // 4. Separação Lógica (Confirmados vs Cancelados)
  const confirmedBookings = sanitizedBookings.filter(
    (b) => b.status !== "CANCELLED",
  )
  const cancelledBookings = sanitizedBookings.filter(
    (b) => b.status === "CANCELLED",
  )

  return {
    shopId: shop.id,
    bookedDatesList,
    selectedDate,
    dayBookings: sanitizedBookings,
    confirmedBookings,
    cancelledBookings,
  }
}
