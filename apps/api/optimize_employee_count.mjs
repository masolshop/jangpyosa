import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🎯 최적 조건 설정: 부담금과 장려금이 모두 발생하도록 조정\n");
    
    // 1. 현재 직원 수 확인
    const totalEmployees = await prisma.disabledEmployee.count();
    console.log(`📊 현재 장애인 직원 수: ${totalEmployees}명\n`);
    
    // 2. 목표: 35명으로 조정 (31명 기준 → 4명 초과 → 장려금 발생)
    const targetCount = 35;
    const deleteCount = totalEmployees - targetCount;
    
    if (deleteCount > 0) {
      console.log(`🗑️  ${deleteCount}명 삭제하여 ${targetCount}명으로 조정...\n`);
      
      // 최근에 추가된 직원들 삭제 (11번 이후 직원들)
      const employeesToDelete = await prisma.disabledEmployee.findMany({
        where: {
          name: {
            contains: '11'
          }
        },
        orderBy: { hireDate: 'desc' },
        take: deleteCount
      });
      
      for (const emp of employeesToDelete) {
        await prisma.disabledEmployee.delete({
          where: { id: emp.id }
        });
        console.log(`❌ 삭제: ${emp.name}`);
      }
      
      // 추가로 필요하면 다른 직원도 삭제
      if (employeesToDelete.length < deleteCount) {
        const remaining = deleteCount - employeesToDelete.length;
        const moreToDelete = await prisma.disabledEmployee.findMany({
          orderBy: { hireDate: 'desc' },
          take: remaining
        });
        
        for (const emp of moreToDelete) {
          await prisma.disabledEmployee.delete({
            where: { id: emp.id }
          });
          console.log(`❌ 삭제: ${emp.name}`);
        }
      }
    }
    
    // 3. 최종 확인
    const finalCount = await prisma.disabledEmployee.count();
    console.log(`\n✅ 최종 장애인 직원 수: ${finalCount}명`);
    
    // 4. 계산 결과 예측
    const totalEmployeeCount = 1000;
    const quotaRate = 0.031;
    const obligated = Math.floor(totalEmployeeCount * quotaRate); // 31명
    const baseline = Math.ceil(totalEmployeeCount * quotaRate); // 31명
    
    console.log(`\n📊 예상 계산 결과:`);
    console.log(`   - 상시근로자: ${totalEmployeeCount}명`);
    console.log(`   - 의무고용인원: ${obligated}명`);
    console.log(`   - 장려금 기준인원: ${baseline}명`);
    console.log(`   - 장애인 직원: ${finalCount}명`);
    console.log(`   - 장려금 대상: ${finalCount - baseline}명 (기준인원 초과)`);
    console.log(`   - 의무고용 충족: ✅ (${finalCount}명 >= ${obligated}명)`);
    
    if (finalCount > obligated) {
      console.log(`\n🎉 최적 조건 달성!`);
      console.log(`   ✅ 부담금 없음 (의무고용 충족)`);
      console.log(`   ✅ 장려금 발생 (기준인원 ${baseline}명 초과 → ${finalCount - baseline}명 지급)`);
    }
    
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
