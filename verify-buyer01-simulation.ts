// buyer01 시뮬레이션 정밀 검증

// buyer01 장애인 근로자 데이터 (가정)
const disabledWorkers = [
  { name: "중증여1", severity: "SEVERE", gender: "F", salary: 1_000_000, workHours: 40 },
  { name: "중증남1", severity: "SEVERE", gender: "M", salary: 3_000_000, workHours: 40 },
  { name: "중증남2", severity: "SEVERE", gender: "M", salary: 3_000_000, workHours: 40 },
  { name: "중증남3", severity: "SEVERE", gender: "M", salary: 3_000_000, workHours: 40 },
  { name: "경증남1", severity: "MILD", gender: "M", salary: 2_500_000, workHours: 40 },
  { name: "경증남2", severity: "MILD", gender: "M", salary: 2_500_000, workHours: 40 },
  { name: "경증남3", severity: "MILD", gender: "M", salary: 2_500_000, workHours: 40 },
  { name: "경증남4", severity: "MILD", gender: "M", salary: 2_500_000, workHours: 40 },
  { name: "경증남5", severity: "MILD", gender: "M", salary: 2_500_000, workHours: 40 },
  { name: "경증남6", severity: "MILD", gender: "M", salary: 2_500_000, workHours: 40 },
  { name: "경증남7", severity: "MILD", gender: "M", salary: 2_500_000, workHours: 40 },
];

const RATES_2026 = {
  SEVERE: { M: 700_000, F: 900_000 },
  MILD: { M: 350_000, F: 500_000 }
};

function calculate(totalEmployees: number) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`상시근로자: ${totalEmployees}명`);
  console.log(`${"=".repeat(60)}`);
  
  const quotaRate = 0.031; // 민간기업
  
  // 1. 의무고용인원 (부담금 기준)
  const obligatedCount = Math.floor(totalEmployees * quotaRate);
  console.log(`\n1️⃣ 의무고용인원 (부담금): floor(${totalEmployees} × 3.1%) = ${obligatedCount}명`);
  
  // 2. 장려금 지급기준인원
  const incentiveBaseCount = Math.ceil(totalEmployees * quotaRate);
  console.log(`2️⃣ 장려금 지급기준: ceil(${totalEmployees} × 3.1%) = ${incentiveBaseCount}명`);
  
  // 3. 인정수 (중증 60시간 이상은 2배)
  const severeCount = 4;
  const mildCount = 7;
  const recognizedCount = mildCount + (severeCount * 2);
  console.log(`\n3️⃣ 인정수 계산:`);
  console.log(`   경증: ${mildCount}명 × 1 = ${mildCount}`);
  console.log(`   중증: ${severeCount}명 × 2 = ${severeCount * 2}`);
  console.log(`   합계: ${recognizedCount}명`);
  
  // 4. 미달/초과 (부담금 기준)
  const shortfall = Math.max(0, obligatedCount - recognizedCount);
  const surplus = Math.max(0, recognizedCount - obligatedCount);
  console.log(`\n4️⃣ 미달/초과 (부담금 기준):`);
  console.log(`   의무고용인원: ${obligatedCount}명`);
  console.log(`   인정수: ${recognizedCount}명`);
  console.log(`   미달: ${shortfall}명`);
  console.log(`   초과: ${surplus}명 ${surplus > 0 ? '✅' : '❌'}`);
  
  // 5. 장려금 계산
  const disabledCount = 11;
  const eligibleCount = Math.max(0, disabledCount - incentiveBaseCount);
  console.log(`\n5️⃣ 장려금 계산:`);
  console.log(`   장애인 근로자: ${disabledCount}명`);
  console.log(`   지급기준인원: ${incentiveBaseCount}명`);
  console.log(`   장려금 대상: ${eligibleCount}명`);
  
  if (eligibleCount <= 0) {
    console.log(`   ⚠️  지급 대상 없음 (의무고용률 미달 또는 동일)`);
    console.log(`   💰 장려금: 0원`);
  } else {
    // 장려금이 높은 순으로 정렬
    const withIncentive = disabledWorkers.map(w => {
      const baseRate = RATES_2026[w.severity][w.gender];
      const wageLimit = w.salary * 0.6;
      const actualRate = Math.min(baseRate, wageLimit);
      return { ...w, baseRate, wageLimit, actualRate };
    });
    
    withIncentive.sort((a, b) => b.actualRate - a.actualRate);
    
    const selected = withIncentive.slice(0, eligibleCount);
    const totalIncentive = selected.reduce((sum, w) => sum + w.actualRate, 0);
    
    console.log(`\n   📋 지급 대상자 (상위 ${eligibleCount}명):`);
    selected.forEach((w, i) => {
      console.log(`   ${i+1}. ${w.name} (${w.severity === 'SEVERE' ? '중증' : '경증'} ${w.gender === 'M' ? '남' : '여'})`);
      console.log(`      기본단가: ${w.baseRate.toLocaleString()}원`);
      console.log(`      월급여: ${w.salary.toLocaleString()}원 → 60%: ${w.wageLimit.toLocaleString()}원`);
      console.log(`      실지급: ${w.actualRate.toLocaleString()}원`);
    });
    
    console.log(`\n   💰 총 장려금: ${totalIncentive.toLocaleString()}원`);
  }
  
  console.log(`\n${"=".repeat(60)}\n`);
  
  return {
    totalEmployees,
    obligatedCount,
    incentiveBaseCount,
    recognizedCount,
    shortfall,
    surplus,
    disabledCount,
    eligibleCount
  };
}

// 시뮬레이션
console.log('\n🎯 buyer01 시뮬레이션 정밀 검증\n');
console.log('장애인 근로자 구성: 중증 4명, 경증 7명, 총 11명');

const result3 = calculate(300);
const result4 = calculate(200);
const result5 = calculate(400);

// 요약 테이블
console.log('\n📊 요약 비교표\n');
console.log('┌─────┬──────┬──────┬────┬────┬────────┬────────┐');
console.log('│ 월  │ 상시 │ 의무 │인정│초과│지급기준│장려대상│');
console.log('├─────┼──────┼──────┼────┼────┼────────┼────────┤');
console.log(`│ 3월 │ ${result3.totalEmployees.toString().padStart(4)} │ ${result3.obligatedCount.toString().padStart(4)} │ ${result3.recognizedCount.toString().padStart(2)} │ +${result3.surplus.toString().padStart(2)} │   ${result3.incentiveBaseCount.toString().padStart(4)} │   ${result3.eligibleCount.toString().padStart(4)} │`);
console.log(`│ 4월 │ ${result4.totalEmployees.toString().padStart(4)} │ ${result4.obligatedCount.toString().padStart(4)} │ ${result4.recognizedCount.toString().padStart(2)} │ +${result4.surplus.toString().padStart(2)} │   ${result4.incentiveBaseCount.toString().padStart(4)} │   ${result4.eligibleCount.toString().padStart(4)} │`);
console.log(`│ 5월 │ ${result5.totalEmployees.toString().padStart(4)} │ ${result5.obligatedCount.toString().padStart(4)} │ ${result5.recognizedCount.toString().padStart(2)} │ +${result5.surplus.toString().padStart(2)} │   ${result5.incentiveBaseCount.toString().padStart(4)} │   ${result5.eligibleCount.toString().padStart(4)} │`);
console.log('└─────┴──────┴──────┴────┴────┴────────┴────────┘');

