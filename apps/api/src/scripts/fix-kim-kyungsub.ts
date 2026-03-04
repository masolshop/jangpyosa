import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 김경섭 데이터 확인 중...\n');
  
  // 김경섭 조회
  const kimKyungSub = await prisma.salesPerson.findFirst({
    where: {
      name: '김경섭',
    },
    include: {
      organization: true,
    },
  });
  
  if (!kimKyungSub) {
    console.log('❌ 김경섭을 찾을 수 없습니다.');
    return;
  }
  
  console.log('📋 김경섭 현재 정보:');
  console.log(`- ID: ${kimKyungSub.id}`);
  console.log(`- 이름: ${kimKyungSub.name}`);
  console.log(`- 전화번호: ${kimKyungSub.phone}`);
  console.log(`- 역할: ${kimKyungSub.role}`);
  console.log(`- 조직 ID: ${kimKyungSub.organizationId}`);
  console.log(`- 조직명: ${kimKyungSub.organization?.name || '없음'}`);
  console.log(`- 조직 타입: ${kimKyungSub.organization?.type || '없음'}`);
  console.log(`- organizationName(레거시): ${kimKyungSub.organizationName || '없음'}`);
  console.log('');
  
  // KSK본부 찾기
  const kskHQ = await prisma.organization.findFirst({
    where: {
      name: 'KSK본부',
      type: 'HEADQUARTERS',
    },
  });
  
  if (!kskHQ) {
    console.log('❌ KSK본부를 찾을 수 없습니다.');
    return;
  }
  
  console.log('🏢 KSK본부 정보:');
  console.log(`- ID: ${kskHQ.id}`);
  console.log(`- 이름: ${kskHQ.name}`);
  console.log(`- 타입: ${kskHQ.type}`);
  console.log('');
  
  // 강남지사 정보 확인
  const gangnamBranch = await prisma.organization.findFirst({
    where: {
      name: '강남지사',
      type: 'BRANCH',
    },
  });
  
  if (gangnamBranch) {
    console.log('🏪 강남지사 정보:');
    console.log(`- ID: ${gangnamBranch.id}`);
    console.log(`- 이름: ${gangnamBranch.name}`);
    console.log(`- 타입: ${gangnamBranch.type}`);
    console.log('');
  }
  
  // 김경섭의 조직이 KSK본부가 아니면 수정
  if (kimKyungSub.organizationId !== kskHQ.id) {
    console.log('⚠️  김경섭의 조직이 KSK본부가 아닙니다. 수정합니다...\n');
    
    const updated = await prisma.salesPerson.update({
      where: {
        id: kimKyungSub.id,
      },
      data: {
        organizationId: kskHQ.id,
        organizationName: 'KSK본부',
      },
    });
    
    console.log('✅ 김경섭의 조직을 KSK본부로 변경했습니다.');
    console.log(`- 이전 조직 ID: ${kimKyungSub.organizationId}`);
    console.log(`- 새 조직 ID: ${updated.organizationId}`);
    console.log(`- 새 조직명: ${updated.organizationName}`);
  } else {
    console.log('✅ 김경섭은 이미 KSK본부에 소속되어 있습니다.');
  }
  
  console.log('\n📊 KSK본부 소속 매니저 목록:');
  const kskMembers = await prisma.salesPerson.findMany({
    where: {
      organizationId: kskHQ.id,
      isActive: true,
    },
    orderBy: {
      role: 'asc',
    },
  });
  
  kskMembers.forEach((member, index) => {
    console.log(`${index + 1}. ${member.name} - ${member.role} (${member.phone})`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
