-- DropForeignKey
ALTER TABLE "PlayerGame" DROP CONSTRAINT "PlayerGame_gameId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerGame" DROP CONSTRAINT "PlayerGame_playerId_fkey";

-- AddForeignKey
ALTER TABLE "PlayerGame" ADD CONSTRAINT "PlayerGame_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGame" ADD CONSTRAINT "PlayerGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
