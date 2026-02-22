// 여성 장애인 추가 지원금 분석

// 2026년 장려금 단가
const RATES = {
  SEVERE: { M: 700_000, F: 900_000 },
  MILD: { M: 350_000, F: 500_000 }
};

// 여성 추가 지원금
const FEMALE_ADDITIONAL = {
  SEVERE: 900_000 - 700_000, // 200,000원
  MILD: 500_000 - 350_000    // 150,000원
};

console.log('🎯 여성 장애인 추가 지원금 분석\n');

console.log('기본 단가:');
console.log(`  중증 남: ${RATES.SEVERE.M.toLocaleString()}원`);
console.log(`  중증 여: ${RATES.SEVERE.F.toLocaleString()}원 (+${FEMALE_ADDITIONAL.SEVERE.toLocaleString()}원)`);
console.log(`  경증 남: ${RATES.MILD.M.toLocaleString()}원`);
console.log(`  경증 여: ${RATES.MILD.F.toLocaleString()}원 (+${FEMALE_ADDITIONAL.MILD.toLocaleString()}원)\n`);

// buyer01 데이터 (가정: 중증 4명, 경증 7명, 총 11명)
const workers = [
  { name: "중증여1", severity: "SEVERE", gender: "F", salary: 1_000_000 },
  { name: "중증남1", severity: "SEVERE", gender: "M", salary: 3_000_000 },
  { name: "중증남2", severity: "SEVERE", gender: "M", salary: 3_000_000 },
  { name: "중증남3", severity: "SEVERE", gender: "M", salary: 3_000_000 },
  ...Array.from({ length: 7 }, (_, i) => ({
    name: `경증남${i+1}`, severity: "MILD", gender: "M", salary: 2_500_000
  }))
];

function calculateWithDetails(totalEmployees: number, month: string) {
  console.log('='.repeat(60));
  console.log(`${month} (상시근로자 ${totalEmployees}명)`);
  console.log('='.repeat(60));
  
  const quotaRate = 0.031;
  const obligatedCount = Math.floor(totalEmployees * quotaRate);
  const incentiveBaseCount = Math.ceil(totalEmployees * quotaRate);
  const disabledCount = 11;
  const eligibleCount = Math.max(0, disabledCount - incentiveBaseCount);
  
  console.log(`의무고용인원: ${obligatedCount}명`);
  console.log(`장려금 지급기준: ${incentiveBaseCount}명`);
  console.log(`장애인 수: ${disabledCount}명`);
  console.log(`장려금 대상: ${eligibleCount}명\n`);
  
  if (eligibleCount <= 0) {
    console.log('⚠️  장려금 대상 없음\n');
    return { total: 0, femaleCount: 0, femaleAdditional: 0 };
  }
  
  // 장려금 계산 (60% 상한 적용)
  const withIncentive = workers.map(w => {
    const baseRate = RATES[w.severity][w.gender];
    const wageLimit = w.salary * 0.6;
    const actualRate = Math.min(baseRate, wageLimit);
    const maleEquivalent = RATES[w.severity].M;
    const additional = w.gender === 'F' ? actualRate - Math.min(maleEquivalent, wageLimit) : 0;
    
    return { ...w, baseRate, wageLimit, actualRate, additional };
  });
  
  // 장려금 높은 순 정렬
  withIncentive.sort((a, b) => b.actualRate - a.actualRate);
  
  const selected = withIncentive.slice(0, eligibleCount);
  const totalIncentive = selected.reduce((sum, w) => sum + w.actualRate, 0);
  const femaleWorkers = selected.filter(w => w.gender === 'F');
  const femaleCount = femaleWorkers.length;
  const femaleAdditional = femaleWorkers.reduce((sum, w) => sum + w.additional, 0);
  
  console.log('선택된 직원:');
  selected.forEach((w, i) => {
    console.log(`  ${i+1}. ${w.name}`);
    console.log(`     기본단가: ${w.baseRate.toLocaleString()}원`);
    console.log(`     월급여: ${w.salary.toLocaleString()}원 → 60%: ${w.wageLimit.toLocaleString()}원`);
    console.log(`     실지급: ${w.actualRate.toLocaleString()}원`);
    if (w.gender === 'F') {
      console.log(`     여성추가: ${w.additional.toLocaleString()}원 ✨`);
    }
  });
  
  console.log(`\n💰 총 장려금: ${totalIncentive.toLocaleString()}원`);
  if (femaleCount > 0) {
    console.log(`👩 여성 ${femaleCount}명: +${femaleAdditional.toLocaleString()}원\n`);
  } else {
    console.log();
  }
  
  return { total: totalIncentive, femaleCount, femaleAdditional };
}

const result3 = calculateWithDetails(300, '3월');
const result4 = calculateWithDetails(200, '4월');
const result5 = calculateWithDetails(400, '5월');

console.log('\n📊 최종 비교\n');
console.log('┌─────┬───────────┬──────────┬────────────┐');
console.log('│ 월  │  총장려금 │ 여성수   │ 여성추가   │');
console.log('├─────┼───────────┼──────────┼────────────┤');
console.log(`│ 3월 │ ${result3.total.toString().padStart(9)} │ ${result3.femaleCount}명      │ +${result3.femaleAdditional.toString().padStart(9)} │`);
console.log(`│ 4월 │ ${result4.total.toString().padStart(9)} │ ${result4.femaleCount}명      │ +${result4.femaleAdditional.toString().padStart(9)} │`);
console.log(`│ 5월 │ ${result5.total.toString().padStart(9)} │ ${result5.femaleCount}명      │ +${result5.femaleAdditional.toString().padStart(9)} │`);
console.log('└─────┴───────────┴──────────┴────────────┘');

console.log('\n🎯 UI 표시 분석:');
console.log('3월: +60만 (여 1명: +30만)');
console.log('     → 총 60만원, 여성 1명, 추가 30만원');
console.log('     → 계산: 60만원, 여성 1명, 추가 ?만원\n');

console.log('4월: +190만 (여 2명: +60만)');
console.log('     → 총 190만원, 여성 2명, 추가 60만원');
console.log('     → 계산: 270만원, 여성 1명, 추가 ?만원\n');

