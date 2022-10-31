-- CreateTable
CREATE TABLE "PlayStats" (
    "userId" TEXT NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "achievement_point" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayStats_userId_key" ON "PlayStats"("userId");

-- AddForeignKey
ALTER TABLE "PlayStats" ADD CONSTRAINT "PlayStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
