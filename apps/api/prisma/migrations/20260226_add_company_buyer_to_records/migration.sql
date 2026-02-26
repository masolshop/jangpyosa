-- AlterTable: AttendanceRecord - Add companyId, buyerId, userId
ALTER TABLE "AttendanceRecord" ADD COLUMN "companyId" TEXT;
ALTER TABLE "AttendanceRecord" ADD COLUMN "buyerId" TEXT;
ALTER TABLE "AttendanceRecord" ADD COLUMN "userId" TEXT;

-- AlterTable: LeaveRequest - Add buyerId
ALTER TABLE "LeaveRequest" ADD COLUMN "buyerId" TEXT;

-- AlterTable: AnnouncementReadLog - Add companyId, buyerId
ALTER TABLE "AnnouncementReadLog" ADD COLUMN "companyId" TEXT;
ALTER TABLE "AnnouncementReadLog" ADD COLUMN "buyerId" TEXT;

-- AlterTable: WorkOrderRecipient - Add companyId, buyerId
ALTER TABLE "WorkOrderRecipient" ADD COLUMN "companyId" TEXT;
ALTER TABLE "WorkOrderRecipient" ADD COLUMN "buyerId" TEXT;

-- AlterTable: WorkOrderConfirmation - Add companyId, buyerId
ALTER TABLE "WorkOrderConfirmation" ADD COLUMN "companyId" TEXT;
ALTER TABLE "WorkOrderConfirmation" ADD COLUMN "buyerId" TEXT;

-- CreateIndex
CREATE INDEX "AttendanceRecord_companyId_idx" ON "AttendanceRecord"("companyId");
CREATE INDEX "AttendanceRecord_buyerId_idx" ON "AttendanceRecord"("buyerId");
CREATE INDEX "AttendanceRecord_userId_idx" ON "AttendanceRecord"("userId");

CREATE INDEX "LeaveRequest_buyerId_idx" ON "LeaveRequest"("buyerId");

CREATE INDEX "AnnouncementReadLog_companyId_idx" ON "AnnouncementReadLog"("companyId");
CREATE INDEX "AnnouncementReadLog_buyerId_idx" ON "AnnouncementReadLog"("buyerId");

CREATE INDEX "WorkOrderRecipient_companyId_idx" ON "WorkOrderRecipient"("companyId");
CREATE INDEX "WorkOrderRecipient_buyerId_idx" ON "WorkOrderRecipient"("buyerId");

CREATE INDEX "WorkOrderConfirmation_companyId_idx" ON "WorkOrderConfirmation"("companyId");
CREATE INDEX "WorkOrderConfirmation_buyerId_idx" ON "WorkOrderConfirmation"("buyerId");
