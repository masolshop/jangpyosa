import { YearSetting } from "@prisma/client";

export function calcObligation(employeeCount: number, quotaRate: number): number {
  // 단순 반올림 규칙 (실제는 더 복잡할 수 있음)
  const obligated = Math.round(employeeCount * quotaRate);
  return Math.max(obligated, 0);
}

/**
 * 2026년 기준 월 부담기초액 (고용수준별)
 * - 고용수준 = 장애인고용인원 / 의무고용인원
 */
export function getMonthlyLevyBase(obligated: number, disabledCount: number): number {
  if (obligated === 0) return 2156880; // 장애인 0명 고용
  
  const employmentRate = disabledCount / obligated;
  
  if (employmentRate >= 0.75) return 1295000;      // 3/4 이상
  if (employmentRate >= 0.5) return 1372700;       // 1/2 ~ 3/4 미만
  if (employmentRate >= 0.25) return 1554000;      // 1/4 ~ 1/2 미만
  if (employmentRate > 0) return 1813000;          // 1/4 미만 (하지만 0명은 아님)
  return 2156880;                                   // 장애인 0명 고용
}

export function calcLevyEstimate(params: {
  employeeCount: number;
  disabledCount: number;
  yearSetting: YearSetting;
  companyType: string; // "PRIVATE" | "PUBLIC"
}) {
  const quotaRate =
    params.companyType === "PUBLIC"
      ? params.yearSetting.publicQuotaRate
      : params.yearSetting.privateQuotaRate;

  const obligated = calcObligation(params.employeeCount, quotaRate);
  const shortfall = Math.max(obligated - params.disabledCount, 0);
  
  // 2026년 기준: 고용수준별 월 부담기초액 적용
  const monthlyLevyBase = getMonthlyLevyBase(obligated, params.disabledCount);
  const estimated = shortfall * monthlyLevyBase;

  return { obligated, shortfall, estimated, monthlyLevyBase };
}

export function calcLinkageReduction(params: {
  levyAmount: number;
  contractAmount: number;
  yearSetting: YearSetting;
  targetReductionRate?: number; // 0.5~0.9 등
}) {
  // 감면 상한: min(부담금 * 90%, 도급액 * 50%)
  const maxByLevy = params.levyAmount * params.yearSetting.maxReductionRate; // 90%
  const maxByContract = params.contractAmount * params.yearSetting.maxReductionByContract; // 50%
  const cap = Math.min(maxByLevy, maxByContract);

  const wanted = params.targetReductionRate
    ? params.levyAmount * params.targetReductionRate
    : cap;

  const reduction = Math.min(wanted, cap);
  const after = Math.max(params.levyAmount - reduction, 0);

  return {
    cap,
    maxByLevy,
    maxByContract,
    reduction,
    after,
  };
}
