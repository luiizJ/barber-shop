"use server"

import { db } from "@/app/lib/prisma"

export async function getSettingsData(userId: string) {
  const shop = await db.barberShop.findFirst({
    where: { ownerId: userId },
  })

  return shop
}
