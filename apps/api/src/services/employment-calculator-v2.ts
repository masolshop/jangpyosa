/**
 * 장애인 고용 정밀 계산 서비스 V2
 * 고용장려금 산정 공식 정확히 반영
 * 
 * 핵심 개선사항:
 * 1. 장려금 기준인원: ceil(상시근로자수 × 0.031) - 올림 처리
 * 2. 입사일 순서 산입: 입사일이 빠른 순서대로 기준인원에 포함
 * 3. 제외 조건: 고용보험 미가입, 최저임금 미만
 * 4. 임금 상한: 중증의 경우 min(단가, 임금 × 0.6)
 */

// ============================================
// 타입 정의
// ============================================

export interface CalcEmployee {
  id: string;
  name: string;
  severity: "SEVERE" | "MILD";
  gender: "M" | "F";
  birthDate?: Date;
  hireDate: Date;
  resignDate?: Date;
  monthlyWorkHours: number;  // 월간 근로시간 (주간 아님!)
  monthlySalary: number;
  meetsMinimumWage: boolean;
  hasEmploymentInsurance: boolean;
}

export interface EmployeeMonthlyDetail {
  employeeId: string;
  employeeName: string;
  
  // 기본 정보
  severity: string;
  gender: string;
  age: number;
  hireDate: string;
  monthlyWorkHours: number;  // 월간 근로시간
  monthlySalary: number;
  monthsWorked: number;
  
  // 자격 확인
  hasEmploymentInsurance: boolean;
  meetsMinimumWage: boolean;
  
  // 순위
  rank: number; // 입사일 순서 (1부터 시작)
  isWithinBaseline: boolean; // 장려금 기준인원 이내인가?
  
  // 제외 사유
  excludeReason?: string;
  
  // 장려금 계산
  baseIncentiveRate: number; // 기본 단가
  salaryLimit: number; // 임금 60% 상한 (중증만)
  finalIncentiveRate: number; // 최종 단가 (min(단가, 임금 60%))
  incentiveAmount: number; // 최종 장려금
  
  // 부담금 인정
  levyRecognizedCount: number; // 부담금 인정 인원 (1 or 2)
}

export interface MonthlyResult {
  year: number;
  month: number;
  
  // 입력 데이터
  totalEmployeeCount: number; // 상시근로자 수
  
  // 장애인 고용 현황
  disabledCount: number; // 장애인 직원 수 (재직중)
  recognizedCount: number; // 인정 장애인 수 (중증 2배 포함)
  
  // 의무고용인원
  quotaRate: number; // 의무고용률
  obligatedCount: number; // 의무고용인원 (floor)
  
  // 장려금 기준인원
  incentiveBaselineCount: number; // 장려금 기준인원 (ceil) ★
  incentiveExcludedCount: number; // 장려금 제외인원
  incentiveEligibleCount: number; // 장려금 지급인원
  
  // 부담금
  shortfallCount: number; // 미달 인원
  employmentRate: number; // 고용률 (%)
  levyApplicationRate: number; // 부담금 적용률 (0 ~ 1.0)
  levyPerPerson: number; // 1인당 부담금 (원)
  levy: number; // 총 부담금 (원)
  
  // 장려금
  incentive: number; // 장려금 (원)
  
  // 순액
  netAmount: number; // 순액 (장려금 - 부담금)
  
  // 상세 내역
  details: EmployeeMonthlyDetail[];
}

// ============================================
// 상수 정의 (2026년 기준)
// ============================================

// 고용장려금 기본 단가 (월) - 2026년 고용노동부 공식 단가
// 주의: 나이 구분 없음! (2023년 발생분부터 적용)
const INCENTIVE_RATES = {
  MILD: {
    M: 350000,  // 경증 남성: 35만원
    F: 500000,  // 경증 여성: 50만원
  },
  SEVERE: {
    M: 700000,  // 중증 남성: 70만원
    F: 900000,  // 중증 여성: 90만원
  },
};

