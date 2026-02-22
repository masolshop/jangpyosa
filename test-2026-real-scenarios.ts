/**
 * 2026년 기준 부담금 계산 - 실제 부담금 발생 시나리오
 * 최저 월급여: 2,156,880원
 */

const LEVY_BASE_2026 = {
  LEVEL_0: 2156880,
  LEVEL_1_4: 1813000,
  LEVEL_1_4_TO_1_2: 1554000,
  LEVEL_1_2_TO_3_4: 1372700,
  LEVEL_3_4_OVER: 1295000,
};

const QUOTA_RATE = 0.031;

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

function isReportingRequired(monthlyCounts: number[]): boolean {
  const avg = monthlyCounts.reduce((a, b) => a + b, 0) / monthlyCounts.length;
  const max = Math.max(...monthlyCounts);
  return avg >= 100 || max >= 100;
}

console.log("====================================");
console.log("2026년 부담금 실제 발생 시나리오");
console.log("최저 월급여: 2,156,880원");
console.log("====================================\n");

// ============================================
// 시나리오 1: 1,000명 기업, 의무 31명, 실제 10명 고용
// ============================================
console.log("📊 시나리오 1: 1,000명 기업 (의무 31명, 실제 10명 고용)");
console.log("고용수준: 32.3% (1/4~1/2 미만)");
console.log("------------------------------------");

const s1_counts = [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000];
let s1_total = 0;

s1_counts.forEach((count, idx) => {
  const month = idx + 1;
  const obligated = Math.floor(count * QUOTA_RATE);
  const disabled = 10;
  const shortfall = Math.max(0, obligated - disabled);
  const levyBase = getLevyBase(disabled, obligated);
  const levy = shortfall * levyBase;
  
  s1_total += levy;
  
  console.log(`${month}월 | 근로자 ${count}명 | 의무 ${obligated}명 | 실제 ${disabled}명 | 미달 ${shortfall}명 | 부담기초액 ${levyBase.toLocaleString()}원 | 월부담금 ${levy.toLocaleString()}원`);
});

console.log();
console.log(`📌 연간 부담금 총액: ${s1_total.toLocaleString()}원`);
console.log("\n====================================\n");

// ============================================
// 시나리오 2: 1,000명 기업, 의무 31명, 실제 5명 고용
// ============================================
console.log("📊 시나리오 2: 1,000명 기업 (의무 31명, 실제 5명 고용)");
console.log("고용수준: 16.1% (1/4 미만)");
console.log("------------------------------------");

const s2_counts = [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000];
let s2_total = 0;

s2_counts.forEach((count, idx) => {
  const month = idx + 1;
  const obligated = Math.floor(count * QUOTA_RATE);
  const disabled = 5;
  const shortfall = Math.max(0, obligated - disabled);
  const levyBase = getLevyBase(disabled, obligated);
  const levy = shortfall * levyBase;
  
  s2_total += levy;
  
  console.log(`${month}월 | 근로자 ${count}명 | 의무 ${obligated}명 | 실제 ${disabled}명 | 미달 ${shortfall}명 | 부담기초액 ${levyBase.toLocaleString()}원 | 월부담금 ${levy.toLocaleString()}원`);
});

console.log();
console.log(`📌 연간 부담금 총액: ${s2_total.toLocaleString()}원`);
console.log("\n====================================\n");

// ============================================
// 시나리오 3: 1,000명 기업, 의무 31명, 실제 0명 고용
// ============================================
console.log("📊 시나리오 3: 1,000명 기업 (의무 31명, 실제 0명 고용 - 미고용)");
console.log("고용수준: 0% (미고용)");
console.log("------------------------------------");

const s3_counts = [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000];
let s3_total = 0;

s3_counts.forEach((count, idx) => {
  const month = idx + 1;
  const obligated = Math.floor(count * QUOTA_RATE);
  const disabled = 0;
  const shortfall = Math.max(0, obligated - disabled);
  const levyBase = getLevyBase(disabled, obligated);
  const levy = shortfall * levyBase;
  
  s3_total += levy;
  
  console.log(`${month}월 | 근로자 ${count}명 | 의무 ${obligated}명 | 실제 ${disabled}명 | 미달 ${shortfall}명 | 부담기초액 ${levyBase.toLocaleString()}원 | 월부담금 ${levy.toLocaleString()}원`);
});

console.log();
console.log(`📌 연간 부담금 총액: ${s3_total.toLocaleString()}원`);
console.log("\n====================================\n");

// ============================================
// 시나리오 4: 변동 인원 (월별 90~130명, 의무 3~4명, 실제 2명)
// ============================================
console.log("📊 시나리오 4: 변동 인원 (월별 90~130명, 실제 2명 고용)");
console.log("------------------------------------");

const s4_counts = [100, 90, 95, 105, 110, 115, 120, 125, 130, 120, 110, 100];
const s4_disabled = 2;
let s4_total = 0;

s4_counts.forEach((count, idx) => {
  const month = idx + 1;
  const obligated = Math.floor(count * QUOTA_RATE);
  const disabled = s4_disabled;
  const shortfall = Math.max(0, obligated - disabled);
  const levyBase = getLevyBase(disabled, obligated);
  const levy = shortfall * levyBase;
  const employmentRate = obligated > 0 ? (disabled / obligated * 100).toFixed(1) : "N/A";
  
  s4_total += levy;
  
  console.log(`${month}월 | 근로자 ${count}명 | 의무 ${obligated}명 | 실제 ${disabled}명 | 고용률 ${employmentRate}% | 미달 ${shortfall}명 | 부담기초액 ${levyBase.toLocaleString()}원 | 월부담금 ${levy.toLocaleString()}원`);
});

console.log();
console.log(`📌 연간 부담금 총액: ${s4_total.toLocaleString()}원`);
console.log("\n====================================\n");

// ============================================
// 요약 테이블
// ============================================
console.log("📋 부담금 총액 요약 (2026년 기준)");
console.log("------------------------------------");
console.log(`시나리오 1 (1,000명, 의무 31명, 실제 10명): ${s1_total.toLocaleString()}원/년`);
console.log(`시나리오 2 (1,000명, 의무 31명, 실제 5명): ${s2_total.toLocaleString()}원/년`);
console.log(`시나리오 3 (1,000명, 의무 31명, 실제 0명): ${s3_total.toLocaleString()}원/년`);
console.log(`시나리오 4 (변동 90~130명, 실제 2명): ${s4_total.toLocaleString()}원/년`);
console.log("\n====================================\n");

// ============================================
// 2025년 vs 2026년 비교
// ============================================
console.log("📊 2025년 vs 2026년 부담기초액 비교");
console.log("------------------------------------");
console.log("고용수준 | 2025년 | 2026년 | 증가율");
console.log("미고용 (0명) | 2,096,270원 | 2,156,880원 | +2.9%");
console.log("1/4 미만 | 1,761,200원 | 1,813,000원 | +2.9%");
console.log("1/4~1/2 미만 | 1,509,600원 | 1,554,000원 | +2.9%");
console.log("1/2~3/4 미만 | 1,333,480원 | 1,372,700원 | +2.9%");
console.log("3/4 이상 | 1,258,000원 | 1,295,000원 | +2.9%");
console.log("\n====================================");
