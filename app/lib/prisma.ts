import { PrismaClient } from "@prisma/client"

declare global {
  var cachedPrisma: PrismaClient
}

let prismaClient: PrismaClient

if (process.env.NODE_ENV === "production") {
  prismaClient = new PrismaClient()
} else {
  if (!globalThis.cachedPrisma) {
    global.cachedPrisma = new PrismaClient()
  }
  prismaClient = global.cachedPrisma
}

export const db = prismaClient
