-- AlterTable
ALTER TABLE "ChannelMember" ADD COLUMN     "timeJoined" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PlayStats" ALTER COLUMN "wins" SET DEFAULT 0,
ALTER COLUMN "losses" SET DEFAULT 0,
ALTER COLUMN "rank" SET DEFAULT 0,
ALTER COLUMN "points" SET DEFAULT 0,
ALTER COLUMN "achievement_point" SET DEFAULT 0;
