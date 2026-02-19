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
    "managerName" TEXT,
    "managerTitle" TEXT,
    "managerEmail" TEXT,
    "managerPhone" TEXT,
    "privacyAgreed" BOOLEAN NOT NULL DEFAULT false,
    "privacyAgreedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "companyType" TEXT,
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

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_refCode_key" ON "User"("refCode");

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
