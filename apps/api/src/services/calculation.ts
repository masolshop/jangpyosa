import { CompanyType, YearSetting } from "@prisma/client";

export function calcObligation(employeeCount: number, quotaRate: number): number {
  // 단순 반올림 규칙 (실제는 더 복잡할 수 있음)
  const obligated = Math.round(employeeCount * quotaRate);
  return Math.max(obligated, 0);
}

export function calcLevyEstimate(params: {
  employeeCount: number;
  disabledCount: number;
  yearSetting: YearSetting;
  companyType: CompanyType;
}) {
  const quotaRate =
    params.companyType === "PUBLIC"
      ? params.yearSetting.publicQuotaRate
      : params.yearSetting.privateQuotaRate;

  const obligated = calcObligation(params.employeeCount, quotaRate);
  const shortfall = Math.max(obligated - params.disabledCount, 0);
  const estimated = shortfall * params.yearSetting.baseLevyAmount;

  return { obligated, shortfall, estimated };
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
