import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 강남지사 매니저 리스트 문제 디버깅...\n');
  
  // 1. 강남지사 정보
  const gangnamBranch = await prisma.organization.findFirst({
    where: { name: '강남지사', type: 'BRANCH' },
  });
  
  if (!gangnamBranch) {
    console.log('❌ 강남지사를 찾을 수 없습니다.');
    return;
  }
  
  console.log('🏪 강남지사 정보:');
  console.log(`- ID: ${gangnamBranch.id}`);
  console.log(`- 이름: ${gangnamBranch.name}`);
  console.log(`- 상위 조직 ID: ${gangnamBranch.parentId}\n`);
  
  // 2. 강남지사 소속 매니저 (organizationId로 필터)
  const gangnamManagers = await prisma.salesPerson.findMany({
    where: {
      organizationId: gangnamBranch.id,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      role: true,
      organizationId: true,
      organizationName: true,
    },
  });
  
  console.log(`📊 강남지사 소속 매니저 (organizationId = ${gangnamBranch.id}):`);
  gangnamManagers.forEach((m, i) => {
    console.log(`${i + 1}. ${m.name} - ${m.role} (${m.phone})`);
    console.log(`   organizationId: ${m.organizationId}`);
    console.log(`   organizationName: ${m.organizationName}`);
  });
  
  // 3. 김경섭 정보
  console.log('\n🔍 김경섭 정보:');
  const kimKyungsub = await prisma.salesPerson.findFirst({
    where: { name: '김경섭' },
    select: {
      id: true,
      name: true,
      phone: true,
      role: true,
      organizationId: true,
      organizationName: true,
      managerId: true,
    },
  });
  
  if (kimKyungsub) {
    console.log(`- ID: ${kimKyungsub.id}`);
    console.log(`- 이름: ${kimKyungsub.name}`);
    console.log(`- 역할: ${kimKyungsub.role}`);
    console.log(`- 조직 ID: ${kimKyungsub.organizationId}`);
    console.log(`- 조직명: ${kimKyungsub.organizationName}`);
    console.log(`- 상위 매니저 ID: ${kimKyungsub.managerId || 'None'}`);
    
    // 김경섭의 조직 정보
    if (kimKyungsub.organizationId) {
      const kimOrg = await prisma.organization.findUnique({
        where: { id: kimKyungsub.organizationId },
        select: { id: true, name: true, type: true, parentId: true },
      });
      
      console.log('\n📋 김경섭의 조직 정보:');
      console.log(`- ID: ${kimOrg?.id}`);
      console.log(`- 이름: ${kimOrg?.name}`);
      console.log(`- 타입: ${kimOrg?.type}`);
      console.log(`- 상위 조직: ${kimOrg?.parentId || 'None'}`);
    }
  } else {
    console.log('❌ 김경섭을 찾을 수 없습니다.');
  }
  
  // 4. 강남지사의 상위 본부 확인
  if (gangnamBranch.parentId) {
    console.log('\n🏢 강남지사의 상위 본부:');
    const parentHQ = await prisma.organization.findUnique({
      where: { id: gangnamBranch.parentId },
      select: { id: true, name: true, type: true },
    });
    
    if (parentHQ) {
      console.log(`- ID: ${parentHQ.id}`);
      console.log(`- 이름: ${parentHQ.name}`);
      console.log(`- 타입: ${parentHQ.type}`);
      
      // 이 본부의 본부장 확인
      const hqManager = await prisma.salesPerson.findFirst({
        where: {
          organizationId: parentHQ.id,
          role: 'HEAD_MANAGER',
          isActive: true,
        },
        select: { id: true, name: true, phone: true },
      });
      
      if (hqManager) {
        console.log(`\n👤 이 본부의 본부장:`);
        console.log(`- 이름: ${hqManager.name}`);
        console.log(`- 전화: ${hqManager.phone}`);
      }
    }
  }
  
  // 5. API가 반환할 데이터 시뮬레이션
  console.log('\n🔧 API /sales/branches/:id/managers 시뮬레이션:');
  console.log(`Request: GET /sales/branches/${gangnamBranch.id}/managers`);
  
  const apiManagers = await prisma.salesPerson.findMany({
    where: {
      organizationId: gangnamBranch.id,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
    },
  });
  
  console.log(`Response: ${apiManagers.length}명의 매니저`);
  apiManagers.forEach((m, i) => {
    console.log(`  ${i + 1}. ${m.name} (${m.role}) - ${m.phone}`);
  });
}

main()
  .catch((e) => {
    console.error('Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
