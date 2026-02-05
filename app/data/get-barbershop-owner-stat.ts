"use server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { db } from "@/app/lib/prisma"

export const getBarbershopOwnerState = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return false
  }

  // Busca rápida apenas para saber se existe (select id economiza dados)
  const shop = await db.barberShop.findFirst({
    where: {
      ownerId: session.user.id,
    },
    select: {
      id: true,
    },
  })

  return !!shop
}
