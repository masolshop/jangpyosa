import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('📊 영업 조직 데이터 확인\n');

  // 1. 전체 통계
  const totalCount = await prisma.salesPerson.count();
  const countByRole = await prisma.salesPerson.groupBy({
    by: ['role'],
    _count: true,
  });

  console.log('✅ 전체 통계:');
  console.log(`   총 영업 사원: ${totalCount}명`);
  countByRole.forEach(item => {
    const roleNames = {
      HEAD_MANAGER: '본부장',
      BRANCH_MANAGER: '지사장',
      MANAGER: '매니저',
    };
    console.log(`   ${roleNames[item.role]}: ${item._count}명`);
  });

  // 2. 본부장 목록
  console.log('\n✅ 본부장 목록:');
  const headManagers = await prisma.salesPerson.findMany({
    where: { role: 'HEAD_MANAGER' },
    include: {
      subordinates: true,
    },
  });

  headManagers.forEach(hm => {
    console.log(`   ${hm.name} (${hm.phone})`);
    console.log(`      - 하위 직원: ${hm.subordinates.length}명`);
    console.log(`      - 추천 고객: ${hm.activeReferrals}/${hm.totalReferrals}개`);
    console.log(`      - 매출: ${hm.totalRevenue.toLocaleString()}원`);
    console.log(`      - 수수료: ${hm.commission.toLocaleString()}원`);
  });

  // 3. 조직 구조 샘플
  console.log('\n✅ 조직 구조 샘플 (첫 번째 본부장):');
  const firstHead = await prisma.salesPerson.findFirst({
    where: { role: 'HEAD_MANAGER' },
    include: {
      subordinates: {
        include: {
          subordinates: true,
        },
      },
    },
  });

  if (firstHead) {
    console.log(`${firstHead.name} (본부장)`);
    firstHead.subordinates.forEach(branch => {
      console.log(`  └─ ${branch.name} (지사장) - ${branch.subordinates.length}명 매니저`);
      branch.subordinates.slice(0, 2).forEach((manager, idx) => {
        const prefix = idx === branch.subordinates.length - 1 ? '     └─' : '     ├─';
        console.log(`${prefix} ${manager.name} (매니저)`);
      });
      if (branch.subordinates.length > 2) {
        console.log(`     └─ ... 외 ${branch.subordinates.length - 2}명`);
      }
    });
  }

  await prisma.$disconnect();
  console.log('\n✅ 확인 완료!');
}

main();
