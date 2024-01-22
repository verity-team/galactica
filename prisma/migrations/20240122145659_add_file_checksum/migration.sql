/*
  Warnings:

  - Added the required column `fileHash` to the `MemeUpload` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MemeUpload" ADD COLUMN     "fileHash" TEXT NOT NULL;