// 부담금 기초액 (2026년 기준: 최저임금의 60%)
const MIN_WAGE_2026 = 2156880; // 2026년 월 최저임금
const LEVY_BASE_AMOUNT = Math.round(MIN_WAGE_2026 * 0.6); // 1,294,128원

// 의무고용률 (buyerType 기반)
const QUOTA_RATES: { [key: string]: number } = {
  PRIVATE_COMPANY: 0.031,      // 민간기업
  PUBLIC_INSTITUTION: 0.038,   // 공공기관
  GOVERNMENT: 0.038,           // 국가/지자체/교육청
  
  // 하위 호환성 유지
  PRIVATE: 0.031,
  PUBLIC_CORP: 0.038,
  OTHER_PUBLIC: 0.038,
  BUYER: 0.031, // 기본값
};

// 중증 장애인 인정 배수
const SEVERE_MULTIPLIER_THRESHOLD = 60; // 월 60시간 이상 (주 60시간 아님!)
const SEVERE_MULTIPLIER = 2.0;

// 지원 기간 제한
const SUPPORT_PERIOD_MONTHS = {
  SEVERE: 60, // 중증: 최대 60개월
  MILD: 36, // 경증: 최대 36개월
};

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
 * 장려금 기본 단가 조회 (2026년 공식 - 나이 구분 없음!)
 */
function getBaseIncentiveRate(
  severity: "SEVERE" | "MILD",
  gender: "M" | "F"
): number {
  // 2026년 고용노동부 공식 단가 (2023년 발생분부터 적용)
  const rate = INCENTIVE_RATES[severity]?.[gender];
  
  if (!rate) {
    // Fallback: 중증 남성 기준
    console.warn(`⚠️  장려금 단가 조회 실패: severity=${severity}, gender=${gender}, 기본값(700,000원) 사용`);
    return 700000;
  }

  return rate;
}

/**
 * 특정 월의 장애인 직원 필터링
 */
export function getEmployeesForMonth(
  employees: CalcEmployee[],
  year: number,
  month: number
): CalcEmployee[] {
  const targetDate = new Date(year, month - 1, 1); // 해당 월 1일
  const monthEnd = new Date(year, month, 0); // 해당 월 마지막 날

  console.log(`🔍 [${year}년 ${month}월] 재직자 필터링 시작 (총 ${employees.length}명)`);
  console.log(`   기준: 입사일 <= ${monthEnd.toISOString().slice(0,10)}, 퇴사일 없거나 >= ${targetDate.toISOString().slice(0,10)}`);

  const filtered = employees.filter((emp) => {
    // 입사일이 해당 월 이후면 제외
    if (emp.hireDate > monthEnd) {
      console.log(`   ❌ ${emp.name}: 입사일(${emp.hireDate.toISOString().slice(0,10)}) > 월말(${monthEnd.toISOString().slice(0,10)})`);
      return false;
    }

    // 퇴사일이 있고, 해당 월 이전이면 제외
    if (emp.resignDate && emp.resignDate < targetDate) {
      console.log(`   ❌ ${emp.name}: 퇴사일(${emp.resignDate.toISOString().slice(0,10)}) < 월초(${targetDate.toISOString().slice(0,10)})`);
      return false;
    }

    console.log(`   ✅ ${emp.name}: 재직 중 (입사 ${emp.hireDate.toISOString().slice(0,10)})`);
    return true;
  });

  console.log(`   ➡️  결과: ${filtered.length}명 재직`);
  return filtered;
}

// ============================================
// 메인 계산 함수
// ============================================

/**
 * 월별 고용장려금 및 부담금 정밀 계산
 */
