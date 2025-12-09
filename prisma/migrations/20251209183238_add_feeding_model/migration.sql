-- CreateTable
CREATE TABLE "Feeding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "endedAt" DATETIME NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Feeding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeedingTags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "feedingId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    CONSTRAINT "FeedingTags_feedingId_fkey" FOREIGN KEY ("feedingId") REFERENCES "Feeding" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Feeding_userId_idx" ON "Feeding"("userId");

-- CreateIndex
CREATE INDEX "Feeding_createdAt_idx" ON "Feeding"("createdAt");
