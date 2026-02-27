/**
 * 🏖️ 연차(휴가) 계산 로직
 * 
 * 근로기준법 기준 (상시근로자 5인 이상 사업장)
 * - 1년 미만: 매월 1일 발생 (최대 11일)
 * - 1년 이상: 15일 + 2년마다 1일 추가 (최대 25일)
 */

export interface AnnualLeaveInfo {
  // 기본 정보
  employeeId: string;
  employeeName: string;
  hireDate: Date;
  workYears: number;        // 근속연수
  workMonths: number;       // 근속개월수
  
  // 연차 발생
  totalGenerated: number;   // 총 발생 연차
  baseLeave: number;        // 기본 연차 (15일 or 개근일수)
  bonusLeave: number;       // 가산 연차 (2년마다 1일)
  
  // 연차 사용
  used: number;             // 사용한 연차
  remaining: number;        // 남은 연차
  
  // 추가 정보
  isUnderOneYear: boolean;  // 1년 미만 여부
  expiryDate: Date | null;  // 연차 소멸일 (1년 후)
  monthlyAccrual: number;   // 월별 발생 (1년 미만용)
}

/**
 * 근속연수 계산
 */
export function calculateWorkYears(hireDate: Date, currentDate: Date = new Date()): {
  years: number;
  months: number;
  totalMonths: number;
} {
  const hireTime = hireDate.getTime();
  const currentTime = currentDate.getTime();
  
  if (hireTime > currentTime) {
    return { years: 0, months: 0, totalMonths: 0 };
  }
  
  let years = currentDate.getFullYear() - hireDate.getFullYear();
  let months = currentDate.getMonth() - hireDate.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // 일자 비교 (해당 월의 입사일이 지나지 않았으면 -1개월)
  if (currentDate.getDate() < hireDate.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }
  
  const totalMonths = years * 12 + months;
  
  return { years, months, totalMonths };
}

/**
 * 1년 미만 근로자 연차 계산
 * - 매월 개근 시 1일 발생
 * - 최대 11일
 */
export function calculateLeaveLessThanOneYear(workMonths: number): number {
  // 입사 첫 달은 제외, 그 다음 달부터 개근 시 1일씩 발생
  // 예: 1월 15일 입사 → 2월 개근 시 1일, 3월 개근 시 1일... (최대 11일)
  return Math.min(workMonths, 11);
}

/**
 * 1년 이상 근로자 연차 계산
 * - 기본 15일
 * - 3년 이상부터 2년마다 1일 추가
 * - 최대 25일
 */
export function calculateLeaveOverOneYear(workYears: number): {
  baseLeave: number;
  bonusLeave: number;
  total: number;
} {
  const baseLeave = 15;
  
  // 3년 이상부터 가산 (2년마다 1일)
  // 계산식: floor((근속연수 - 1) / 2)
  const bonusLeave = workYears >= 3 ? Math.floor((workYears - 1) / 2) : 0;
  
  // 최대 25일
  const total = Math.min(baseLeave + bonusLeave, 25);
  
  return { baseLeave, bonusLeave, total };
}

/**
 * 회계연도 기준 비례 계산
 * - 중도 입사자는 비례하여 부여
 * - 계산식: (남은 개월 ÷ 12) × 15일
 */
export function calculateProportionalLeave(
  hireDate: Date,
  fiscalYearStart: Date = new Date(new Date().getFullYear(), 0, 1) // 기본: 매년 1월 1일
): number {
  const fiscalYearEnd = new Date(fiscalYearStart.getFullYear(), 11, 31);
  
  // 입사일이 회계연도 시작 이전이면 15일 전체
  if (hireDate <= fiscalYearStart) {
    return 15;
  }
  
  // 입사일이 회계연도 종료 이후면 0일
  if (hireDate > fiscalYearEnd) {
    return 0;
  }
  
  // 남은 개월 수 계산
  const remainingMonths = 
    (fiscalYearEnd.getFullYear() - hireDate.getFullYear()) * 12 +
    (fiscalYearEnd.getMonth() - hireDate.getMonth()) + 1;
  
  // 비례 계산: (남은 개월 ÷ 12) × 15일
  const proportional = Math.round((remainingMonths / 12) * 15);
  
  return Math.min(proportional, 15);
}

