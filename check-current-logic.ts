// 현재 로직 vs 올바른 로직 비교

// buyer01 3월 가정 데이터
const employees = [
  { name: "중증여1", severity: "SEVERE", gender: "F", salary: 1_000_000, rate: 900_000, amount: 600_000 }, // 60% 상한
  { name: "중증남1", severity: "SEVERE", gender: "M", salary: 3_000_000, rate: 700_000, amount: 700_000 },
  { name: "중증남2", severity: "SEVERE", gender: "M", salary: 3_000_000, rate: 700_000, amount: 700_000 },
  { name: "중증남3", severity: "SEVERE", gender: "M", salary: 3_000_000, rate: 700_000, amount: 700_000 },
  { name: "경증남1", severity: "MILD", gender: "M", salary: 2_500_000, rate: 350_000, amount: 350_000 },
  { name: "경증남2", severity: "MILD", gender: "M", salary: 2_500_000, rate: 350_000, amount: 350_000 },
  { name: "경증남3", severity: "MILD", gender: "M", salary: 2_500_000, rate: 350_000, amount: 350_000 },
  { name: "경증남4", severity: "MILD", gender: "M", salary: 2_500_000, rate: 350_000, amount: 350_000 },
  { name: "경증남5", severity: "MILD", gender: "M", salary: 2_500_000, rate: 350_000, amount: 350_000 },
  { name: "경증남6", severity: "MILD", gender: "M", salary: 2_500_000, rate: 350_000, amount: 350_000 },
  { name: "경증남7", severity: "MILD", gender: "M", salary: 2_500_000, rate: 350_000, amount: 350_000 },
];

const totalEmployees = 300;
const quotaRate = 0.031;

// 부담금 기준
const obligatedCount = Math.floor(totalEmployees * quotaRate); // 9
const recognizedCount = 7 + (4 * 2); // 15

// 장려금 기준
const incentiveBaseCount = Math.ceil(totalEmployees * quotaRate); // 10
const disabledCount = 11;
const eligibleCount = disabledCount - incentiveBaseCount; // 1

console.log('=== 계산 비교 ===\n');
console.log(`의무고용인원: ${obligatedCount}명`);
console.log(`인정수: ${recognizedCount}명`);
console.log(`초과: ${recognizedCount - obligatedCount}명 ← UI 표시용`);
console.log();
console.log(`장려금 지급기준: ${incentiveBaseCount}명`);
console.log(`장애인 수: ${disabledCount}명`);
console.log(`장려금 대상: ${eligibleCount}명\n`);

// 🔴 현재 로직 (잘못됨)
const currentTotal = employees.reduce((sum, e) => sum + e.amount, 0);
console.log(`❌ 현재 로직 (모두 합산): ${currentTotal.toLocaleString()}원`);
console.log(`   → 11명 모두 합산\n`);

// ✅ 올바른 로직
const sorted = [...employees].sort((a, b) => b.amount - a.amount);
const selected = sorted.slice(0, eligibleCount);
const correctTotal = selected.reduce((sum, e) => sum + e.amount, 0);

console.log(`✅ 올바른 로직 (상위 ${eligibleCount}명):`);
selected.forEach(e => {
  console.log(`   ${e.name}: ${e.amount.toLocaleString()}원`);
});
console.log(`   합계: ${correctTotal.toLocaleString()}원\n`);

console.log(`🎯 결론:`);
console.log(`   현재: ${currentTotal.toLocaleString()}원 (11명 전체)`);
console.log(`   정답: ${correctTotal.toLocaleString()}원 (상위 1명)`);
console.log(`   차이: ${(currentTotal - correctTotal).toLocaleString()}원`);

