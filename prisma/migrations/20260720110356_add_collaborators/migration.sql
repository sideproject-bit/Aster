-- CreateTable
CREATE TABLE "WikiCollaborator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wikiId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WikiCollaborator_wikiId_fkey" FOREIGN KEY ("wikiId") REFERENCES "Wiki" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WikiCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WikiCollaborator_wikiId_userId_key" ON "WikiCollaborator"("wikiId", "userId");
