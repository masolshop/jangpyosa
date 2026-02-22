/**
 * 2026년 기준 부담금 계산 시나리오 검증
 * 최저 월급여: 2,156,880원
 */

// 고용수준별 부담기초액 (2026년)
const LEVY_BASE_2026 = {
  LEVEL_0: 2156880,        // 0명 고용 (미고용)
  LEVEL_1_4: 1813000,      // 1/4 미만
  LEVEL_1_4_TO_1_2: 1554000,  // 1/4 ~ 1/2 미만
  LEVEL_1_2_TO_3_4: 1372700,  // 1/2 ~ 3/4 미만
  LEVEL_3_4_OVER: 1295000,    // 3/4 이상
};

const QUOTA_RATE = 0.031; // 민간기업 3.1%

// 고용수준에 따른 부담기초액 결정
function getLevyBase(disabledCount: number, obligatedCount: number): number {
  if (obligatedCount === 0 || disabledCount === 0) {
    return LEVY_BASE_2026.LEVEL_0;
  }
  
  const employmentRate = disabledCount / obligatedCount;
  
  if (employmentRate >= 0.75) return LEVY_BASE_2026.LEVEL_3_4_OVER;
  if (employmentRate >= 0.5) return LEVY_BASE_2026.LEVEL_1_2_TO_3_4;
  if (employmentRate >= 0.25) return LEVY_BASE_2026.LEVEL_1_4_TO_1_2;
  return LEVY_BASE_2026.LEVEL_1_4;
}

// 신고대상 판정: 상시근로자 100명 이상 (연평균 ≥ 100 또는 월최대 ≥ 100)
function isReportingRequired(monthlyCounts: number[]): boolean {
  const avg = monthlyCounts.reduce((a, b) => a + b, 0) / monthlyCounts.length;
  const max = Math.max(...monthlyCounts);
  return avg >= 100 || max >= 100;
}

console.log("====================================");
console.log("2026년 부담금 계산 시나리오");
console.log("최저 월급여: 2,156,880원");
console.log("====================================\n");

// ============================================
// 시나리오 1: 상시근로자 1,060명 (월별 70~110명)
// ============================================
console.log("📊 시나리오 1: 상시근로자 1,060명 (월별 70~110명)");
console.log("------------------------------------");

const scenario1 = [90, 70, 75, 80, 85, 90, 95, 100, 105, 110, 80, 85];
const avg1 = scenario1.reduce((a, b) => a + b, 0) / scenario1.length;
const max1 = Math.max(...scenario1);
const isRequired1 = isReportingRequired(scenario1);

console.log(`월별 인원: ${scenario1.join(", ")}`);
console.log(`연평균: ${avg1.toFixed(1)}명`);
console.log(`월최대: ${max1}명`);
console.log(`신고대상 여부: ${isRequired1 ? "✅ 예 (연평균 ≥ 100 또는 월최대 ≥ 100)" : "❌ 아니오"}`);
console.log();

if (isRequired1) {
  console.log("✅ 신고대상 → 부담금 계산 진행");
  console.log();
  
  let totalLevy = 0;
  
  scenario1.forEach((count, idx) => {
    const month = idx + 1;
    const obligated = Math.floor(count * QUOTA_RATE);
    const disabled = 28; // 가정
    const shortfall = Math.max(0, obligated - disabled);
    const levyBase = getLevyBase(disabled, obligated);
    const levy = shortfall * levyBase;
    
    totalLevy += levy;
    
    const employmentRate = obligated > 0 ? (disabled / obligated * 100).toFixed(1) : "N/A";
    
    console.log(`${month}월 | 근로자 ${count}명 | 의무 ${obligated}명 | 실제 ${disabled}명 | 고용률 ${employmentRate}% | 미달 ${shortfall}명 | 부담기초액 ${levyBase.toLocaleString()}원 | 월부담금 ${levy.toLocaleString()}원`);
  });
  
  console.log();
  console.log(`📌 연간 부담금 총액: ${totalLevy.toLocaleString()}원`);
} else {
  console.log("❌ 신고대상 아님 → 부담금 없음");
}

console.log("\n====================================\n");

