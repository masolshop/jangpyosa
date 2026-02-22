/**
 * 장애인 고용 정밀 계산 서비스
 * 대한민국 최고 수준의 정밀 계산 로직
 * 
 * - 고용장려금: 성별, 중증도, 연령, 근로시간별 정밀 계산
 * - 부담금: 중증 2배 인정, 60시간 기준 정밀 계산
 */

// ============================================
// 상수 정의 (2026년 기준)
// ============================================

// 고용장려금 기본 단가 (월) - 2023년 발생분부터 적용
// 고용노동부 공식 단가 (성별 구분, 2026년 기준)
const INCENTIVE_RATES_2026 = {
  SEVERE: {
    MALE: 700000,    // 중증 남성: 70만원
    FEMALE: 900000   // 중증 여성: 90만원
  },
  MILD: {
    MALE: 350000,    // 경증 남성: 35만원
    FEMALE: 500000   // 경증 여성: 50만원
  }
};

// 부담기초액 (월, 2026년 기준 - 고용수준별)
// 고용수준 = 장애인고용인원 / 의무고용인원
const LEVY_BASE_AMOUNTS_2026 = {
  LEVEL_0: 2156880,        // 0명 고용 (미고용)
  LEVEL_1_4: 1813000,      // 1/4 미만
  LEVEL_1_4_TO_1_2: 1554000,  // 1/4 ~ 1/2 미만
  LEVEL_1_2_TO_3_4: 1372700,  // 1/2 ~ 3/4 미만
  LEVEL_3_4_OVER: 1295000,    // 3/4 이상
};

// 2025년 기준 (참고용)
const LEVY_BASE_AMOUNTS_2025 = {
  LEVEL_0: 2096270,
  LEVEL_1_4: 1761200,
  LEVEL_1_4_TO_1_2: 1509600,
  LEVEL_1_2_TO_3_4: 1333480,
  LEVEL_3_4_OVER: 1258000,
};

// 의무고용률
const QUOTA_RATES = {
  PRIVATE_COMPANY: 0.031,     // 민간기업 3.1%
  PUBLIC_INSTITUTION: 0.038,   // 공공기관 3.8%
  GOVERNMENT: 0.038,           // 국가/지자체 3.8%
};

// 중증 장애인 인정 배수
const SEVERE_MULTIPLIER_THRESHOLD = 60; // 월 60시간 이상
const SEVERE_MULTIPLIER = 2.0;
const MILD_MULTIPLIER = 1.0;

// 지원 기간 제한
const SUPPORT_PERIOD_MONTHS = {
  SEVERE: 60, // 중증: 최대 60개월
  MILD: 36,   // 경증: 최대 36개월
};

// 최저 월급여 (2026년 기준)
const MINIMUM_MONTHLY_WAGE_2026 = 2156880;

/**
 * 의무고용률 조회 (회사 유형별)
 */
function getQuotaRate(companyType: string): number {
  if (companyType === "PUBLIC" || companyType === "PUBLIC_INSTITUTION" || companyType === "GOVERNMENT") {
    return QUOTA_RATES.PUBLIC_INSTITUTION;
  }
  return QUOTA_RATES.PRIVATE_COMPANY;
}

/**
 * 2026년 기준 부담기초액 조회 (고용수준별)
 * 고용수준 = 장애인고용인원 / 의무고용인원
 */
export function getLevyBaseAmount2026(disabledCount: number, obligatedCount: number): number {
  if (obligatedCount === 0) return LEVY_BASE_AMOUNTS_2026.LEVEL_0;
  if (disabledCount === 0) return LEVY_BASE_AMOUNTS_2026.LEVEL_0;
  
  const employmentRate = disabledCount / obligatedCount;
  
  if (employmentRate >= 0.75) return LEVY_BASE_AMOUNTS_2026.LEVEL_3_4_OVER;      // 3/4 이상
  if (employmentRate >= 0.5) return LEVY_BASE_AMOUNTS_2026.LEVEL_1_2_TO_3_4;    // 1/2 ~ 3/4 미만
  if (employmentRate >= 0.25) return LEVY_BASE_AMOUNTS_2026.LEVEL_1_4_TO_1_2;   // 1/4 ~ 1/2 미만
  return LEVY_BASE_AMOUNTS_2026.LEVEL_1_4;                                       // 1/4 미만
}

// ============================================
// 타입 정의
// ============================================

export interface Employee {
  id: string;
  name: string;
  severity: "SEVERE" | "MILD";
  gender: "M" | "F";
  birthDate?: Date;
  hireDate: Date;
  resignDate?: Date;
  workHoursPerWeek: number;  // 주당 근무시간 (참고용)
  monthlyWorkHours?: number;  // 월 근로시간 (메인)
  monthlySalary: number;
  meetsMinimumWage: boolean;
  hasEmploymentInsurance: boolean;
}

export interface MonthlyCalculation {
  employeeId: string;
  employeeName: string;
  
  // 기본 정보
  severity: string;
  gender: string;
  age: number;
  workHoursPerWeek: number;
  monthsWorked: number; // 입사 후 경과 월수
  
