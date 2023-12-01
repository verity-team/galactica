/*
  Warnings:

  - You are about to drop the `Dummy` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Dummy";

-- CreateTable
CREATE TABLE "Nonce" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Nonce_pkey" PRIMARY KEY ("id")
);
