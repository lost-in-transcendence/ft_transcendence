/*
  Warnings:

  - Added the required column `score` to the `PlayerGame` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlayerGame" ADD COLUMN     "score" INTEGER NOT NULL;
