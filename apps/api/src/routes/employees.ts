import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index.js";
import { requireAuth } from "../middleware/auth.js";
import {
  calculateYearlyData,
  calculateMonthlyData,
  type CalcEmployee,
} from "../services/employment-calculator-v2";

const router = Router();

// 직원 목록 조회
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (userRole !== "BUYER" && userRole !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "부담금기업만 접근 가능합니다." });
    }

    // SUPER_ADMIN일 경우 첫 번째 BUYER 회사 데이터 조회
    let company;
    if (userRole === "SUPER_ADMIN") {
      company = await prisma.company.findFirst({
        where: { 
          type: "BUYER",
          buyerProfile: { isNot: null }
        },
        include: { buyerProfile: true },
      });
    } else {
      company = await prisma.company.findUnique({
        where: { ownerUserId: userId },
        include: { buyerProfile: true },
      });
    }

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ error: "기업 정보가 없습니다." });
    }

    const employees = await prisma.disabledEmployee.findMany({
      where: { buyerId: company.buyerProfile.id },
      orderBy: [{ resignDate: "asc" }, { hireDate: "asc" }],
    });

    return res.json({ employees });
  } catch (error: any) {
    console.error("직원 목록 조회 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 직원 추가
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (userRole !== "BUYER" && userRole !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "부담금기업만 접근 가능합니다." });
    }

    const schema = z.object({
      name: z.string().min(1),
      registrationNumber: z.string().nullable().optional(),
      disabilityType: z.string().min(1),
      disabilityGrade: z.string().nullable().optional(),
      severity: z.enum(["MILD", "SEVERE"]),
      gender: z.enum(["M", "F"]),
      hireDate: z.string(), // ISO date
      resignDate: z.string().nullable().optional(),
      monthlySalary: z.number().int().positive(),
      hasEmploymentInsurance: z.boolean(),
      meetsMinimumWage: z.boolean(),
      workHoursPerWeek: z.number().int().nullable().optional(),
      workType: z.enum(["OFFICE", "REMOTE", "HYBRID"]).optional(),
      memo: z.string().nullable().optional(),
    });

    const body = schema.parse(req.body);

    // SUPER_ADMIN일 경우 첫 번째 BUYER 회사 데이터 조회
    let company;
    if (userRole === "SUPER_ADMIN") {
      company = await prisma.company.findFirst({
        where: { 
          type: "BUYER",
          buyerProfile: { isNot: null }
        },
        include: { buyerProfile: true },
      });
    } else {
      company = await prisma.company.findUnique({
        where: { ownerUserId: userId },
        include: { buyerProfile: true },
      });
    }

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ error: "기업 정보가 없습니다." });
    }

    const employee = await prisma.disabledEmployee.create({
      data: {
        buyerId: company.buyerProfile.id,
        name: body.name,
        registrationNumber: body.registrationNumber,
        disabilityType: body.disabilityType,
        disabilityGrade: body.disabilityGrade,
        severity: body.severity,
        gender: body.gender,
        hireDate: new Date(body.hireDate),
        resignDate: body.resignDate ? new Date(body.resignDate) : null,
        monthlySalary: body.monthlySalary,
        hasEmploymentInsurance: body.hasEmploymentInsurance,
        meetsMinimumWage: body.meetsMinimumWage,
        workHoursPerWeek: body.workHoursPerWeek,
        workType: body.workType || "OFFICE",
        memo: body.memo,
      },
    });

    return res.json({ employee });
  } catch (error: any) {
    console.error("직원 추가 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ============================================
// 월별 데이터 API (/:id 보다 먼저 등록해야 함)
// ============================================

/**
 * GET /employees/monthly
 * 월별 고용 데이터 조회
 */
router.get("/monthly", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    if (userRole !== "BUYER" && userRole !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "부담금기업만 접근 가능합니다." });
    }

    // 회사 조회
    let company;
    if (userRole === "SUPER_ADMIN") {
      company = await prisma.company.findFirst({
        where: { type: "BUYER", buyerProfile: { isNot: null } },
        include: { buyerProfile: true },
      });
    } else {
      company = await prisma.company.findUnique({
        where: { ownerUserId: userId },
        include: { buyerProfile: true },
      });
    }

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ error: "기업 정보가 없습니다." });
    }

    // 장애인 직원 목록 조회
    const dbEmployees = await prisma.disabledEmployee.findMany({
      where: { buyerId: company.buyerProfile.id },
      orderBy: { hireDate: "asc" },
    });

    // 타입 변환
    const employees: CalcEmployee[] = dbEmployees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      severity: emp.severity as "SEVERE" | "MILD",
      gender: emp.gender as "M" | "F",
      birthDate: emp.birthDate || undefined,
      hireDate: emp.hireDate,
      resignDate: emp.resignDate || undefined,
      workHoursPerWeek: emp.workHoursPerWeek || 40,
      monthlySalary: emp.monthlySalary,
      meetsMinimumWage: emp.meetsMinimumWage,
      hasEmploymentInsurance: emp.hasEmploymentInsurance,
    }));

    // 기존 월별 데이터 조회
    const existingData = await prisma.monthlyEmployeeData.findMany({
      where: { buyerId: company.buyerProfile.id, year },
      orderBy: { month: "asc" },
    });

    // 월별 상시근로자 수 맵 생성
    const monthlyEmployeeCounts: { [month: number]: number } = {};
    for (let month = 1; month <= 12; month++) {
      const found = existingData.find((d) => d.month === month);
      monthlyEmployeeCounts[month] = found?.totalEmployeeCount || 0;
    }

    // 자동 계산 (buyerType 전달)
    const calculatedResults = calculateYearlyData(
      employees,
      monthlyEmployeeCounts,
      year,
      company.buyerType || "PRIVATE_COMPANY" // 기본값: 민간기업
    );

    // 첫 번째, 두 번째, 세 번째 월 계산 결과 로깅
    console.log("📊 월별 계산 결과 (처음 3개월):");
    for (let i = 0; i < Math.min(3, calculatedResults.length); i++) {
      const result = calculatedResults[i];
      console.log(`  ${result.month}월: 상시 ${result.totalEmployeeCount}명, 의무 ${result.obligatedCount}명, 기준 ${result.incentiveBaselineCount}명, 장애인 ${result.disabledCount}명, 장려금대상 ${result.incentiveEligibleCount}명, 장려금 ${result.incentive}원`);
    }

    // 기존 데이터와 병합
    const monthlyData = calculatedResults.map((result) => {
      const existing = existingData.find((d) => d.month === result.month);
      return {
        id: existing?.id,
        year: result.year,
        month: result.month,
        totalEmployeeCount: result.totalEmployeeCount,
        disabledCount: result.disabledCount,
        recognizedCount: result.recognizedCount,
        obligatedCount: result.obligatedCount,
        incentiveBaselineCount: result.incentiveBaselineCount,
        incentiveExcludedCount: result.incentiveExcludedCount,
        incentiveEligibleCount: result.incentiveEligibleCount,
        shortfallCount: result.shortfallCount,
        levy: result.levy,
        incentive: result.incentive,
        netAmount: result.netAmount,
        details: result.details,
      };
    });

    return res.json({
      year,
      companyName: company.name,
      companyType: company.type,
      monthlyData,
    });
  } catch (error: any) {
    console.error("월별 데이터 조회 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /employees/monthly
 * 월별 상시근로자 수 업데이트 (일괄)
 */
router.put("/monthly", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { year, monthlyEmployeeCounts } = req.body;

    console.log("PUT /employees/monthly - userId:", userId, "role:", userRole);
    console.log("year:", year, "monthlyEmployeeCounts:", monthlyEmployeeCounts);

    if (userRole !== "BUYER" && userRole !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "부담금기업만 접근 가능합니다." });
    }

    // 회사 조회
    let company;
    if (userRole === "SUPER_ADMIN") {
      company = await prisma.company.findFirst({
        where: { type: "BUYER", buyerProfile: { isNot: null } },
        include: { buyerProfile: true },
      });
    } else {
      company = await prisma.company.findUnique({
        where: { ownerUserId: userId },
        include: { buyerProfile: true },
      });
    }

    console.log("회사:", company?.name, "buyerProfileId:", company?.buyerProfile?.id);

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ error: "기업 정보가 없습니다." });
    }

    // 장애인 직원 목록 조회
    const dbEmployees = await prisma.disabledEmployee.findMany({
      where: { buyerId: company.buyerProfile.id },
    });

    console.log("직원 수:", dbEmployees.length);

    const employees: CalcEmployee[] = dbEmployees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      severity: emp.severity as "SEVERE" | "MILD",
      gender: emp.gender as "M" | "F",
      birthDate: emp.birthDate || undefined,
      hireDate: emp.hireDate,
      resignDate: emp.resignDate || undefined,
      workHoursPerWeek: emp.workHoursPerWeek || 40,
      monthlySalary: emp.monthlySalary,
      meetsMinimumWage: emp.meetsMinimumWage,
      hasEmploymentInsurance: emp.hasEmploymentInsurance,
    }));

    // 월별 계산 및 저장
    const savedData = [];
    for (let month = 1; month <= 12; month++) {
      const totalEmployeeCount = monthlyEmployeeCounts[month] || 0;

      // 계산 (buyerType 전달)
      const result = calculateMonthlyData(
        employees,
        totalEmployeeCount,
        year,
        month,
        company.buyerType || "PRIVATE_COMPANY" // 기본값: 민간기업
      );

      // DB 저장 (upsert)
      const saved = await prisma.monthlyEmployeeData.upsert({
        where: {
          buyerId_year_month: {
            buyerId: company.buyerProfile.id,
            year,
            month,
          },
        },
        update: {
          totalEmployeeCount: result.totalEmployeeCount,
          disabledCount: result.disabledCount,
          recognizedCount: result.recognizedCount,
          obligatedCount: result.obligatedCount,
          shortfallCount: result.shortfallCount,
          surplusCount: 0,
          levy: result.levy,
          incentive: result.incentive,
          netAmount: result.netAmount,
          detailJson: JSON.stringify(result.details),
        },
        create: {
          buyerId: company.buyerProfile.id,
          year,
          month,
          totalEmployeeCount: result.totalEmployeeCount,
          disabledCount: result.disabledCount,
          recognizedCount: result.recognizedCount,
          obligatedCount: result.obligatedCount,
          shortfallCount: result.shortfallCount,
          surplusCount: 0,
          levy: result.levy,
          incentive: result.incentive,
          netAmount: result.netAmount,
          detailJson: JSON.stringify(result.details),
        },
      });

      savedData.push(saved);
    }

    console.log("저장 완료:", savedData.length, "건");

    return res.json({
      message: "월별 데이터가 저장되었습니다.",
      savedCount: savedData.length,
    });
  } catch (error: any) {
    console.error("월별 데이터 저장 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ============================================
// 직원 개별 관리 API
// ============================================

// 직원 수정
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const employeeId = req.params.id;

    if (userRole !== "BUYER" && userRole !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "부담금기업만 접근 가능합니다." });
    }

    const schema = z.object({
      name: z.string().min(1).optional(),
      registrationNumber: z.string().nullable().optional(),
      disabilityType: z.string().min(1).optional(),
      disabilityGrade: z.string().nullable().optional(),
      severity: z.enum(["MILD", "SEVERE"]).optional(),
      gender: z.enum(["M", "F"]).optional(),
      hireDate: z.string().optional(),
      resignDate: z.string().nullable().optional(),
      monthlySalary: z.number().int().positive().optional(),
      hasEmploymentInsurance: z.boolean().optional(),
      meetsMinimumWage: z.boolean().optional(),
      workHoursPerWeek: z.number().int().nullable().optional(),
      workType: z.enum(["OFFICE", "REMOTE", "HYBRID"]).optional(),
      memo: z.string().nullable().optional(),
    });

    const body = schema.parse(req.body);

    // SUPER_ADMIN일 경우 첫 번째 BUYER 회사 데이터 조회
    let company;
    if (userRole === "SUPER_ADMIN") {
      company = await prisma.company.findFirst({
        where: { 
          type: "BUYER",
          buyerProfile: { isNot: null }
        },
        include: { buyerProfile: true },
      });
    } else {
      company = await prisma.company.findUnique({
        where: { ownerUserId: userId },
        include: { buyerProfile: true },
      });
    }

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ error: "기업 정보가 없습니다." });
    }

    // 직원 소유 확인
    const existing = await prisma.disabledEmployee.findUnique({
      where: { id: employeeId },
    });

    if (!existing || existing.buyerId !== company.buyerProfile.id) {
      return res.status(404).json({ error: "직원을 찾을 수 없습니다." });
    }

    const employee = await prisma.disabledEmployee.update({
      where: { id: employeeId },
      data: {
        name: body.name,
        registrationNumber: body.registrationNumber,
        disabilityType: body.disabilityType,
        disabilityGrade: body.disabilityGrade,
        severity: body.severity,
        gender: body.gender,
        hireDate: body.hireDate ? new Date(body.hireDate) : undefined,
        resignDate: body.resignDate === null ? null : (body.resignDate ? new Date(body.resignDate) : undefined),
        monthlySalary: body.monthlySalary,
        hasEmploymentInsurance: body.hasEmploymentInsurance,
        meetsMinimumWage: body.meetsMinimumWage,
        workHoursPerWeek: body.workHoursPerWeek === null ? null : body.workHoursPerWeek,
        workType: body.workType,
        memo: body.memo === null ? null : body.memo,
      },
    });

    return res.json({ employee });
  } catch (error: any) {
    console.error("직원 수정 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 직원 삭제
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const employeeId = req.params.id;

    if (userRole !== "BUYER" && userRole !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "부담금기업만 접근 가능합니다." });
    }

    // SUPER_ADMIN일 경우 첫 번째 BUYER 회사 데이터 조회
    let company;
    if (userRole === "SUPER_ADMIN") {
      company = await prisma.company.findFirst({
        where: { 
          type: "BUYER",
          buyerProfile: { isNot: null }
        },
        include: { buyerProfile: true },
      });
    } else {
      company = await prisma.company.findUnique({
        where: { ownerUserId: userId },
        include: { buyerProfile: true },
      });
    }

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ error: "기업 정보가 없습니다." });
    }

    // 직원 소유 확인
    const existing = await prisma.disabledEmployee.findUnique({
      where: { id: employeeId },
    });

    if (!existing || existing.buyerId !== company.buyerProfile.id) {
      return res.status(404).json({ error: "직원을 찾을 수 없습니다." });
    }

    await prisma.disabledEmployee.delete({
      where: { id: employeeId },
    });

    return res.json({ success: true });
  } catch (error: any) {
    console.error("직원 삭제 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ============================================
// 월별 데이터 관리 API
// ============================================

export default router;
