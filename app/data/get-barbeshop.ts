"use server"
import { db } from "@/app/lib/prisma"

interface GetBarberShopProps {
  slug: string
}

export const getBarberShop = async ({ slug }: GetBarberShopProps) => {
  const barbershop = await db.barberShop.findUnique({
    where: {
      slug: slug,
    },
    include: {
      services: true,
    },
  })

  return barbershop
}