export function calculateMonthlyData(
  employees: CalcEmployee[],
  totalEmployeeCount: number,
  year: number,
  month: number,
  companyType: string = "BUYER"
): MonthlyResult {
  const targetDate = new Date(year, month - 1, 15); // 해당 월 중순 기준

  // 1. 해당 월 재직 중인 직원만 필터링
  const activeEmployees = getEmployeesForMonth(employees, year, month);

  // 2. 입사일 순서로 정렬 (입사일이 같으면 경증 > 남성 > 임금 낮은 순)
  const sortedEmployees = [...activeEmployees].sort((a, b) => {
    // 입사일 비교
    const hireCompare = a.hireDate.getTime() - b.hireDate.getTime();
    if (hireCompare !== 0) return hireCompare;

    // 입사일 같으면 경증 우선 (경증=MILD가 먼저)
    if (a.severity !== b.severity) {
      return a.severity === "MILD" ? -1 : 1;
    }

    // 중증도 같으면 남성 우선
    if (a.gender !== b.gender) {
      return a.gender === "M" ? -1 : 1;
    }

    // 성별도 같으면 임금 낮은 순
    return a.monthlySalary - b.monthlySalary;
  });

  // 3. 의무고용률 및 인원 계산
  const quotaRate = QUOTA_RATES[companyType] || 0.031;
  const obligatedCount = Math.floor(totalEmployeeCount * quotaRate); // 의무고용인원 (floor)
  const incentiveBaselineCount = Math.ceil(totalEmployeeCount * quotaRate); // 장려금 기준인원 (ceil) ★

  // 4. 각 직원별 상세 계산
  const details: EmployeeMonthlyDetail[] = [];
  let totalIncentive = 0;
  let totalRecognizedCount = 0;
  let excludedCount = 0;

  console.log(`📊 [${year}년 ${month}월] 직원별 인정수 계산 시작 (총 ${sortedEmployees.length}명)`);
  
  sortedEmployees.forEach((emp, index) => {
    const age = calculateAge(emp.birthDate, targetDate);
    const monthsWorked = calculateMonthsWorked(emp.hireDate, targetDate);
    const rank = index + 1;
    const isWithinBaseline = rank <= incentiveBaselineCount;

    // 제외 사유 확인
    let excludeReason: string | undefined;
    let incentiveAmount = 0;

    // 장려금 지급 대상 판정: 기준인원을 초과한 사람만 지급 대상
    // 공식: 월별 지급인원 = [장애인근로자수 - 제외인원 - 기준인원]
    if (isWithinBaseline) {
      // 기준인원 이내는 장려금 대상 아님
      excludeReason = "기준인원 이내 (장려금 대상 아님)";
    } else if (!emp.hasEmploymentInsurance) {
      // 기준인원 초과이지만 고용보험 미가입
      excludeReason = "고용보험 미가입";
      excludedCount++;
    } else if (!emp.meetsMinimumWage) {
      // 기준인원 초과이지만 최저임금 미만
      excludeReason = "최저임금 미만";
      excludedCount++;
    } else {
      // 지원 기간 확인
      const maxPeriod = SUPPORT_PERIOD_MONTHS[emp.severity];
      if (monthsWorked > maxPeriod) {
        excludeReason = `지원기간 초과 (${maxPeriod}개월)`;
        excludedCount++;
      }
    }

    // 장려금 계산 (기준인원 초과 + 자격이 있는 경우만)
    const baseRate = getBaseIncentiveRate(emp.severity, emp.gender);
    
    // 월임금액 60% 상한 적용 (모든 장애인에게 적용)
    const salaryLimit = Math.round(emp.monthlySalary * 0.6);
    const finalRate = Math.min(baseRate, salaryLimit);

    // 장려금 지급: 기준인원 초과 && 제외사유 없음
    if (!isWithinBaseline && !excludeReason) {
      incentiveAmount = finalRate;
      totalIncentive += incentiveAmount;
    }

    // 부담금 인정 인원 (제외 조건 없음, 모든 재직자 인정)
    // 중증: 월 60시간 이상 근무 시 2명 인정
    let levyRecognizedCount = 1.0;
    if (emp.severity === "SEVERE" && emp.monthlyWorkHours >= SEVERE_MULTIPLIER_THRESHOLD) {
      levyRecognizedCount = SEVERE_MULTIPLIER;
      console.log(`  ✅ ${emp.name} (중증): 월 ${emp.monthlyWorkHours}시간 >= 60 → 2배 인정`);
    } else {
      console.log(`  - ${emp.name} (${emp.severity}): 월 ${emp.monthlyWorkHours}시간 → 1배 인정`);
    }
    totalRecognizedCount += levyRecognizedCount;

    details.push({
      employeeId: emp.id,
      employeeName: emp.name,
      severity: emp.severity,
      gender: emp.gender,
      age,
      hireDate: emp.hireDate.toISOString().slice(0, 10),
      monthlyWorkHours: emp.monthlyWorkHours,
      monthlySalary: emp.monthlySalary,
      monthsWorked,
      hasEmploymentInsurance: emp.hasEmploymentInsurance,
      meetsMinimumWage: emp.meetsMinimumWage,
      rank,
      isWithinBaseline,
      excludeReason,
      baseIncentiveRate: baseRate,
      salaryLimit,
      finalIncentiveRate: finalRate,
      incentiveAmount,
      levyRecognizedCount,
    });
  });

  // 5. 부담금 계산 (2026년 최신 로직)
  const shortfallCount = Math.max(0, obligatedCount - totalRecognizedCount);
  
  // 고용률 계산
  const employmentRate = obligatedCount > 0 
    ? (totalRecognizedCount / obligatedCount) * 100 
    : 0;
  
  // 부담금 적용률 결정 (고용률 구간별)
  let levyApplicationRate = 0;
  if (employmentRate >= 100) {
    levyApplicationRate = 0;      // 100% 이상: 부담금 없음
  } else if (employmentRate >= 75) {
    levyApplicationRate = 0.25;   // 75~100%: 25% 적용
  } else if (employmentRate >= 50) {
    levyApplicationRate = 0.50;   // 50~75%: 50% 적용
  } else if (employmentRate >= 25) {
    levyApplicationRate = 0.75;   // 25~50%: 75% 적용
  } else {
    levyApplicationRate = 1.00;   // 0~25%: 100% 적용
  }
  
  // 1인당 부담금
  const levyPerPerson = Math.round(LEVY_BASE_AMOUNT * levyApplicationRate);
  
  // 총 부담금 (0명 고용 시 = 미달인원 × 기초액)
  const levy = Math.round(shortfallCount * levyPerPerson);

  console.log(`📊 [${year}년 ${month}월] 최종 계산 결과:`);
  console.log(`  - 장애인 직원 수: ${activeEmployees.length}명`);
  console.log(`  - 총 인정수: ${totalRecognizedCount.toFixed(1)}명`);
  console.log(`  - 의무고용인원: ${obligatedCount}명`);
  console.log(`  - 미달인원: ${shortfallCount.toFixed(1)}명`);
  console.log(`  - 고용률: ${employmentRate.toFixed(1)}%`);
  console.log(`  - 부담금 적용률: ${(levyApplicationRate * 100).toFixed(0)}%`);
  console.log(`  - 1인당 부담금: ${levyPerPerson.toLocaleString()}원`);
  console.log(`  - 총 부담금: ${levy.toLocaleString()}원\n`);

  // 6. 지급인원 및 순액 계산
  // 공식: 지급인원 = 장애인근로자수 - 기준인원 - 제외인원
  const eligibleCount = Math.max(0, activeEmployees.length - incentiveBaselineCount - excludedCount);
  const netAmount = totalIncentive - levy; // 순액 = 장려금 - 부담금

  return {
    year,
    month,
    totalEmployeeCount,
    disabledCount: activeEmployees.length,
    recognizedCount: totalRecognizedCount,
    quotaRate,
    obligatedCount,
    incentiveBaselineCount, // ★ 올림 처리된 기준인원
    incentiveExcludedCount: excludedCount,
    incentiveEligibleCount: eligibleCount, // ★ 수정된 계산식
    shortfallCount: Math.max(0, shortfallCount),
    employmentRate,
    levyApplicationRate,
    levyPerPerson,
    levy,
    incentive: totalIncentive,
    netAmount,
    details,
  };
}

