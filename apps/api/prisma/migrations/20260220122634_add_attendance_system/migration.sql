-- AlterTable: User에 직원 계정 관련 필드 추가
ALTER TABLE "User" ADD COLUMN "employeeId" TEXT;
ALTER TABLE "User" ADD COLUMN "companyBizNo" TEXT;

-- CreateIndex: employeeId에 unique 제약 조건 추가
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- AlterTable: DisabledEmployee에 workType 필드 추가
ALTER TABLE "DisabledEmployee" ADD COLUMN "workType" TEXT NOT NULL DEFAULT 'OFFICE';

-- CreateTable: AttendanceRecord 테이블 생성
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
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

-- CreateIndex: AttendanceRecord 인덱스 생성
CREATE UNIQUE INDEX "AttendanceRecord_employeeId_date_key" ON "AttendanceRecord"("employeeId", "date");
CREATE INDEX "AttendanceRecord_employeeId_date_idx" ON "AttendanceRecord"("employeeId", "date");
CREATE INDEX "AttendanceRecord_date_idx" ON "AttendanceRecord"("date");
