"use server"

import { db } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { revalidatePath } from "next/cache"
import { BookingStatus } from "@prisma/client"

// 1. SALVAR AGENDAMENTO (Cria o horário)
export async function saveBooking(params: {
  barberShopId: string
  serviceId: string
  userId: string
  date: Date
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Usuário não autenticado")

  // Busca o serviço para garantir o preço REAL
  const service = await db.barberServices.findUnique({
    where: { id: params.serviceId },
  })

  if (!service) throw new Error("Serviço não encontrado")

  // Verifica disponibilidade (Se tiver CANCELLED, o horário está livre!)
  const alreadyBooked = await db.booking.findFirst({
    where: {
      barberShopId: params.barberShopId,
      date: params.date,
      status: { not: "CANCELLED" },
    },
  })

  if (alreadyBooked) throw new Error("Horário indisponível.")

  await db.booking.create({
    data: {
      serviceId: params.serviceId,
      userId: params.userId,
      barberShopId: params.barberShopId,
      date: params.date,
      barberId: session.user.id,
      price: service.price,
      status: "CONFIRMED",
    },
  })

  revalidatePath("/bookings")
  revalidatePath("/dashboard")
}

// 2. ATUALIZAR STATUS (A Mágica do Lucro Real)
// É essa função aqui que vai permitir você cancelar o cliente
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Não autorizado")

  // Busca o agendamento e a loja para ver se o usuário é o dono
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      barberShop: true,
    },
  })

  if (!booking) throw new Error("Agendamento não encontrado")

  // Verificação de Segurança: Só o Dono pode mexer no status
  if (booking.barberShop.ownerId !== session.user.id) {
    throw new Error("Você não tem permissão para alterar este agendamento.")
  }

  // Atualiza o status no banco
  await db.booking.update({
    where: { id: bookingId },
    data: { status: status },
  })

  // Atualiza o dashboard para recalcular o faturamento
  revalidatePath("/dashboard")
}