/**
 * 연간 데이터 계산
 */
export function calculateYearlyData(
  employees: CalcEmployee[],
  monthlyEmployeeCounts: { [month: number]: number },
  year: number,
  companyType: string = "BUYER"
): MonthlyResult[] {
  const results: MonthlyResult[] = [];

  for (let month = 1; month <= 12; month++) {
    const totalEmployeeCount = monthlyEmployeeCounts[month] || 0;
    const result = calculateMonthlyData(employees, totalEmployeeCount, year, month, companyType);
    results.push(result);
  }

  return results;
}

// ============================================
// 부담금 계산 전용 함수
// ============================================

export interface LevyCalculationInput {
  totalEmployeeCount: number;  // 상시근로자 수
  disabledEmployeeCount: number;  // 실제 장애인 직원 수
  recognizedCount: number;  // 인정 장애인 수 (중증 2배 포함)
  companyType: string;  // PRIVATE_COMPANY | PUBLIC_INSTITUTION | GOVERNMENT
}

export interface LevyCalculationResult {
  // 입력값
  totalEmployeeCount: number;
  disabledEmployeeCount: number;
  recognizedCount: number;
  companyType: string;
  
  // 계산 결과
  quotaRate: number;  // 의무고용률 (0.031 or 0.038)
  obligatedCount: number;  // 의무고용인원 (floor)
  shortfallCount: number;  // 미달인원
  employmentRate: number;  // 고용률 (%)
  
