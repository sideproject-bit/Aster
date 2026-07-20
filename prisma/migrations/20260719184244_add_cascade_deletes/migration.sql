-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wikiId" TEXT NOT NULL,
    "parentId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isFolder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Document_wikiId_fkey" FOREIGN KEY ("wikiId") REFERENCES "Wiki" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Document" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("content", "createdAt", "id", "isFolder", "isPublic", "order", "parentId", "slug", "status", "title", "updatedAt", "wikiId") SELECT "content", "createdAt", "id", "isFolder", "isPublic", "order", "parentId", "slug", "status", "title", "updatedAt", "wikiId" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE UNIQUE INDEX "Document_wikiId_slug_key" ON "Document"("wikiId", "slug");
CREATE TABLE "new_Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wikiId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tag_wikiId_fkey" FOREIGN KEY ("wikiId") REFERENCES "Wiki" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Tag" ("color", "createdAt", "id", "name", "wikiId") SELECT "color", "createdAt", "id", "name", "wikiId" FROM "Tag";
DROP TABLE "Tag";
ALTER TABLE "new_Tag" RENAME TO "Tag";
CREATE UNIQUE INDEX "Tag_wikiId_name_key" ON "Tag"("wikiId", "name");
CREATE TABLE "new_Wiki" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Wiki_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Wiki" ("createdAt", "id", "isPublic", "ownerId", "title") SELECT "createdAt", "id", "isPublic", "ownerId", "title" FROM "Wiki";
DROP TABLE "Wiki";
ALTER TABLE "new_Wiki" RENAME TO "Wiki";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
