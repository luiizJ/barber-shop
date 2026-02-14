/*
  Warnings:

  - The `stripeSubscriptionStatus` column on the `BarberShop` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "BarberShopPlan" AS ENUM ('START', 'PRO');

-- DropForeignKey
ALTER TABLE "BarberServices" DROP CONSTRAINT "BarberServices_barberShopId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_barberShopId_fkey";

-- AlterTable
ALTER TABLE "BarberServices" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "BarberShop" ADD COLUMN     "lastMenuUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "plan" "BarberShopPlan" NOT NULL DEFAULT 'START',
ADD COLUMN     "trialEndsAt" TIMESTAMP(3),
DROP COLUMN "stripeSubscriptionStatus",
ADD COLUMN     "stripeSubscriptionStatus" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "barberId" TEXT;

-- CreateTable
CREATE TABLE "Barber" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "commissionRate" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "barberShopId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Barber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarberShopOpeningHours" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "barberShopId" TEXT NOT NULL,

    CONSTRAINT "BarberShopOpeningHours_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Barber" ADD CONSTRAINT "Barber_barberShopId_fkey" FOREIGN KEY ("barberShopId") REFERENCES "BarberShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarberShopOpeningHours" ADD CONSTRAINT "BarberShopOpeningHours_barberShopId_fkey" FOREIGN KEY ("barberShopId") REFERENCES "BarberShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarberServices" ADD CONSTRAINT "BarberServices_barberShopId_fkey" FOREIGN KEY ("barberShopId") REFERENCES "BarberShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_barberShopId_fkey" FOREIGN KEY ("barberShopId") REFERENCES "BarberShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE SET NULL ON UPDATE CASCADE;