  // 부담금 상세
  levyBaseAmount: number;  // 부담금 기초액 (2026: 1,294,128원)
  levyApplicationRate: number;  // 적용률 (0 ~ 1.0)
  levyPerPerson: number;  // 1인당 부담금
  totalLevy: number;  // 총 부담금
  
  // 참고 정보
  rateDescription: string;  // 고용률 구간 설명
}

/**
 * 부담금 계산기
 * 2026년 기준 최저임금(2,156,880원)의 60% = 1,294,128원
 */
export function calculateLevy(input: LevyCalculationInput): LevyCalculationResult {
  const { totalEmployeeCount, disabledEmployeeCount, recognizedCount, companyType } = input;
  
  // 1. 의무고용률 결정
  const quotaRate = QUOTA_RATES[companyType] || 0.031;
  
  // 2. 의무고용인원 (floor)
  const obligatedCount = Math.floor(totalEmployeeCount * quotaRate);
  
  // 3. 미달인원
  const shortfallCount = Math.max(0, obligatedCount - recognizedCount);
  
  // 4. 고용률 계산
  const employmentRate = obligatedCount > 0 
    ? (recognizedCount / obligatedCount) * 100 
    : 0;
  
  // 5. 부담금 적용률 결정
  let levyApplicationRate = 0;
  let rateDescription = "";
  
  if (recognizedCount === 0) {
    // ★ 0명 고용: 100% 적용 (기초액 전액)
    levyApplicationRate = 1.00;
    rateDescription = "0명 고용: 100% 적용 (기초액 전액)";
  } else if (employmentRate >= 100) {
    levyApplicationRate = 0;
    rateDescription = "100% 이상: 부담금 없음";
  } else if (employmentRate >= 75) {
    levyApplicationRate = 0.25;
    rateDescription = "75~100%: 25% 적용";
  } else if (employmentRate >= 50) {
    levyApplicationRate = 0.50;
    rateDescription = "50~75%: 50% 적용";
  } else if (employmentRate >= 25) {
    levyApplicationRate = 0.75;
    rateDescription = "25~50%: 75% 적용";
  } else {
    levyApplicationRate = 1.00;
    rateDescription = "0~25%: 100% 적용";
  }
  
  // 6. 1인당 부담금
  const levyPerPerson = Math.round(LEVY_BASE_AMOUNT * levyApplicationRate);
  
  // 7. 총 부담금
  const totalLevy = Math.round(shortfallCount * levyPerPerson);
  
  return {
    totalEmployeeCount,
    disabledEmployeeCount,
    recognizedCount,
    companyType,
    quotaRate,
    obligatedCount,
    shortfallCount,
    employmentRate,
    levyBaseAmount: LEVY_BASE_AMOUNT,
    levyApplicationRate,
    levyPerPerson,
    totalLevy,
    rateDescription,
  };
}
