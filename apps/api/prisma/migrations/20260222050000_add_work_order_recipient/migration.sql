-- AlterTable WorkOrder 필드 추가
ALTER TABLE "WorkOrder" ADD COLUMN "description" TEXT;
ALTER TABLE "WorkOrder" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "WorkOrder" ADD COLUMN "attachmentUrls" TEXT;

-- CreateTable WorkOrderRecipient
CREATE TABLE "WorkOrderRecipient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workOrderId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "completionReport" TEXT,
    "rejectionReason" TEXT,
    "adminApproval" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "approvedAt" DATETIME,
    "approvedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkOrderRecipient_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "WorkOrder_status_idx" ON "WorkOrder"("status");
CREATE UNIQUE INDEX "WorkOrderRecipient_workOrderId_employeeId_key" ON "WorkOrderRecipient"("workOrderId", "employeeId");
CREATE INDEX "WorkOrderRecipient_workOrderId_idx" ON "WorkOrderRecipient"("workOrderId");
CREATE INDEX "WorkOrderRecipient_employeeId_idx" ON "WorkOrderRecipient"("employeeId");
CREATE INDEX "WorkOrderRecipient_userId_idx" ON "WorkOrderRecipient"("userId");
CREATE INDEX "WorkOrderRecipient_status_idx" ON "WorkOrderRecipient"("status");
CREATE INDEX "WorkOrderRecipient_adminApproval_idx" ON "WorkOrderRecipient"("adminApproval");
