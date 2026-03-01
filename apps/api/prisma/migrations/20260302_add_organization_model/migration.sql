-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "leaderName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Organization_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- AlterTable SalesPerson - Add organizationId
ALTER TABLE "SalesPerson" ADD COLUMN "organizationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_phone_key" ON "Organization"("phone");
CREATE INDEX "Organization_type_idx" ON "Organization"("type");
CREATE INDEX "Organization_parentId_idx" ON "Organization"("parentId");
CREATE INDEX "Organization_phone_idx" ON "Organization"("phone");
CREATE INDEX "Organization_isActive_idx" ON "Organization"("isActive");

-- CreateIndex
CREATE INDEX "SalesPerson_organizationId_idx" ON "SalesPerson"("organizationId");