  // 인정 배수
  recognizedMultiplier: number; // 부담금 인정 배수 (1 or 2)
  
  // 장려금 계산
  baseIncentive: number;        // 기본 장려금
  workHoursRate: number;        // 근로시간 비율
  calculatedIncentive: number;  // 계산된 장려금
  isEligibleForIncentive: boolean; // 지원 자격 여부
  incentiveAmount: number;      // 최종 장려금
  
  // 부담금 인정
  isRecognizedForLevy: boolean; // 부담금 인정 여부
  levyRecognizedCount: number;  // 부담금 인정 인원 (1 or 2)
}

export interface MonthlyResult {
  year: number;
  month: number;
  
  // 입력 데이터
  totalEmployeeCount: number;   // 상시근로자 수
  
  // 장애인 고용 현황
  disabledCount: number;        // 장애인 직원 수
  recognizedCount: number;      // 인정 장애인 수 (중증 2배 포함)
  
  // 의무고용인원
  quotaRate: number;            // 의무고용률
  obligatedCount: number;       // 의무고용인원
  
  // 부담금
  shortfallCount: number;       // 미달 인원
  levy: number;                 // 부담금 (원)
  
  // 장려금
  surplusCount: number;         // 초과 인원
  incentive: number;            // 장려금 (원)
  
  // 순액
  netAmount: number;            // 순액 (장려금 - 부담금)
  
  // 상세 내역
  details: MonthlyCalculation[];
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 나이 계산
 */
function calculateAge(birthDate: Date | undefined, targetDate: Date): number {
  if (!birthDate) return 40; // 기본값: 40세 (35~55세 구간)
  
  const age = targetDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = targetDate.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && targetDate.getDate() < birthDate.getDate())) {
    return age - 1;
  }
  
  return age;
}

/**
 * 입사 후 경과 월수 계산
 */
function calculateMonthsWorked(hireDate: Date, targetDate: Date): number {
  const yearDiff = targetDate.getFullYear() - hireDate.getFullYear();
  const monthDiff = targetDate.getMonth() - hireDate.getMonth();
  return yearDiff * 12 + monthDiff + 1; // +1: 입사 월 포함
}

/**
 * 근로시간에 따른 비율
 */
function getWorkHoursRate(hoursPerWeek: number): number {
  if (hoursPerWeek >= 40) return 1.0;   // 100%
  if (hoursPerWeek >= 30) return 0.75;  // 75%
  if (hoursPerWeek >= 20) return 0.5;   // 50%
  return 0; // 20시간 미만: 지원 불가
}

/**
 * 장려금 기본 단가 조회 (2026년 고용노동부 공식)
 * 성별 구분, 연령 무관
 * 지급단가와 월임금액의 60% 중 낮은 금액 적용
 */
function getBaseIncentiveRate(
  severity: "SEVERE" | "MILD",
  gender: "M" | "F" | "MALE" | "FEMALE"
): number {
  // gender 정규화 (M/F를 MALE/FEMALE로 변환)
  const normalizedGender = (gender === "M" || gender === "MALE") ? "MALE" : "FEMALE";
  return INCENTIVE_RATES_2026[severity][normalizedGender];
}

// ============================================
// 메인 계산 함수
// ============================================

/**
 * 특정 월의 장애인 직원 필터링
 */
export function getEmployeesForMonth(
  employees: Employee[],
  year: number,
  month: number
): Employee[] {
  const targetDate = new Date(year, month - 1, 1); // 해당 월 1일
  const monthEnd = new Date(year, month, 0); // 해당 월 마지막 날
  
  return employees.filter((emp) => {
    // 입사일이 해당 월 이후면 제외
    if (emp.hireDate > monthEnd) return false;
    
    // 퇴사일이 있고, 해당 월 이전이면 제외
    if (emp.resignDate && emp.resignDate < targetDate) return false;
    
    return true;
  });
}

/**
 * 단일 직원의 월별 장려금 및 부담금 계산
 */
