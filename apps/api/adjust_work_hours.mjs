import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🎯 인정수를 35명으로 조정 (= 실제 직원 수)\n");
    
    // 모든 중증 직원의 근로시간을 59시간으로 변경
    // → 60시간 미만이면 2배 인정 안됨!
    
    const severeEmployees = await prisma.disabledEmployee.findMany({
      where: { 
        severity: 'SEVERE',
        workHoursPerWeek: { gte: 60 }
      }
    });
    
    console.log(`📊 60시간 이상 근무 중증 직원: ${severeEmployees.length}명\n`);
    console.log(`🔄 모든 중증 직원의 근로시간을 59시간으로 조정...\n`);
    
    for (const emp of severeEmployees) {
      // 근로시간 59시간 = 60시간 미만 = 1배 인정
      await prisma.disabledEmployee.update({
        where: { id: emp.id },
        data: { 
          workHoursPerWeek: 59,
          monthlySalary: 59 * 10320 // 609,000원
        }
      });
      console.log(`✅ ${emp.name}: ${emp.workHoursPerWeek || 60}시간 → 59시간 (1배 인정)`);
    }
    
    // 최종 확인
    const total = await prisma.disabledEmployee.count();
    const severe = await prisma.disabledEmployee.count({
      where: { severity: 'SEVERE' }
    });
    const mild = await prisma.disabledEmployee.count({
      where: { severity: 'MILD' }
    });
    
    console.log(`\n📊 최종 통계:`);
    console.log(`   - 총 직원: ${total}명`);
    console.log(`   - 중증: ${severe}명 (59시간 근무 → 1배 인정 = ${severe}명)`);
    console.log(`   - 경증: ${mild}명 (1배 인정 = ${mild}명)`);
    console.log(`   - 인정수: ${severe + mild}명 (= 실제 직원 수)`);
    
    console.log(`\n🎉 부담금 발생 조건 달성!`);
    console.log(`   ✅ 1000명 기업: 의무 31명 < 인정 35명 → 장려금`);
    console.log(`   ⚠️  1200명 기업: 의무 37명 > 인정 35명 → 부담금 2명`);
    console.log(`   ⚠️  1300명 기업: 의무 40명 > 인정 35명 → 부담금 5명`);
    
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
