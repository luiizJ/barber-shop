"use server"

import { db } from "@/app/lib/prisma"
import { endOfDay, startOfDay } from "date-fns"

interface GetDayBookingsParams {
  barberShopId: string
  date: Date
}

export const getDayBookings = async ({
  barberShopId,
  date,
}: GetDayBookingsParams) => {
  const bookings = await db.booking.findMany({
    where: {
      barberShopId: barberShopId,
      date: {
        lte: endOfDay(date),
        gte: startOfDay(date),
      },
    },
    //  buscamos a data. O resto (user, price) fica oculto no banco.
    select: {
      date: true,
    },
  })

  return bookings
}