/**
 * 직원의 연차 정보 전체 계산
 * 
 * @param employeeId 직원 ID
 * @param employeeName 직원 이름
 * @param hireDate 입사일
 * @param usedLeave 사용한 연차 일수
 * @param currentDate 기준일 (기본: 오늘)
 * @param useProportional 회계연도 기준 사용 여부 (기본: false, 입사일 기준)
 */
export function calculateAnnualLeave(
  employeeId: string,
  employeeName: string,
  hireDate: Date,
  usedLeave: number = 0,
  currentDate: Date = new Date(),
  useProportional: boolean = false
): AnnualLeaveInfo {
  const { years, months, totalMonths } = calculateWorkYears(hireDate, currentDate);
  
  const isUnderOneYear = years < 1;
  
  let baseLeave: number;
  let bonusLeave: number;
  let totalGenerated: number;
  let monthlyAccrual: number = 0;
  
  if (isUnderOneYear) {
    // 1년 미만: 매월 1일 (최대 11일)
    monthlyAccrual = 1;
    baseLeave = calculateLeaveLessThanOneYear(totalMonths);
    bonusLeave = 0;
    totalGenerated = baseLeave;
  } else {
    // 1년 이상
    if (useProportional) {
      // 회계연도 기준 (선택 사항)
      baseLeave = calculateProportionalLeave(hireDate, currentDate);
      bonusLeave = 0;
      totalGenerated = baseLeave;
    } else {
      // 입사일 기준 (원칙)
      const leaveCalc = calculateLeaveOverOneYear(years);
      baseLeave = leaveCalc.baseLeave;
      bonusLeave = leaveCalc.bonusLeave;
      totalGenerated = leaveCalc.total;
    }
  }
  
  // 남은 연차 = 발생 연차 - 사용 연차
  const remaining = Math.max(0, totalGenerated - usedLeave);
  
  // 연차 소멸일 (발생일로부터 1년 후)
  let expiryDate: Date | null = null;
  if (isUnderOneYear) {
    // 1년 미만자는 1년 경과 시점
    expiryDate = new Date(hireDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  } else {
    // 1년 이상자는 발생일로부터 1년 후
    const anniversaryDate = new Date(hireDate);
    anniversaryDate.setFullYear(currentDate.getFullYear());
    if (anniversaryDate > currentDate) {
      anniversaryDate.setFullYear(anniversaryDate.getFullYear() - 1);
    }
    expiryDate = new Date(anniversaryDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  }
  
  return {
    employeeId,
    employeeName,
    hireDate,
    workYears: years,
    workMonths: totalMonths,
    totalGenerated,
    baseLeave,
    bonusLeave,
    used: usedLeave,
    remaining,
    isUnderOneYear,
    expiryDate,
    monthlyAccrual,
  };
}

/**
 * 퇴사 시 미사용 연차 수당 계산
 * 
 * @param remainingLeave 남은 연차 일수
 * @param dailyWage 1일 통상임금
 */
export function calculateUnusedLeavePayment(
  remainingLeave: number,
  dailyWage: number
): number {
  return remainingLeave * dailyWage;
}

/**
 * 1일 통상임금 계산
 * 
 * @param monthlySalary 월 급여
 */
export function calculateDailyWage(monthlySalary: number): number {
  // 월 통상임금 ÷ 30일 (또는 주 40시간 기준 209시간 ÷ 7일)
  // 간단하게: 월급 ÷ 30일
  return Math.round(monthlySalary / 30);
}

/**
 * 연차 촉진 알림 날짜 계산
 * 
 * @param expiryDate 연차 소멸일
 */
export function getLeavePromotionDates(expiryDate: Date): {
  firstNotice: Date;   // 6개월 전
  secondNotice: Date;  // 2개월 전
  expiryDate: Date;
} {
  const firstNotice = new Date(expiryDate);
  firstNotice.setMonth(firstNotice.getMonth() - 6);
  
  const secondNotice = new Date(expiryDate);
  secondNotice.setMonth(secondNotice.getMonth() - 2);
  
  return {
    firstNotice,
    secondNotice,
    expiryDate,
  };
}

/**
 * 연차 촉진 필요 여부 확인
 * 
 * @param expiryDate 연차 소멸일
 * @param currentDate 기준일
 */
export function needsLeavePromotion(
  expiryDate: Date,
  currentDate: Date = new Date()
): {
  needsFirstNotice: boolean;
  needsSecondNotice: boolean;
  daysUntilExpiry: number;
} {
  const { firstNotice, secondNotice } = getLeavePromotionDates(expiryDate);
  
  const needsFirstNotice = currentDate >= firstNotice && currentDate < secondNotice;
  const needsSecondNotice = currentDate >= secondNotice && currentDate < expiryDate;
  
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return {
    needsFirstNotice,
    needsSecondNotice,
    daysUntilExpiry,
  };
}

/**
 * 연차 계산 예시 출력 (테스트용)
 */
export function printLeaveExample() {
  console.log("=== 연차 계산 예시 ===\n");
  
  // 예시 1: 6개월 근무
  const example1 = calculateAnnualLeave(
    "emp1",
    "홍길동",
    new Date(2024, 6, 1), // 2024년 7월 1일 입사
    0,
    new Date(2025, 0, 1)  // 2025년 1월 1일 기준
  );
  console.log("1️⃣ 6개월 근무자 (2024.07.01 입사):");
  console.log(`   - 근속: ${example1.workMonths}개월`);
  console.log(`   - 발생 연차: ${example1.totalGenerated}일 (매월 1일)`);
  console.log(`   - 남은 연차: ${example1.remaining}일\n`);
  
  // 예시 2: 1년 근무
  const example2 = calculateAnnualLeave(
    "emp2",
    "김철수",
    new Date(2024, 0, 1), // 2024년 1월 1일 입사
    0,
    new Date(2025, 0, 1)  // 2025년 1월 1일 기준
  );
  console.log("2️⃣ 1년 근무자 (2024.01.01 입사):");
  console.log(`   - 근속: ${example2.workYears}년`);
  console.log(`   - 발생 연차: ${example2.totalGenerated}일`);
  console.log(`   - 남은 연차: ${example2.remaining}일\n`);
  
  // 예시 3: 3년 근무
  const example3 = calculateAnnualLeave(
    "emp3",
    "이영희",
    new Date(2022, 0, 1), // 2022년 1월 1일 입사
    0,
    new Date(2025, 0, 1)  // 2025년 1월 1일 기준
  );
  console.log("3️⃣ 3년 근무자 (2022.01.01 입사):");
  console.log(`   - 근속: ${example3.workYears}년`);
  console.log(`   - 기본 연차: ${example3.baseLeave}일`);
  console.log(`   - 가산 연차: ${example3.bonusLeave}일`);
  console.log(`   - 총 연차: ${example3.totalGenerated}일`);
  console.log(`   - 남은 연차: ${example3.remaining}일\n`);
  
  // 예시 4: 7년 근무
  const example4 = calculateAnnualLeave(
    "emp4",
    "박민수",
    new Date(2018, 0, 1), // 2018년 1월 1일 입사
    5,                    // 5일 사용
    new Date(2025, 0, 1)  // 2025년 1월 1일 기준
  );
  console.log("4️⃣ 7년 근무자 (2018.01.01 입사, 5일 사용):");
  console.log(`   - 근속: ${example4.workYears}년`);
  console.log(`   - 기본 연차: ${example4.baseLeave}일`);
  console.log(`   - 가산 연차: ${example4.bonusLeave}일`);
  console.log(`   - 총 연차: ${example4.totalGenerated}일`);
  console.log(`   - 사용: ${example4.used}일`);
  console.log(`   - 남은 연차: ${example4.remaining}일\n`);
  
  // 퇴사 시 수당 계산
  const dailyWage = calculateDailyWage(3000000);
  const payment = calculateUnusedLeavePayment(example4.remaining, dailyWage);
  console.log("5️⃣ 퇴사 시 미사용 연차 수당:");
  console.log(`   - 1일 통상임금: ${dailyWage.toLocaleString()}원`);
  console.log(`   - 남은 연차: ${example4.remaining}일`);
  console.log(`   - 지급액: ${payment.toLocaleString()}원\n`);
}
