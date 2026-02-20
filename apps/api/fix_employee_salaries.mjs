import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 2026년 최저시급
const MINIMUM_HOURLY_WAGE = 10320;

// 월 근로시간으로 월급 계산
function calculateMonthlySalary(monthlyHours) {
  if (!monthlyHours || monthlyHours <= 0) return 0;
  const salary = monthlyHours * MINIMUM_HOURLY_WAGE;
  // 1,000원 단위로 반올림
  return Math.round(salary / 1000) * 1000;
}

async function main() {
  try {
    console.log("🔧 장애인 직원 급여 재계산 시작...\n");

    // 모든 장애인 직원 조회
    const employees = await prisma.disabledEmployee.findMany({
      orderBy: { name: 'asc' }
    });

    console.log(`📊 총 ${employees.length}명의 직원 발견\n`);

    let updatedCount = 0;
    let unchangedCount = 0;

    for (const emp of employees) {
      const monthlyHours = emp.workHoursPerWeek || 60; // 실제로는 월간 근로시간
      const correctSalary = calculateMonthlySalary(monthlyHours);
      
      if (emp.monthlySalary !== correctSalary) {
        // 급여 업데이트
        await prisma.disabledEmployee.update({
          where: { id: emp.id },
          data: { monthlySalary: correctSalary }
        });

        console.log(`✅ ${emp.name}: 월 ${monthlyHours}시간 - ${emp.monthlySalary.toLocaleString()}원 → ${correctSalary.toLocaleString()}원`);
        updatedCount++;
      } else {
        console.log(`⏭️  ${emp.name}: 월 ${monthlyHours}시간 - ${correctSalary.toLocaleString()}원 (변경 없음)`);
        unchangedCount++;
      }
    }

    console.log(`\n📊 완료: 수정 ${updatedCount}명, 변경없음 ${unchangedCount}명`);

  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
