"use server"
import { getServerSession } from "next-auth"
import { db } from "../lib/prisma"
import { authOptions } from "../lib/auth"

export const getConfirmedBookings = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []

  return await db.booking.findMany({
    where: {
      userId: (session.user as any).id,
      date: {
        gte: new Date(),
      },
    },
    include: {
      service: {
        include: { barberShop: true },
      },
    },
    orderBy: {
      date: "asc",
    },
  })
}
