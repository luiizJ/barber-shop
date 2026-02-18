/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `BarberShop` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionStatus` on the `BarberShop` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "BarberShop" DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripeSubscriptionStatus";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionStatus" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
