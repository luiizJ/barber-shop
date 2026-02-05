"use server"
import { db } from "@/app/lib/prisma"

export const getDashboardMetrics = async (userId: string) => {
  const [barberShop, userShopsCount] = await Promise.all([
    // 1. Busca os dados da loja principal
    db.barberShop.findFirst({
      where: { ownerId: userId },
      include: {
        services: true,
        bookings: {
          where: { date: { gte: new Date() } },
          orderBy: { date: "asc" },
          take: 5,
          include: { service: true, user: true },
        },
      },
    }),
    // 2. Conta quantas lojas o usuário tem (para o botão de Nova Filial)
    db.barberShop.count({
      where: { ownerId: userId },
    }),
  ])

  return { barberShop, userShopsCount }
}
