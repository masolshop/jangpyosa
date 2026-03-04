import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 승인된 매니저 확인 중...\n');
  
  // 모든 활성 영업 사원 조회
  const activeSalesPeople = await prisma.salesPerson.findMany({
    where: {
      isActive: true,
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  console.log(`✅ 총 ${activeSalesPeople.length}명의 활성 매니저가 있습니다.\n`);
  
  if (activeSalesPeople.length === 0) {
    console.log('⚠️  활성 매니저가 없습니다!\n');
  } else {
    console.log('📋 활성 매니저 리스트:\n');
    activeSalesPeople.forEach((person, index) => {
      console.log(`${index + 1}. ${person.name}`);
      console.log(`   - ID: ${person.id}`);
      console.log(`   - 전화번호: ${person.phone}`);
      console.log(`   - 역할: ${person.role}`);
      console.log(`   - 조직: ${person.organization?.name || '없음'} (${person.organization?.type || '-'})`);
      console.log(`   - organizationId: ${person.organizationId || '없음'}`);
      console.log(`   - organizationName(레거시): ${person.organizationName || '없음'}`);
      console.log(`   - 활성 상태: ${person.isActive}`);
      console.log(`   - 생성일: ${person.createdAt}`);
      console.log('');
    });
  }
  
  // 비활성(승인 대기) 매니저 조회
  const pendingSalesPeople = await prisma.salesPerson.findMany({
    where: {
      isActive: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  console.log(`\n⏳ 총 ${pendingSalesPeople.length}명의 승인 대기 매니저가 있습니다.\n`);
  
  if (pendingSalesPeople.length > 0) {
    console.log('📋 승인 대기 리스트:\n');
    pendingSalesPeople.forEach((person, index) => {
      console.log(`${index + 1}. ${person.name}`);
      console.log(`   - ID: ${person.id}`);
      console.log(`   - 전화번호: ${person.phone}`);
      console.log(`   - 역할: ${person.role}`);
      console.log(`   - 조직명: ${person.organizationName || '없음'}`);
      console.log(`   - 생성일: ${person.createdAt}`);
      console.log('');
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
