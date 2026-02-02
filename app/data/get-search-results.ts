"use server"
import { db } from "@/app/lib/prisma"

interface SearchProps {
  search: string
}

export const getSearchResults = async ({ search }: SearchProps) => {
  const [barbershops, services] = await Promise.all([
    db.barberShop.findMany({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    }),
    db.barberServices.findMany({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      include: {
        barberShop: true,
      },
    }),
  ])

  return {
    barbershops,
    services,
  }
}
