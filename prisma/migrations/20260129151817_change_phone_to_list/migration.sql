/*
  Warnings:

  - You are about to drop the column `phone` on the `BarberShop` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BarberShop" DROP COLUMN "phone",
ADD COLUMN     "phones" TEXT[];
