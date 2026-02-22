// buyer01 3월 2026 실제 데이터 검증

const data = {
  상시근로자수: 300,
  의무고용률: 0.031,
  장애인근로자수: 11,
  경증: 7,
  중증: 4,
  인정수: 7 + (4 * 2) // 경증 7 + 중증 8 = 15
};

console.log('=== buyer01 2026년 3월 검증 ===\n');

// 1. 의무고용인원 (부담금 기준)
const obligatedCount = Math.floor(data.상시근로자수 * data.의무고용률);
console.log(`1️⃣ 의무고용인원 (부담금): floor(${data.상시근로자수} × 3.1%) = ${obligatedCount}명`);

// 2. 장려금 지급기준인원
const incentiveBaseCount = Math.ceil(data.상시근로자수 * data.의무고용률);
console.log(`2️⃣ 장려금 지급기준: ceil(${data.상시근로자수} × 3.1%) = ${incentiveBaseCount}명`);

// 3. 인정수
console.log(`3️⃣ 인정수: 경증 ${data.경증} + 중증 ${data.중증}×2 = ${data.인정수}명`);

// 4. 미달/초과 (부담금 기준)
const shortfall = Math.max(0, obligatedCount - data.인정수);
const surplus = Math.max(0, data.인정수 - obligatedCount);
console.log(`\n📊 부담금 기준 (의무고용 ${obligatedCount}명):`);
console.log(`   미달: ${shortfall}명`);
console.log(`   초과: ${surplus}명`);

// 5. 장려금 지급 대상
const incentiveEligible = Math.max(0, data.장애인근로자수 - incentiveBaseCount);
console.log(`\n💰 장려금 계산:`);
console.log(`   지급대상: ${data.장애인근로자수} - ${incentiveBaseCount} = ${incentiveEligible}명`);
console.log(`   실제 장려금: 600,000원 (중증 여성 1명, 60% 상한 적용)`);

console.log('\n✅ 결론:');
console.log(`   - 의무고용인원: ${obligatedCount}명 (부담금 기준)`);
console.log(`   - 인정수: ${data.인정수}명`);
console.log(`   - 초과인원: ${surplus}명 ← 이게 +6이 맞음`);
console.log(`   - 장려금 지급기준: ${incentiveBaseCount}명`);
console.log(`   - 장려금 대상: ${incentiveEligible}명 ← 이게 +1이 맞음`);
console.log(`\n🔴 문제: 현재 UI에 "미달/초과"가 +1로 표시되고 있다면 잘못됨!`);
console.log(`   - 미달/초과는 "인정수 vs 의무고용인원" 비교 → ${surplus}명`);
console.log(`   - 장려금 지급은 "장애인수 vs 지급기준" 비교 → ${incentiveEligible}명`);

