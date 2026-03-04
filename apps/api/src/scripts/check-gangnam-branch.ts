import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 강남지사 정보 확인 중...\n');
  
  // 강남지사 조회
  const gangnamBranch = await prisma.organization.findFirst({
    where: {
      name: '강남지사',
      type: 'BRANCH',
    },
  });
  
  if (!gangnamBranch) {
    console.log('❌ 강남지사를 찾을 수 없습니다.');
    return;
  }
  
  console.log('🏪 강남지사 정보:');
  console.log(`- ID: ${gangnamBranch.id}`);
  console.log(`- 이름: ${gangnamBranch.name}`);
  console.log(`- 지사장: ${gangnamBranch.leaderName}`);
  console.log(`- 타입: ${gangnamBranch.type}`);
  console.log(`- 상위 본부 ID: ${gangnamBranch.parentId}`);
  console.log('');
  
  // 강남지사 소속 매니저 조회
  const branchMembers = await prisma.salesPerson.findMany({
    where: {
      organizationId: gangnamBranch.id,
      isActive: true,
    },
    orderBy: {
      role: 'asc',
    },
  });
  
  console.log(`📊 강남지사 소속 매니저 (organizationId = ${gangnamBranch.id}):`);
  if (branchMembers.length === 0) {
    console.log('  (매니저 없음)');
  } else {
    branchMembers.forEach((member, index) => {
      console.log(`${index + 1}. ${member.name} - ${member.role} (${member.phone})`);
    });
  }
  
  console.log('\n🔍 김경섭 조회...');
  const kimKyungSub = await prisma.salesPerson.findFirst({
    where: {
      name: '김경섭',
    },
    include: {
      organization: true,
    },
  });
  
  if (kimKyungSub) {
    console.log('\n📋 김경섭 정보:');
    console.log(`- ID: ${kimKyungSub.id}`);
    console.log(`- 조직 ID: ${kimKyungSub.organizationId}`);
    console.log(`- 조직명: ${kimKyungSub.organization?.name || '없음'}`);
    console.log(`- 조직 타입: ${kimKyungSub.organization?.type || '없음'}`);
    
    if (kimKyungSub.organizationId === gangnamBranch.id) {
      console.log('\n⚠️  김경섭이 강남지사에 소속되어 있습니다! (잘못됨)');
    } else {
      console.log('\n✅ 김경섭은 강남지사 소속이 아닙니다.');
    }
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
