-- DropForeignKey
ALTER TABLE "PlayStats" DROP CONSTRAINT "PlayStats_userId_fkey";

-- AddForeignKey
ALTER TABLE "PlayStats" ADD CONSTRAINT "PlayStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
