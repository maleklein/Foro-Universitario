-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Thread" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" JSONB NOT NULL DEFAULT [],
    "status" TEXT NOT NULL DEFAULT 'active',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "subforumId" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "movedFromId" TEXT,
    "closedReason" TEXT,
    "deletedReason" TEXT,
    "deletedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Thread_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Thread_subforumId_fkey" FOREIGN KEY ("subforumId") REFERENCES "Subforum" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Thread" ("authorId", "closedReason", "content", "createdAt", "deletedById", "deletedReason", "id", "movedFromId", "pinned", "slug", "status", "subforumId", "title", "updatedAt", "viewCount") SELECT "authorId", "closedReason", "content", "createdAt", "deletedById", "deletedReason", "id", "movedFromId", "pinned", "slug", "status", "subforumId", "title", "updatedAt", "viewCount" FROM "Thread";
DROP TABLE "Thread";
ALTER TABLE "new_Thread" RENAME TO "Thread";
CREATE UNIQUE INDEX "Thread_subforumId_slug_key" ON "Thread"("subforumId", "slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
