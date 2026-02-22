// buyer01 실제 데이터로 정밀 검증

const RATES_2026 = {
  SEVERE: { M: 700_000, F: 900_000 },
  MILD: { M: 350_000, F: 500_000 }
};

// 실제 buyer01 장애인 직원 데이터
const employees = [
  { name: "권서연", severity: "SEVERE", gender: "F", salary: 1_651_200, workHours: 60, monthlyHours: 160 },
  { name: "오하은", severity: "SEVERE", gender: "F", salary: 1_362_240, workHours: 60, monthlyHours: 132 },
  { name: "서시우", severity: "SEVERE", gender: "F", salary: 1_124_880, workHours: 60, monthlyHours: 109 },
  { name: "한예준", severity: "SEVERE", gender: "F", salary: 825_600, workHours: 60, monthlyHours: 80 },
  { name: "홍유진", severity: "MILD", gender: "F", salary: 1_475_760, workHours: 33, monthlyHours: 143 },
  { name: "김수아", severity: "MILD", gender: "F", salary: 804_960, workHours: 18, monthlyHours: 78 },
  { name: "이지우", severity: "MILD", gender: "M", salary: 2_002_080, workHours: 45, monthlyHours: 194 },
  { name: "임예준", severity: "MILD", gender: "M", salary: 1_537_680, workHours: 34, monthlyHours: 149 },
  { name: "임지우", severity: "MILD", gender: "M", salary: 1_197_120, workHours: 27, monthlyHours: 116 },
  { name: "강유진", severity: "MILD", gender: "M", salary: 1_032_000, workHours: 23, monthlyHours: 100 },
  { name: "권준서", severity: "MILD", gender: "M", salary: 722_400, workHours: 16, monthlyHours: 70 }
];

console.log('🎯 buyer01 실제 데이터 정밀 검증\n');
console.log('장애인 구성: 중증 여 4명, 경증 남 5명, 경증 여 2명 (총 11명)\n');

function calculate(totalEmployees: number, month: string) {
  console.log('='.repeat(70));
  console.log(`${month} (상시근로자 ${totalEmployees}명)`);
  console.log('='.repeat(70));
  
  const quotaRate = 0.031;
  
  // 1. 의무고용인원 (부담금)
  const obligatedCount = Math.floor(totalEmployees * quotaRate);
  
  // 2. 인정수 (중증 60시간 이상 2배)
  const recognizedCount = employees.reduce((sum, e) => {
    if (e.severity === 'SEVERE' && e.monthlyHours >= 60) {
      return sum + 2;
    }
    return sum + 1;
  }, 0);
  
  // 3. 초과 (부담금 기준)
  const surplus = Math.max(0, recognizedCount - obligatedCount);
  
  console.log(`\n📊 부담금 계산:`);
  console.log(`   의무고용인원 (floor): ${obligatedCount}명`);
  console.log(`   인정수: ${recognizedCount}명 (중증 4명×2 + 경증 7명×1)`);
  console.log(`   초과: ${surplus}명 ✅\n`);
  
  // 4. 장려금 계산
  const incentiveBaseCount = Math.ceil(totalEmployees * quotaRate);
  const eligibleCount = Math.max(0, employees.length - incentiveBaseCount);
  
  console.log(`💰 장려금 계산:`);
  console.log(`   지급기준인원 (ceil): ${incentiveBaseCount}명`);
  console.log(`   장애인수: ${employees.length}명`);
  console.log(`   장려금 대상: ${eligibleCount}명\n`);
  
  if (eligibleCount <= 0) {
    console.log(`   ⚠️  지급 대상 없음\n`);
    return { surplus, incentive: 0, femaleCount: 0, femaleIncentive: 0 };
  }
  
  // 각 직원의 장려금 계산
  const withIncentive = employees.map(e => {
    const baseRate = RATES_2026[e.severity][e.gender];
    const wageLimit = e.salary * 0.6;
    const actualRate = Math.min(baseRate, wageLimit);
    
    // 근로시간 비율
    let workRate = 1.0;
    if (e.workHours >= 40) workRate = 1.0;
    else if (e.workHours >= 30) workRate = 0.75;
    else if (e.workHours >= 20) workRate = 0.5;
    else workRate = 0;
    
    const finalRate = Math.round(actualRate * workRate);
    
    return { ...e, baseRate, wageLimit, actualRate, workRate, finalRate };
  });
  
  // 장려금 높은 순 정렬
  withIncentive.sort((a, b) => b.finalRate - a.finalRate);
  
  // 상위 N명 선택
  const selected = withIncentive.slice(0, eligibleCount);
  const totalIncentive = selected.reduce((sum, e) => sum + e.finalRate, 0);
  const femaleCount = selected.filter(e => e.gender === 'F').length;
  const femaleIncentive = selected.filter(e => e.gender === 'F').reduce((sum, e) => sum + e.finalRate, 0);
  
  console.log(`   선택된 직원 (상위 ${eligibleCount}명):\n`);
  selected.forEach((e, i) => {
    const severityText = e.severity === 'SEVERE' ? '중증' : '경증';
    const genderText = e.gender === 'F' ? '여' : '남';
    console.log(`   ${(i+1).toString().padStart(2)}. ${e.name} (${severityText} ${genderText})`);
    console.log(`       기본: ${e.baseRate.toLocaleString()}원, 60%상한: ${e.wageLimit.toLocaleString()}원`);
    console.log(`       근로시간: ${e.workHours}h/주 (${(e.workRate*100)}%) → 최종: ${e.finalRate.toLocaleString()}원`);
  });
  
  console.log(`\n   💰 총 장려금: ${totalIncentive.toLocaleString()}원`);
  console.log(`   👩 여성 ${femaleCount}명: ${femaleIncentive.toLocaleString()}원\n`);
  
  return { surplus, incentive: totalIncentive, femaleCount, femaleIncentive };
}

const result3 = calculate(300, '3월');
const result4 = calculate(200, '4월');
const result5 = calculate(400, '5월');

console.log('\n📊 최종 비교\n');
console.log('UI 표시:  3월 +60만, 4월 +190만, 5월 +0만');
console.log('계산값:   3월 +90만, 4월 +288만, 5월 +0만');
console.log('\n🔴 차이 원인: 60% 상한 + 근로시간 비율 적용');
console.log('\n초과 표시 문제: DB에 0.0으로 저장됨 → 수정 완료 (배포 대기)');

