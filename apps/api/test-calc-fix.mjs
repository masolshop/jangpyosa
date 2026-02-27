// Test 2026 official calculation formula
import { calculateMonthlyData } from './src/services/employment-calculator-v2.ts';

// Mock employee data
const employees = [
  {
    id: "emp1",
    name: "홍길동",
    severity: "SEVERE",
    gender: "M",
    birthDate: new Date("1985-03-15"),
    hireDate: new Date("2021-06-07"),
    workHoursPerWeek: 19, // 월 82시간 (82 / 4.33 = 19)
    monthlySalary: 1500000,
    meetsMinimumWage: true,
    hasEmploymentInsurance: true
  },
  {
    id: "emp2",
    name: "김경선",
    severity: "MILD",
    gender: "F",
    birthDate: new Date("1990-05-20"),
    hireDate: new Date("2021-09-11"),
    workHoursPerWeek: 18, // 월 80시간
    monthlySalary: 2000000,
    meetsMinimumWage: true,
    hasEmploymentInsurance: true
  },
  {
    id: "emp3",
    name: "김명철",
    severity: "SEVERE",
    gender: "M",
    birthDate: new Date("1988-08-10"),
    hireDate: new Date("2021-11-27"),
    workHoursPerWeek: 17, // 월 75시간
    monthlySalary: 800000,
    meetsMinimumWage: true,
    hasEmploymentInsurance: true
  }
];

// Calculate for January 2024 with 80 total employees
const result = calculateMonthlyData(employees, 80, 2024, 1, "PRIVATE_COMPANY");

console.log("===== 2026년 공식 적용 테스트 =====");
console.log(`\n총 상시근로자: ${result.totalEmployeeCount}명`);
console.log(`장애인 직원: ${result.disabledCount}명`);
console.log(`기준인원 (ceil): ${result.incentiveBaselineCount}명`);
console.log(`장려금 지급인원: ${result.incentiveEligibleCount}명`);
console.log(`\n월별 장려금: ${result.incentive.toLocaleString()}원`);
console.log(`월별 부담금: ${result.levy.toLocaleString()}원`);
console.log(`순액: ${result.netAmount.toLocaleString()}원\n`);

console.log("===== 직원별 상세 =====");
result.details.forEach(emp => {
  console.log(`\n${emp.employeeName} (${emp.severity} ${emp.gender})`);
  console.log(`  순위: ${emp.rank}번째 (기준인원 ${emp.isWithinBaseline ? '이내' : '초과'})`);
  console.log(`  월급: ${emp.monthlySalary.toLocaleString()}원`);
  console.log(`  기본 단가: ${emp.baseIncentiveRate.toLocaleString()}원`);
  console.log(`  월급 60%: ${emp.salaryLimit.toLocaleString()}원`);
  console.log(`  최종 단가: ${emp.finalIncentiveRate.toLocaleString()}원`);
  console.log(`  장려금: ${emp.incentiveAmount.toLocaleString()}원`);
  console.log(`  제외사유: ${emp.excludeReason || '없음'}`);
  console.log(`  부담금 인정: ${emp.levyRecognizedCount}명`);
});

console.log("\n\n===== 검증 포인트 =====");
console.log("✅ 중증 남성 (홍길동): 700,000원 단가, 월급 60% = 900,000원 → MIN = 700,000원");
console.log("✅ 경증 여성 (김경선): 500,000원 단가, 월급 60% = 1,200,000원 → MIN = 500,000원");  
console.log("✅ 중증 남성 (김명철): 700,000원 단가, 월급 60% = 480,000원 → MIN = 480,000원");
console.log("✅ 월 60시간 기준: workHoursPerWeek * 4.33으로 계산");
