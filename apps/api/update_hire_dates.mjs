import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateHireDates() {
  try {
    console.log('\n🔧 Updating hire dates for better incentive distribution...\n');

    // 초기 10명 직원 중 6명의 입사일을 2024년 이후로 변경
    const employeesToUpdate = [
      { name: '이철수', hireDate: '2024-06-01' },      // rank 26
      { name: '장민지29', hireDate: '2024-07-01' },    // rank 27 (추가 직원)
      { name: '이철수22', hireDate: '2024-08-01' },    // rank 28 (추가 직원)
      { name: '박미라23', hireDate: '2024-09-01' },    // rank 29 (추가 직원)
      { name: '정미라', hireDate: '2024-10-01' },      // rank 30
      { name: '조재현37', hireDate: '2024-11-01' },    // rank 31 (추가 직원)
    ];

    for (const empData of employeesToUpdate) {
      const result = await prisma.employee.updateMany({
        where: { name: empData.name },
        data: { hireDate: new Date(empData.hireDate) },
      });

      if (result.count > 0) {
        console.log(`✅ ${empData.name}: 입사일 변경 → ${empData.hireDate}`);
      } else {
        console.log(`⚠️  ${empData.name}: 직원을 찾을 수 없음`);
      }
    }

    console.log(`\n✅ 입사일 업데이트 완료`);
    console.log(`\n📊 예상 결과 (3월 기준 800명):`);
    console.log(`  - 기준인원: 25명`);
    console.log(`  - 장애인 근로자: 35명`);
    console.log(`  - 기준 초과: 10명 (rank 26~35)`);
    console.log(`  - 제외 인원: 0명 (모두 2024년 이후 입사)`);
    console.log(`  - 장려금 대상: 10명`);
    console.log(`  - 예상 장려금: 약 400만원`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateHireDates();
