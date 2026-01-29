import { db } from "@/app/lib/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import type { Adapter } from "next-auth/adapters"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // ...add more providers here
  ],
}

export default NextAuth(authOptions)
