/*
  Warnings:

  - Added the required column `twoFaSecret` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twoFaEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "twoFaSecret" TEXT NOT NULL;
