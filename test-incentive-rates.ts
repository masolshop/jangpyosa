/**
 * 2026년 장려금 단가 테스트 스크립트
 * 고용노동부 공식 단가 검증
 */

// 2026년 고용장려금 단가
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

// 장려금 기본 단가 조회 함수
function getBaseIncentiveRate(
  severity: "SEVERE" | "MILD",
  gender: "M" | "F" | "MALE" | "FEMALE"
): number {
  const normalizedGender = (gender === "M" || gender === "MALE") ? "MALE" : "FEMALE";
  return INCENTIVE_RATES_2026[severity][normalizedGender];
}

// 월임금액 60% 상한 적용
function calculateIncentive(
  severity: "SEVERE" | "MILD",
  gender: "M" | "F",
  monthlySalary: number
): { baseRate: number; wageLimit: number; actualIncentive: number } {
  const baseRate = getBaseIncentiveRate(severity, gender);
  const wageLimit = monthlySalary * 0.6;
  const actualIncentive = Math.min(baseRate, wageLimit);
  
  return { baseRate, wageLimit, actualIncentive };
}

// 테스트 케이스
console.log("=".repeat(80));
console.log("2026년 고용장려금 단가 테스트");
console.log("=".repeat(80));

console.log("\n✅ 고용노동부 공식 지급 단가");
console.log("  - 경증 남성: 350,000원");
console.log("  - 경증 여성: 500,000원");
console.log("  - 중증 남성: 700,000원");
console.log("  - 중증 여성: 900,000원");

console.log("\n" + "=".repeat(80));
console.log("테스트 1: 기본 단가 조회");
console.log("=".repeat(80));

const tests = [
  { severity: "MILD" as const, gender: "M" as const, expected: 350000, label: "경증 남성" },
  { severity: "MILD" as const, gender: "F" as const, expected: 500000, label: "경증 여성" },
  { severity: "SEVERE" as const, gender: "M" as const, expected: 700000, label: "중증 남성" },
  { severity: "SEVERE" as const, gender: "F" as const, expected: 900000, label: "중증 여성" }
];

tests.forEach(test => {
  const rate = getBaseIncentiveRate(test.severity, test.gender);
  const pass = rate === test.expected ? "✅" : "❌";
  console.log(`${pass} ${test.label}: ${rate.toLocaleString()}원 (예상: ${test.expected.toLocaleString()}원)`);
});

console.log("\n" + "=".repeat(80));
console.log("테스트 2: 월임금액 60% 상한 적용");
console.log("=".repeat(80));

const salaryTests = [
  { 
    name: "홍길동", 
    severity: "SEVERE" as const, 
    gender: "M" as const, 
    salary: 1500000,
    expected: 700000 // MIN(700000, 1500000*0.6=900000) = 700000
  },
  { 
    name: "김경선", 
    severity: "MILD" as const, 
    gender: "F" as const, 
    salary: 2000000,
    expected: 500000 // MIN(500000, 2000000*0.6=1200000) = 500000
  },
  { 
    name: "김명철", 
    severity: "SEVERE" as const, 
    gender: "M" as const, 
    salary: 800000,
    expected: 480000 // MIN(700000, 800000*0.6=480000) = 480000
  },
  { 
    name: "정숙이", 
    severity: "MILD" as const, 
    gender: "F" as const, 
    salary: 1000000,
    expected: 500000 // MIN(500000, 1000000*0.6=600000) = 500000
  }
];

salaryTests.forEach(test => {
  const result = calculateIncentive(test.severity, test.gender, test.salary);
  const pass = result.actualIncentive === test.expected ? "✅" : "❌";
  
  console.log(`\n${pass} ${test.name} (${test.severity === "SEVERE" ? "중증" : "경증"} ${test.gender === "M" ? "남" : "여"})`);
  console.log(`   월급여: ${test.salary.toLocaleString()}원`);
  console.log(`   기본단가: ${result.baseRate.toLocaleString()}원`);
  console.log(`   60%상한: ${result.wageLimit.toLocaleString()}원`);
  console.log(`   실지급액: ${result.actualIncentive.toLocaleString()}원 (예상: ${test.expected.toLocaleString()}원)`);
});

console.log("\n" + "=".repeat(80));
console.log("테스트 3: buyer01 근로자 시뮬레이션 (2026년 1월)");
console.log("=".repeat(80));

// buyer01 실제 근로자 데이터 (가정)
const buyer01Employees = [
  { name: "중증1", severity: "SEVERE" as const, gender: "M" as const, salary: 2500000 },
  { name: "중증2", severity: "SEVERE" as const, gender: "M" as const, salary: 2200000 },
  { name: "중증3", severity: "SEVERE" as const, gender: "M" as const, salary: 2800000 },
  { name: "중증4", severity: "SEVERE" as const, gender: "F" as const, salary: 3000000 },
  { name: "경증1", severity: "MILD" as const, gender: "M" as const, salary: 2000000 },
  { name: "경증2", severity: "MILD" as const, gender: "M" as const, salary: 2100000 },
  { name: "경증3", severity: "MILD" as const, gender: "F" as const, salary: 2200000 },
  { name: "경증4", severity: "MILD" as const, gender: "F" as const, salary: 1900000 },
  { name: "경증5", severity: "MILD" as const, gender: "M" as const, salary: 2300000 },
  { name: "경증6", severity: "MILD" as const, gender: "F" as const, salary: 2400000 },
  { name: "경증7", severity: "MILD" as const, gender: "M" as const, salary: 2000000 }
];

let totalIncentive = 0;

console.log("\n근로자별 장려금:");
buyer01Employees.forEach((emp, idx) => {
  const result = calculateIncentive(emp.severity, emp.gender, emp.salary);
  totalIncentive += result.actualIncentive;
  
  const severityKr = emp.severity === "SEVERE" ? "중증" : "경증";
  const genderKr = emp.gender === "M" ? "남" : "여";
  
  console.log(`${idx + 1}. ${emp.name} (${severityKr}/${genderKr}): ${result.actualIncentive.toLocaleString()}원 ` +
    `(단가 ${result.baseRate.toLocaleString()}, 월급 ${emp.salary.toLocaleString()})`);
});

console.log(`\n📊 총 장려금: ${totalIncentive.toLocaleString()}원`);

console.log("\n" + "=".repeat(80));
console.log("✅ 모든 테스트 완료!");
console.log("=".repeat(80));
