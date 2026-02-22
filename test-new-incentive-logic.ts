// 새로운 장려금 로직 테스트

import { calculateMonthlyData } from './apps/api/src/services/employment-calculator';

// buyer01 테스트 데이터
const employees = [
  {
    id: "1", name: "중증여1", severity: "SEVERE" as const, gender: "F" as const,
    birthDate: new Date("1980-01-01"), hireDate: new Date("2025-01-01"),
    workHoursPerWeek: 40, monthlySalary: 1_000_000,
    meetsMinimumWage: true, hasEmploymentInsurance: true
  },
  {
    id: "2", name: "중증남1", severity: "SEVERE" as const, gender: "M" as const,
    birthDate: new Date("1980-01-01"), hireDate: new Date("2025-01-01"),
    workHoursPerWeek: 40, monthlySalary: 3_000_000,
    meetsMinimumWage: true, hasEmploymentInsurance: true
  },
  {
    id: "3", name: "중증남2", severity: "SEVERE" as const, gender: "M" as const,
    birthDate: new Date("1980-01-01"), hireDate: new Date("2025-01-01"),
    workHoursPerWeek: 40, monthlySalary: 3_000_000,
    meetsMinimumWage: true, hasEmploymentInsurance: true
  },
  {
    id: "4", name: "중증남3", severity: "SEVERE" as const, gender: "M" as const,
    birthDate: new Date("1980-01-01"), hireDate: new Date("2025-01-01"),
    workHoursPerWeek: 40, monthlySalary: 3_000_000,
    meetsMinimumWage: true, hasEmploymentInsurance: true
  },
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `${i+5}`, name: `경증남${i+1}`, severity: "MILD" as const, gender: "M" as const,
    birthDate: new Date("1980-01-01"), hireDate: new Date("2025-01-01"),
    workHoursPerWeek: 40, monthlySalary: 2_500_000,
    meetsMinimumWage: true, hasEmploymentInsurance: true
  }))
];

console.log('🎯 새로운 장려금 로직 테스트\n');

// 3월: 300명
console.log('='.repeat(60));
console.log('3월 (상시근로자 300명)');
console.log('='.repeat(60));
const result3 = calculateMonthlyData(employees, 300, 2026, 3, "PRIVATE");
console.log(`의무고용인원: ${result3.obligatedCount}명`);
console.log(`인정수: ${result3.recognizedCount}명`);
console.log(`초과: +${result3.surplusCount}명`);
console.log(`장애인수: ${result3.disabledCount}명`);
console.log(`장려금: ${result3.incentive.toLocaleString()}원\n`);

// 4월: 200명
console.log('='.repeat(60));
console.log('4월 (상시근로자 200명)');
console.log('='.repeat(60));
const result4 = calculateMonthlyData(employees, 200, 2026, 4, "PRIVATE");
console.log(`의무고용인원: ${result4.obligatedCount}명`);
console.log(`인정수: ${result4.recognizedCount}명`);
console.log(`초과: +${result4.surplusCount}명`);
console.log(`장애인수: ${result4.disabledCount}명`);
console.log(`장려금: ${result4.incentive.toLocaleString()}원\n`);

// 5월: 400명
console.log('='.repeat(60));
console.log('5월 (상시근로자 400명)');
console.log('='.repeat(60));
const result5 = calculateMonthlyData(employees, 400, 2026, 5, "PRIVATE");
console.log(`의무고용인원: ${result5.obligatedCount}명`);
console.log(`인정수: ${result5.recognizedCount}명`);
console.log(`초과: +${result5.surplusCount}명`);
console.log(`장애인수: ${result5.disabledCount}명`);
console.log(`장려금: ${result5.incentive.toLocaleString()}원\n`);

console.log('📊 요약');
console.log('┌─────┬──────┬────┬───────────┐');
console.log('│ 월  │ 상시 │초과│  장려금   │');
console.log('├─────┼──────┼────┼───────────┤');
console.log(`│ 3월 │  300 │ +6 │ ${result3.incentive.toString().padStart(9)} │`);
console.log(`│ 4월 │  200 │ +9 │ ${result4.incentive.toString().padStart(9)} │`);
console.log(`│ 5월 │  400 │ +3 │ ${result5.incentive.toString().padStart(9)} │`);
console.log('└─────┴──────┴────┴───────────┘');