export function calculateEmployeeMonthly(
  employee: Employee,
  year: number,
  month: number
): MonthlyCalculation {
  const targetDate = new Date(year, month - 1, 15); // 해당 월 중순 기준
  
  // 기본 정보
  const age = calculateAge(employee.birthDate, targetDate);
  const monthsWorked = calculateMonthsWorked(employee.hireDate, targetDate);
  
  // ========================================
  // 1. 부담금 인정 계산
  // ========================================
  
  let recognizedMultiplier = 1.0;
  let levyRecognizedCount = 1.0;
  
  // 월 근로시간 사용 (우선), 없으면 주당 근무시간 사용
  const monthlyHours = employee.monthlyWorkHours || (employee.workHoursPerWeek * 4.33);
  
  if (employee.severity === "SEVERE" && monthlyHours >= SEVERE_MULTIPLIER_THRESHOLD) {
    recognizedMultiplier = SEVERE_MULTIPLIER;
    levyRecognizedCount = SEVERE_MULTIPLIER;
  }
  
  // ========================================
  // 2. 장려금 계산 (고용노동부 공식)
  // ========================================
  
  // 기본 단가 (성별 구분)
  const baseIncentive = getBaseIncentiveRate(
    employee.severity,
    employee.gender
  );
  
  // 월임금액의 60% 상한 적용
  const wageLimit = employee.monthlySalary * 0.6;
  
  // 지급 단가와 월임금 60% 중 낮은 금액 적용
  const incentiveRate = Math.min(baseIncentive, wageLimit);
  
  // 근로시간 비율 (30시간 이상 100%, 20~30시간 50%, 20시간 미만 0%)
  const workHoursRate = getWorkHoursRate(employee.workHoursPerWeek);
  
  // 계산된 장려금
  const calculatedIncentive = Math.round(incentiveRate * workHoursRate);
  
  // 지원 자격 확인
  const maxSupportPeriod = SUPPORT_PERIOD_MONTHS[employee.severity];
  const isEligibleForIncentive =
    monthsWorked <= maxSupportPeriod &&
    employee.meetsMinimumWage &&
    employee.hasEmploymentInsurance &&
    workHoursRate > 0;
  
  // 최종 장려금
  const incentiveAmount = isEligibleForIncentive ? calculatedIncentive : 0;
  
  // ========================================
  // 결과 반환
  // ========================================
  
  return {
    employeeId: employee.id,
    employeeName: employee.name,
    severity: employee.severity,
    gender: employee.gender,
    age,
    workHoursPerWeek: employee.workHoursPerWeek,
    monthsWorked,
    recognizedMultiplier,
    baseIncentive,
    workHoursRate,
    calculatedIncentive,
    isEligibleForIncentive,
    incentiveAmount,
    isRecognizedForLevy: true,
    levyRecognizedCount,
  };
}

/**
 * 월별 전체 계산
 */
export function calculateMonthlyData(
  employees: Employee[],
  totalEmployeeCount: number,
  year: number,
  month: number,
  companyType: string = "PRIVATE"
): MonthlyResult {
  // 해당 월 근무 중인 직원 필터링
  const activeEmployees = getEmployeesForMonth(employees, year, month);
  
  // 각 직원별 계산
  const details = activeEmployees.map((emp) =>
    calculateEmployeeMonthly(emp, year, month)
  );
  
  // ========================================
  // 집계
  // ========================================
  
  // 장애인 수
  const disabledCount = activeEmployees.length;
  
  // 인정 장애인 수 (중증 2배 포함)
  const recognizedCount = details.reduce(
    (sum, d) => sum + d.levyRecognizedCount,
    0
  );
  
  // 의무고용인원
  const quotaRate = getQuotaRate(companyType);
  const obligatedCount = Math.floor(totalEmployeeCount * quotaRate);
  
  // 부담금 계산 (2026년 기준 - 고용수준별 부담기초액 적용)
  const shortfallCount = Math.max(0, obligatedCount - recognizedCount);
  
  // 고용수준 계산 및 부담기초액 결정
  const levyBaseAmount = getLevyBaseAmount2026(recognizedCount, obligatedCount);
  
  const levy = shortfallCount * levyBaseAmount;
  
  // 장려금 계산 (고용노동부 공식)
  // 1. 장려금 지급기준인원 = ceil(상시근로자수 × 의무고용률)
  const incentiveBaseCount = Math.ceil(totalEmployeeCount * quotaRate);
  
  // 2. 장려금 대상 인원 = 장애인수 - 지급기준인원
  const incentiveEligibleCount = Math.max(0, disabledCount - incentiveBaseCount);
  
  // 3. 자격 있는 직원들을 장려금 높은 순으로 정렬
  const eligibleDetails = details
    .filter(d => d.isEligibleForIncentive && d.incentiveAmount > 0)
    .sort((a, b) => b.incentiveAmount - a.incentiveAmount);
  
  // 4. 상위 N명만 선택하여 장려금 합산
  const selectedForIncentive = eligibleDetails.slice(0, incentiveEligibleCount);
  const incentive = selectedForIncentive.reduce((sum, d) => sum + d.incentiveAmount, 0);
  
  const surplusCount = Math.max(0, recognizedCount - obligatedCount);
  
  // 순액
  const netAmount = incentive - levy;
  
  return {
    year,
    month,
    totalEmployeeCount,
    disabledCount,
    recognizedCount,
    quotaRate,
    obligatedCount,
    shortfallCount,
    levy,
    surplusCount,
    incentive,
    netAmount,
    details,
  };
}

/**
 * 연간 전체 계산 (12개월)
 */
export function calculateYearlyData(
  employees: Employee[],
  monthlyEmployeeCounts: { [month: number]: number },
  year: number,
  companyType: string = "PRIVATE"
): MonthlyResult[] {
  const results: MonthlyResult[] = [];
  
  for (let month = 1; month <= 12; month++) {
    const totalEmployeeCount = monthlyEmployeeCounts[month] || 0;
    
    const monthlyResult = calculateMonthlyData(
      employees,
      totalEmployeeCount,
      year,
      month,
      companyType
    );
    
    results.push(monthlyResult);
  }
  
  return results;
}
