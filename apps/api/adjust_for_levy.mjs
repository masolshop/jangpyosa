import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🔧 부담금 발생을 위한 직원 조정\n");
    
    // 1. 현재 중증 직원 확인
    const severeEmployees = await prisma.disabledEmployee.findMany({
      where: { severity: 'SEVERE' }
    });
    
    console.log(`📊 현재 중증 직원: ${severeEmployees.length}명\n`);
    
    // 2. 중증 직원 중 일부를 경증으로 변경
    // 목표: 인정수를 40명 정도로 낮춰서 의무고용 미달 발생
    
    const targetSevereCount = 15; // 중증 15명 유지
    const toConvert = severeEmployees.length - targetSevereCount;
    
    if (toConvert > 0) {
      console.log(`🔄 ${toConvert}명의 중증 직원을 경증으로 변경...\n`);
      
      // 최근 입사한 중증 직원부터 경증으로 변경
      const employeesToConvert = severeEmployees
        .sort((a, b) => b.hireDate.getTime() - a.hireDate.getTime())
        .slice(0, toConvert);
      
      for (const emp of employeesToConvert) {
        await prisma.disabledEmployee.update({
          where: { id: emp.id },
          data: { 
            severity: 'MILD',
            disabilityGrade: '5급' // 경증 등급으로 변경
          }
        });
        console.log(`✅ ${emp.name}: 중증 → 경증 (${emp.workHoursPerWeek || 60}시간)`);
      }
    }
    
    // 3. 최종 통계
    const finalSevere = await prisma.disabledEmployee.count({
      where: { severity: 'SEVERE' }
    });
    
    const finalMild = await prisma.disabledEmployee.count({
      where: { severity: 'MILD' }
    });
    
    const severeWith60Plus = await prisma.disabledEmployee.count({
      where: {
        severity: 'SEVERE',
        workHoursPerWeek: { gte: 60 }
      }
    });
    
    console.log(`\n📊 최종 통계:`);
    console.log(`   - 중증: ${finalSevere}명 (60시간 이상: ${severeWith60Plus}명 → 2배 인정 = ${severeWith60Plus * 2}명)`);
    console.log(`   - 경증: ${finalMild}명 (1배 인정)`);
    console.log(`   - 총 직원: ${finalSevere + finalMild}명`);
    console.log(`   - 예상 인정수: 약 ${severeWith60Plus * 2 + (finalSevere - severeWith60Plus) + finalMild}명`);
    
    console.log(`\n💡 부담금 발생 예측:`);
    console.log(`   - 1000명 × 3.1% = 31명 의무고용`);
    console.log(`   - 인정수 약 35~40명`);
    console.log(`   - 1200명 × 3.1% = 37명 의무고용 → 부담금 발생 가능!`);
    console.log(`   - 1300명 × 3.1% = 40명 의무고용 → 부담금 발생!`);
    
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
