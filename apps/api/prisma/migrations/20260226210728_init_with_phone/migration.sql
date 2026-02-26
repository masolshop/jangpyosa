-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "branchId" TEXT,
    "refCode" TEXT,
    "referredById" TEXT,
    "companyId" TEXT,
    "isCompanyOwner" BOOLEAN NOT NULL DEFAULT false,
    "managerName" TEXT,
    "managerTitle" TEXT,
    "managerEmail" TEXT,
    "managerPhone" TEXT,
    "employeeId" TEXT,
    "companyBizNo" TEXT,
    "privacyAgreed" BOOLEAN NOT NULL DEFAULT false,
    "privacyAgreedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "companyType" TEXT,
    CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "region" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "bizNo" TEXT NOT NULL,
    "representative" TEXT,
    "type" TEXT NOT NULL,
    "buyerType" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "apickData" TEXT,
    "ownerUserId" TEXT NOT NULL,
    "attachmentEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Company_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupplierRegistry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "certNo" TEXT,
    "name" TEXT NOT NULL,
    "bizNo" TEXT NOT NULL,
    "region" TEXT,
    "representative" TEXT,
    "address" TEXT,
    "certDate" TEXT,
    "contactTel" TEXT,
    "industry" TEXT,
    "companyType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SupplierProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "region" TEXT,
    "industry" TEXT,
    "contactName" TEXT,
    "contactTel" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "contractDescription" TEXT,
    "minContractAmount" INTEGER,
    "maxContractAmount" INTEGER,
    "image1" TEXT,
    "image2" TEXT,
    "image3" TEXT,
    "image4" TEXT,
    "image5" TEXT,
    "detailPageContent" TEXT,
    "registryBizNo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupplierProfile_registryBizNo_fkey" FOREIGN KEY ("registryBizNo") REFERENCES "SupplierRegistry" ("bizNo") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SupplierProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuyerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "employeeCount" INTEGER NOT NULL DEFAULT 0,
    "disabledCount" INTEGER NOT NULL DEFAULT 0,
    "yearlyEmployeesJson" TEXT,
    "hasLevyExemption" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BuyerProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonthlyEmployeeData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalEmployeeCount" INTEGER NOT NULL DEFAULT 0,
    "disabledCount" INTEGER NOT NULL DEFAULT 0,
    "recognizedCount" REAL NOT NULL DEFAULT 0,
    "obligatedCount" INTEGER NOT NULL DEFAULT 0,
    "shortfallCount" INTEGER NOT NULL DEFAULT 0,
    "surplusCount" REAL NOT NULL DEFAULT 0,
    "levy" INTEGER NOT NULL DEFAULT 0,
    "incentive" INTEGER NOT NULL DEFAULT 0,
    "netAmount" INTEGER NOT NULL DEFAULT 0,
    "detailJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MonthlyEmployeeData_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplierId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "minOrderQty" INTEGER NOT NULL DEFAULT 1,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 7,
    "deliveryCycle" TEXT,
    "spec" TEXT,
    "processDescription" TEXT,
    "contractMinMonths" INTEGER NOT NULL DEFAULT 12,
    "vatIncluded" BOOLEAN NOT NULL DEFAULT true,
    "shippingIncluded" BOOLEAN NOT NULL DEFAULT false,
    "extraCostNote" TEXT,
    "inspectionCriteria" TEXT,
    "defectPolicy" TEXT,
    "invoiceAvailable" BOOLEAN NOT NULL DEFAULT true,
    "quoteLeadTimeDays" INTEGER NOT NULL DEFAULT 3,
    "thumbnailUrl" TEXT,
    "imageUrls" TEXT,
    "keywords" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "noSubcontractConfirm" BOOLEAN NOT NULL DEFAULT false,
    "monthlyDeliverySchedule" TEXT,
    "monthlyBillingBasis" TEXT,
    "monthlyBillingDay" INTEGER NOT NULL DEFAULT 31,
    "monthlyPaymentDay" INTEGER NOT NULL DEFAULT 10,
    "monthlyFixedAmount" INTEGER,
    "monthlyAmountNote" TEXT,
    "costBreakdownJson" TEXT,
    "evidenceMethods" TEXT,
    "invoiceIssueConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "receiptNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cart_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContractRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "requirements" TEXT,
    "durationMonths" INTEGER,
    "buyerAcceptedRiskDisclosure" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContractRequest_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ContractRequest_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "YearSetting" (
    "year" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "privateQuotaRate" REAL NOT NULL,
    "publicQuotaRate" REAL NOT NULL,
    "baseLevyAmount" INTEGER NOT NULL,
    "maxReductionRate" REAL NOT NULL DEFAULT 0.9,
    "maxReductionByContract" REAL NOT NULL DEFAULT 0.5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Page" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "contentMd" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DisabledEmployee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "registrationNumber" TEXT,
    "disabilityType" TEXT NOT NULL,
    "disabilityGrade" TEXT,
    "severity" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthDate" DATETIME,
    "hireDate" DATETIME NOT NULL,
    "resignDate" DATETIME,
    "monthlySalary" INTEGER NOT NULL,
    "hasEmploymentInsurance" BOOLEAN NOT NULL DEFAULT true,
    "meetsMinimumWage" BOOLEAN NOT NULL DEFAULT true,
    "workHoursPerWeek" INTEGER,
    "monthlyWorkHours" INTEGER,
    "workType" TEXT NOT NULL DEFAULT 'OFFICE',
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DisabledEmployee_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Calculation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "type" TEXT NOT NULL,
    "resultJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Calculation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractNo" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "contractName" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "monthlyAmount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "paymentTerms" TEXT,
    "contractFileUrl" TEXT,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contract_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contract_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonthlyPerformance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "plannedAmount" INTEGER NOT NULL,
    "actualAmount" INTEGER,
    "performanceRate" REAL,
    "description" TEXT,
    "evidenceFileUrls" TEXT,
    "inspectionStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "inspectionDate" DATETIME,
    "inspectionNotes" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "paymentAmount" INTEGER,
    "paymentDate" DATETIME,
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "invoiceNo" TEXT,
    "invoiceDate" DATETIME,
    "invoiceFileUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MonthlyPerformance_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "performanceId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentDate" DATETIME NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "memo" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "workType" TEXT NOT NULL,
    "clockIn" TEXT,
    "clockOut" TEXT,
    "workHours" REAL,
    "location" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AttendanceRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "DisabledEmployee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CompanyAnnouncement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnnouncementReadLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "announcementId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnnouncementReadLog_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "CompanyAnnouncement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamInvitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "companyType" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "inviteeName" TEXT,
    "inviteePhone" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedBy" TEXT,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamInvitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamInvitation_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "targetName" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuoteInquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT,
    "bizNo" TEXT,
    "category" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER,
    "budget" TEXT,
    "timeline" TEXT,
    "requirements" TEXT,
    "attachmentUrls" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "respondedAt" DATETIME,
    "respondedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "targetType" TEXT NOT NULL,
    "targetEmployees" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" DATETIME,
    "attachmentUrls" TEXT,
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
CREATE TABLE "WorkOrderRecipient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workOrderId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "WorkOrderConfirmation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workOrderId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "confirmedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "data" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LeaveType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "requiresDocument" BOOLEAN NOT NULL DEFAULT false,
    "maxDaysPerYear" INTEGER,
    "isPaid" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LeaveType_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "leaveTypeId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "days" REAL NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "documentSent" BOOLEAN NOT NULL DEFAULT false,
    "documentNote" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "reviewNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LeaveRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LeaveRequest_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_refCode_key" ON "User"("refCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "User"("companyId");

-- CreateIndex
CREATE INDEX "User_isCompanyOwner_idx" ON "User"("isCompanyOwner");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_name_key" ON "Branch"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_code_key" ON "Branch"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Company_bizNo_key" ON "Company"("bizNo");

-- CreateIndex
CREATE UNIQUE INDEX "Company_ownerUserId_key" ON "Company"("ownerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierRegistry_bizNo_key" ON "SupplierRegistry"("bizNo");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierProfile_companyId_key" ON "SupplierProfile"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerProfile_companyId_key" ON "BuyerProfile"("companyId");

-- CreateIndex
CREATE INDEX "MonthlyEmployeeData_buyerId_year_idx" ON "MonthlyEmployeeData"("buyerId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyEmployeeData_buyerId_year_month_key" ON "MonthlyEmployeeData"("buyerId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_buyerId_key" ON "Cart"("buyerId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_key" ON "CartItem"("cartId", "productId");

-- CreateIndex
CREATE INDEX "DisabledEmployee_buyerId_resignDate_idx" ON "DisabledEmployee"("buyerId", "resignDate");

-- CreateIndex
CREATE INDEX "Calculation_buyerId_year_month_type_idx" ON "Calculation"("buyerId", "year", "month", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_contractNo_key" ON "Contract"("contractNo");

-- CreateIndex
CREATE INDEX "Contract_buyerId_status_idx" ON "Contract"("buyerId", "status");

-- CreateIndex
CREATE INDEX "Contract_supplierId_status_idx" ON "Contract"("supplierId", "status");

-- CreateIndex
CREATE INDEX "Contract_startDate_endDate_idx" ON "Contract"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "MonthlyPerformance_contractId_year_month_idx" ON "MonthlyPerformance"("contractId", "year", "month");

-- CreateIndex
CREATE INDEX "MonthlyPerformance_inspectionStatus_paymentStatus_idx" ON "MonthlyPerformance"("inspectionStatus", "paymentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyPerformance_contractId_year_month_key" ON "MonthlyPerformance"("contractId", "year", "month");

-- CreateIndex
CREATE INDEX "PaymentHistory_performanceId_idx" ON "PaymentHistory"("performanceId");

-- CreateIndex
CREATE INDEX "PaymentHistory_paymentDate_idx" ON "PaymentHistory"("paymentDate");

-- CreateIndex
CREATE INDEX "AttendanceRecord_employeeId_date_idx" ON "AttendanceRecord"("employeeId", "date");

-- CreateIndex
CREATE INDEX "AttendanceRecord_companyId_date_idx" ON "AttendanceRecord"("companyId", "date");

-- CreateIndex
CREATE INDEX "AttendanceRecord_buyerId_date_idx" ON "AttendanceRecord"("buyerId", "date");

-- CreateIndex
CREATE INDEX "AttendanceRecord_userId_idx" ON "AttendanceRecord"("userId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_date_idx" ON "AttendanceRecord"("date");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_employeeId_date_key" ON "AttendanceRecord"("employeeId", "date");

-- CreateIndex
CREATE INDEX "CompanyAnnouncement_companyId_isActive_idx" ON "CompanyAnnouncement"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "CompanyAnnouncement_buyerId_isActive_idx" ON "CompanyAnnouncement"("buyerId", "isActive");

-- CreateIndex
CREATE INDEX "CompanyAnnouncement_createdAt_idx" ON "CompanyAnnouncement"("createdAt");

-- CreateIndex
CREATE INDEX "AnnouncementReadLog_announcementId_idx" ON "AnnouncementReadLog"("announcementId");

-- CreateIndex
CREATE INDEX "AnnouncementReadLog_companyId_idx" ON "AnnouncementReadLog"("companyId");

-- CreateIndex
CREATE INDEX "AnnouncementReadLog_buyerId_idx" ON "AnnouncementReadLog"("buyerId");

-- CreateIndex
CREATE INDEX "AnnouncementReadLog_employeeId_idx" ON "AnnouncementReadLog"("employeeId");

-- CreateIndex
CREATE INDEX "AnnouncementReadLog_userId_idx" ON "AnnouncementReadLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementReadLog_announcementId_employeeId_key" ON "AnnouncementReadLog"("announcementId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamInvitation_inviteCode_key" ON "TeamInvitation"("inviteCode");

-- CreateIndex
CREATE INDEX "TeamInvitation_inviteCode_idx" ON "TeamInvitation"("inviteCode");

-- CreateIndex
CREATE INDEX "TeamInvitation_companyId_idx" ON "TeamInvitation"("companyId");

-- CreateIndex
CREATE INDEX "TeamInvitation_expiresAt_isUsed_idx" ON "TeamInvitation"("expiresAt", "isUsed");

-- CreateIndex
CREATE INDEX "ActivityLog_companyId_createdAt_idx" ON "ActivityLog"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");

-- CreateIndex
CREATE INDEX "ActivityLog_targetType_targetId_idx" ON "ActivityLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "QuoteInquiry_status_createdAt_idx" ON "QuoteInquiry"("status", "createdAt");

-- CreateIndex
CREATE INDEX "QuoteInquiry_category_idx" ON "QuoteInquiry"("category");

-- CreateIndex
CREATE INDEX "QuoteInquiry_contactPhone_idx" ON "QuoteInquiry"("contactPhone");

-- CreateIndex
CREATE INDEX "WorkOrder_companyId_isActive_idx" ON "WorkOrder"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "WorkOrder_buyerId_isActive_idx" ON "WorkOrder"("buyerId", "isActive");

-- CreateIndex
CREATE INDEX "WorkOrder_createdAt_idx" ON "WorkOrder"("createdAt");

-- CreateIndex
CREATE INDEX "WorkOrder_priority_dueDate_idx" ON "WorkOrder"("priority", "dueDate");

-- CreateIndex
CREATE INDEX "WorkOrder_status_idx" ON "WorkOrder"("status");

-- CreateIndex
CREATE INDEX "WorkOrderRecipient_workOrderId_idx" ON "WorkOrderRecipient"("workOrderId");

-- CreateIndex
CREATE INDEX "WorkOrderRecipient_companyId_idx" ON "WorkOrderRecipient"("companyId");

-- CreateIndex
CREATE INDEX "WorkOrderRecipient_buyerId_idx" ON "WorkOrderRecipient"("buyerId");

-- CreateIndex
CREATE INDEX "WorkOrderRecipient_employeeId_idx" ON "WorkOrderRecipient"("employeeId");

-- CreateIndex
CREATE INDEX "WorkOrderRecipient_userId_idx" ON "WorkOrderRecipient"("userId");

-- CreateIndex
CREATE INDEX "WorkOrderRecipient_status_idx" ON "WorkOrderRecipient"("status");

-- CreateIndex
CREATE INDEX "WorkOrderRecipient_adminApproval_idx" ON "WorkOrderRecipient"("adminApproval");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrderRecipient_workOrderId_employeeId_key" ON "WorkOrderRecipient"("workOrderId", "employeeId");

-- CreateIndex
CREATE INDEX "WorkOrderConfirmation_workOrderId_idx" ON "WorkOrderConfirmation"("workOrderId");

-- CreateIndex
CREATE INDEX "WorkOrderConfirmation_companyId_idx" ON "WorkOrderConfirmation"("companyId");

-- CreateIndex
CREATE INDEX "WorkOrderConfirmation_buyerId_idx" ON "WorkOrderConfirmation"("buyerId");

-- CreateIndex
CREATE INDEX "WorkOrderConfirmation_employeeId_idx" ON "WorkOrderConfirmation"("employeeId");

-- CreateIndex
CREATE INDEX "WorkOrderConfirmation_userId_idx" ON "WorkOrderConfirmation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrderConfirmation_workOrderId_employeeId_key" ON "WorkOrderConfirmation"("workOrderId", "employeeId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "LeaveType_companyId_isActive_idx" ON "LeaveType"("companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveType_companyId_name_key" ON "LeaveType"("companyId", "name");

-- CreateIndex
CREATE INDEX "LeaveRequest_companyId_status_idx" ON "LeaveRequest"("companyId", "status");

-- CreateIndex
CREATE INDEX "LeaveRequest_buyerId_status_idx" ON "LeaveRequest"("buyerId", "status");

-- CreateIndex
CREATE INDEX "LeaveRequest_employeeId_status_idx" ON "LeaveRequest"("employeeId", "status");

-- CreateIndex
CREATE INDEX "LeaveRequest_userId_idx" ON "LeaveRequest"("userId");

-- CreateIndex
CREATE INDEX "LeaveRequest_startDate_endDate_idx" ON "LeaveRequest"("startDate", "endDate");
