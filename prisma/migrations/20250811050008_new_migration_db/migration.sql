/*
  Warnings:

  - Added the required column `contact` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scrapCategory` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleTypeId` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."LeadStatus" ADD VALUE 'NEW';
ALTER TYPE "public"."LeadStatus" ADD VALUE 'CONTACTED';
ALTER TYPE "public"."LeadStatus" ADD VALUE 'QUALIFIED';

-- AlterTable
ALTER TABLE "public"."Customer" ADD COLUMN     "contact" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "scrapCategory" "public"."ScrapCategory" NOT NULL,
ADD COLUMN     "status" "public"."CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "vehicleTypeId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_vehicleTypeId_fkey" FOREIGN KEY ("vehicleTypeId") REFERENCES "public"."VehicleType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
