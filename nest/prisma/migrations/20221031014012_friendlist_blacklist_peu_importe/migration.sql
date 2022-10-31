/*
  Warnings:

  - You are about to drop the column `blackListId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `friendListId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `BlackList` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FriendList` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_blackListId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_friendListId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "blackListId",
DROP COLUMN "friendListId";

-- DropTable
DROP TABLE "BlackList";

-- DropTable
DROP TABLE "FriendList";

-- CreateTable
CREATE TABLE "_friendList" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_blacklist" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_friendList_AB_unique" ON "_friendList"("A", "B");

-- CreateIndex
CREATE INDEX "_friendList_B_index" ON "_friendList"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_blacklist_AB_unique" ON "_blacklist"("A", "B");

-- CreateIndex
CREATE INDEX "_blacklist_B_index" ON "_blacklist"("B");

-- AddForeignKey
ALTER TABLE "_friendList" ADD CONSTRAINT "_friendList_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friendList" ADD CONSTRAINT "_friendList_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blacklist" ADD CONSTRAINT "_blacklist_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blacklist" ADD CONSTRAINT "_blacklist_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
