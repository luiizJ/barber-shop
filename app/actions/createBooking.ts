"use server"

import { db } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { revalidatePath } from "next/cache"
import type { PaymentMethod } from "@prisma/client"
import { subMinutes } from "date-fns"

interface CreateBookingParams {
  serviceId: string
  date: Date
  paymentMethod: PaymentMethod
}

export const createBooking = async ({
  serviceId,
  date,
  paymentMethod,
}: CreateBookingParams) => {
  // 1. SEGURANÇA DE IDENTIDADE 👮
  // Pegamos o usuário direto da sessão do servidor.
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error("Usuário não autenticado")
  }

  // 2. NOVO: RATE LIMIT (ANTI-SPAM)
  // Verifica se existe algum agendamento criado por esse ID no último 1 minuto.
  const checkLastBooking = await db.booking.findFirst({
    where: {
      userId: (session.user as any).id,
      createdAt: {
        gte: subMinutes(new Date(), 1), // "Maior ou igual a 1 minuto atrás"
      },
    },
  })

  // Se encontrou, a gente aborta a missão aqui mesmo.
  if (checkLastBooking) {
    throw new Error("Aguarde um momento antes de realizar outro agendamento.")
  }
  //  FIM DA PROTEÇÃO

  // 3. SEGURANÇA DE DADOS (Verifica se o serviço existe mesmo)
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

  // 4. CRIAÇÃO BLINDADA
  await db.booking.create({
    data: {
      serviceId: service.id,
      userId: (session.user as any).id,
      barberShopId: service.barberShop.id,
      date: date,
      price: service.price,
      paymentMethod: paymentMethod,
      status: "CONFIRMED",
    },
  })

  revalidatePath("/")
  revalidatePath("/bookings")
}
