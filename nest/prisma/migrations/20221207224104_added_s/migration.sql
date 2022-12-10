/*
  Warnings:

  - You are about to drop the column `achievement_point` on the `PlayStats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PlayStats" DROP COLUMN "achievement_point",
ADD COLUMN     "achievement_points" INTEGER NOT NULL DEFAULT 0;
