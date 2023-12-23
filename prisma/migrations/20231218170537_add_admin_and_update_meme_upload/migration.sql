/*
  Warnings:

  - Added the required column `status` to the `MemeUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expirationTime` to the `Nonce` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MemeUploadStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- AlterTable
ALTER TABLE "MemeUpload" ADD COLUMN     "status" "MemeUploadStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Nonce" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expirationTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Admin" (
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("username")
);
