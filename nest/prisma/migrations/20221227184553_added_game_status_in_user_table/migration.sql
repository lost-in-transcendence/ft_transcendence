-- CreateEnum
CREATE TYPE "GameStatusType" AS ENUM ('NONE', 'WAITING', 'INGAME');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gameStatus" "GameStatusType" NOT NULL DEFAULT 'NONE';
