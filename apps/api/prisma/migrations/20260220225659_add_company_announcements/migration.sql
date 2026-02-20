-- CreateTable
CREATE TABLE "CompanyAnnouncement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AnnouncementReadLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "announcementId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnnouncementReadLog_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "CompanyAnnouncement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CompanyAnnouncement_companyId_isActive_idx" ON "CompanyAnnouncement"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "CompanyAnnouncement_buyerId_isActive_idx" ON "CompanyAnnouncement"("buyerId", "isActive");

-- CreateIndex
CREATE INDEX "CompanyAnnouncement_createdAt_idx" ON "CompanyAnnouncement"("createdAt");

-- CreateIndex
CREATE INDEX "AnnouncementReadLog_announcementId_idx" ON "AnnouncementReadLog"("announcementId");

-- CreateIndex
CREATE INDEX "AnnouncementReadLog_employeeId_idx" ON "AnnouncementReadLog"("employeeId");

-- CreateIndex
CREATE INDEX "AnnouncementReadLog_userId_idx" ON "AnnouncementReadLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementReadLog_announcementId_employeeId_key" ON "AnnouncementReadLog"("announcementId", "employeeId");
