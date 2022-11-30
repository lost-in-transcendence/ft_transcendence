/*
  Warnings:

  - Made the column `channelName` on table `Channel` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Channel_channelName_key";

-- AlterTable
ALTER TABLE "Channel" ALTER COLUMN "channelName" SET NOT NULL;