// ============================================
// 시나리오 2: 상시근로자 1,410명 (월별 90~130명)
// ============================================
console.log("📊 시나리오 2: 상시근로자 1,410명 (월별 90~130명)");
console.log("------------------------------------");

const scenario2 = [100, 90, 95, 105, 110, 115, 120, 125, 130, 120, 110, 100];
const avg2 = scenario2.reduce((a, b) => a + b, 0) / scenario2.length;
const max2 = Math.max(...scenario2);
const isRequired2 = isReportingRequired(scenario2);

console.log(`월별 인원: ${scenario2.join(", ")}`);
console.log(`연평균: ${avg2.toFixed(1)}명`);
console.log(`월최대: ${max2}명`);
console.log(`신고대상 여부: ${isRequired2 ? "✅ 예 (연평균 ≥ 100 또는 월최대 ≥ 100)" : "❌ 아니오"}`);
console.log();

if (isRequired2) {
  console.log("✅ 신고대상 → 부담금 계산 진행");
  console.log();
  
  let totalLevy2 = 0;
  
  scenario2.forEach((count, idx) => {
    const month = idx + 1;
    const obligated = Math.floor(count * QUOTA_RATE);
    const disabled = 37; // 가정
    const shortfall = Math.max(0, obligated - disabled);
    const levyBase = getLevyBase(disabled, obligated);
    const levy = shortfall * levyBase;
    
    totalLevy2 += levy;
    
    const employmentRate = obligated > 0 ? (disabled / obligated * 100).toFixed(1) : "N/A";
    
    console.log(`${month}월 | 근로자 ${count}명 | 의무 ${obligated}명 | 실제 ${disabled}명 | 고용률 ${employmentRate}% | 미달 ${shortfall}명 | 부담기초액 ${levyBase.toLocaleString()}원 | 월부담금 ${levy.toLocaleString()}원`);
  });
  
  console.log();
  console.log(`📌 연간 부담금 총액: ${totalLevy2.toLocaleString()}원`);
} else {
  console.log("❌ 신고대상 아님 → 부담금 없음");
}

console.log("\n====================================\n");

// ============================================
// 고용수준별 부담기초액 테이블
// ============================================
console.log("📋 고용수준별 부담기초액 (2026년)");
console.log("------------------------------------");
console.log("고용수준 0명 (미고용): 2,156,880원");
console.log("고용수준 1/4 미만: 1,813,000원");
console.log("고용수준 1/4 ~ 1/2 미만: 1,554,000원");
console.log("고용수준 1/2 ~ 3/4 미만: 1,372,700원");
console.log("고용수준 3/4 이상: 1,295,000원");
console.log("\n====================================\n");

// ============================================
// 예제: 다양한 고용수준별 부담금 계산
// ============================================
console.log("📈 고용수준별 부담금 예제");
console.log("------------------------------------");
console.log("조건: 상시근로자 1,000명, 의무고용 31명\n");

const examples = [
  { disabled: 0, desc: "0명 고용 (미고용)" },
  { disabled: 5, desc: "5명 고용 (16.1%, 1/4 미만)" },
  { disabled: 10, desc: "10명 고용 (32.3%, 1/4~1/2 미만)" },
  { disabled: 18, desc: "18명 고용 (58.1%, 1/2~3/4 미만)" },
  { disabled: 25, desc: "25명 고용 (80.6%, 3/4 이상)" },
  { disabled: 31, desc: "31명 고용 (100%, 부담금 없음)" },
];

examples.forEach((ex) => {
  const obligated = 31;
  const shortfall = Math.max(0, obligated - ex.disabled);
  const levyBase = getLevyBase(ex.disabled, obligated);
  const levy = shortfall * levyBase;
  const employmentRate = obligated > 0 ? (ex.disabled / obligated * 100).toFixed(1) : "0.0";
  
  console.log(`${ex.desc}`);
  console.log(`  - 고용률: ${employmentRate}% | 미달: ${shortfall}명 | 부담기초액: ${levyBase.toLocaleString()}원`);
  console.log(`  - 월 부담금: ${levy.toLocaleString()}원 | 연 부담금: ${(levy * 12).toLocaleString()}원`);
  console.log();
});

console.log("====================================");
