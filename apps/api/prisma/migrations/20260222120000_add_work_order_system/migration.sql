-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetEmployees" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "dueDate" DATETIME,
    "audioFileUrl" TEXT,
    "audioFileName" TEXT,
    "audioDuration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkOrderConfirmation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workOrderId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "confirmedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    CONSTRAINT "WorkOrderConfirmation_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "WorkOrder_companyId_isActive_idx" ON "WorkOrder"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "WorkOrder_buyerId_isActive_idx" ON "WorkOrder"("buyerId", "isActive");

-- CreateIndex
CREATE INDEX "WorkOrder_createdAt_idx" ON "WorkOrder"("createdAt");

-- CreateIndex
CREATE INDEX "WorkOrder_priority_dueDate_idx" ON "WorkOrder"("priority", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrderConfirmation_workOrderId_employeeId_key" ON "WorkOrderConfirmation"("workOrderId", "employeeId");

-- CreateIndex
CREATE INDEX "WorkOrderConfirmation_workOrderId_idx" ON "WorkOrderConfirmation"("workOrderId");

-- CreateIndex
CREATE INDEX "WorkOrderConfirmation_employeeId_idx" ON "WorkOrderConfirmation"("employeeId");

-- CreateIndex
CREATE INDEX "WorkOrderConfirmation_userId_idx" ON "WorkOrderConfirmation"("userId");
