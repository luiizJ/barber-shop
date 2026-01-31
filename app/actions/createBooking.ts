"use server"

import { db } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { revalidatePath } from "next/cache"

interface CreateBookingParams {
  serviceId: string
  date: Date
}
export const createBooking = async ({
  serviceId,
  date,
}: CreateBookingParams) => {
  // 1. SEGURANÇA DE IDENTIDADE 👮
  // Pegamos o usuário direto da sessão  do servidor.
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error("Usuário não autenticado")
  }

  // 2. SEGURANÇA DE DADOS
  const service = await db.barberServices.findUnique({
    where: {
      id: serviceId,
    },
    include: {
      barberShop: true,
    },
  })

  if (!service) {
    throw new Error("Serviço não encontrado")
  }

  // 3. CRIAÇÃO BLINDADA
  await db.booking.create({
    data: {
      serviceId: service.id,
      userId: (session.user as any).id, // ID vem da sessão
      barberShopId: service.barberShop.id, // ID vem do banco (relação)
      date: date,
      price: service.price, // Preço vem do banco
    },
  })

  revalidatePath("/")
  revalidatePath("/bookings")
}
