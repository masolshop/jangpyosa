import { Router } from "express";
import { prisma } from "../index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// 대시보드 종합 데이터 조회 (자동 계산)
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const year = parseInt(req.query.year as string) || 2026;

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

    // 직원 목록 조회
    const employees = await prisma.disabledEmployee.findMany({
      where: { buyerId: company.buyerProfile.id },
    });

    // 연도 설정 조회
    const yearSetting = await prisma.yearSetting.findUnique({
      where: { year },
    });

    if (!yearSetting) {
      return res.status(404).json({ error: "연도 설정이 없습니다." });
    }

    // 기업 유형에 따른 의무고용률
    const quotaRate = company.type === "PRIVATE" 
      ? yearSetting.privateQuotaRate 
      : yearSetting.publicQuotaRate;

    // 월별 상시근로자 수
    let yearlyEmployees: any = {};
    if (company.buyerProfile.yearlyEmployeesJson) {
      try {
        yearlyEmployees = JSON.parse(company.buyerProfile.yearlyEmployeesJson);
      } catch (e) {
        yearlyEmployees = {};
      }
    }

    const monthlyData = yearlyEmployees[year.toString()] || {};

    // 월별 부담금 계산
    let totalLevy = 0;
    let totalIncentive = 0;
    const monthlyResults = [];

    for (let month = 1; month <= 12; month++) {
      const employeeCount = monthlyData[month.toString()] || 100;
      const monthDate = new Date(year, month - 1, 1);

      // 해당 월 근무 중인 장애인 근로자
      const activeEmployees = employees.filter((emp) => {
        const hireDate = new Date(emp.hireDate);
        if (hireDate > monthDate) return false;
        if (emp.resignDate) {
          const resignDate = new Date(emp.resignDate);
          if (resignDate < monthDate) return false;
        }
        return true;
      });

      // 의무고용인원
      const obligated = Math.floor(employeeCount * quotaRate);

      // 인정 장애인 수 (중증 60시간 이상 2배)
      let recognizedCount = 0;
      activeEmployees.forEach((emp) => {
        if (emp.severity === "SEVERE" && (emp.workHoursPerWeek || 40) >= 60) {
          recognizedCount += 2;
        } else {
          recognizedCount += 1;
        }
      });

      // 미달인원
      const shortfall = Math.max(0, obligated - recognizedCount);

      // 월별 부담금 (간단 계산)
      const monthlyLevy = shortfall * yearSetting.baseLevyAmount;
      totalLevy += monthlyLevy;

      // 장려금 계산 (의무고용인원 초과 인원)
      const eligibleForIncentive = Math.max(0, activeEmployees.length - Math.ceil(employeeCount * quotaRate));
      let monthlyIncentive = 0;

      if (eligibleForIncentive > 0) {
        // 간단 계산: 경증 남성 35만원 기준
        monthlyIncentive = eligibleForIncentive * 350000;
      }
      totalIncentive += monthlyIncentive;

      monthlyResults.push({
        month,
        employeeCount,
        obligated,
        recognizedCount,
        shortfall,
        monthlyLevy,
        monthlyIncentive,
      });
    }

    // 연계고용 감면 가능액 (도급계약 총액의 50% 또는 부담금의 90% 중 낮은 금액)
    const maxReductionByLevy = totalLevy * yearSetting.maxReductionRate;
    const estimatedReduction = Math.min(maxReductionByLevy, totalLevy * 0.5); // 임시 50%

    return res.json({
      year,
      company: {
        name: company.name,
        type: company.type,
        quotaRate,
      },
      summary: {
        totalLevy,
        totalIncentive,
        estimatedReduction,
        netAmount: totalLevy - totalIncentive - estimatedReduction,
        employeeCount: employees.length,
        activeEmployeeCount: employees.filter((e) => !e.resignDate).length,
      },
      monthlyResults,
    });
  } catch (error: any) {
    console.error("대시보드 데이터 조회 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
