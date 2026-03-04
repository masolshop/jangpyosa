import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 김경섭의 managerId 문제 수정 중...\n');
  
  // 1. 김경섭 현재 정보
  const kimKyungsub = await prisma.salesPerson.findFirst({
    where: { name: '김경섭' },
  });
  
  if (!kimKyungsub) {
    console.log('❌ 김경섭을 찾을 수 없습니다.');
    return;
  }
  
  console.log('📋 김경섭 현재 정보:');
  console.log(`- ID: ${kimKyungsub.id}`);
  console.log(`- 이름: ${kimKyungsub.name}`);
  console.log(`- 역할: ${kimKyungsub.role}`);
  console.log(`- 조직 ID: ${kimKyungsub.organizationId}`);
  console.log(`- 조직명: ${kimKyungsub.organizationName}`);
  console.log(`- 현재 상위 매니저 ID: ${kimKyungsub.managerId || 'None'}`);
  
  // 2. 현재 상위 매니저 확인
  if (kimKyungsub.managerId) {
    const currentManager = await prisma.salesPerson.findUnique({
      where: { id: kimKyungsub.managerId },
      select: { id: true, name: true, role: true, organizationName: true },
    });
    
    console.log(`\n⚠️ 잘못된 상위 매니저 정보:`);
    console.log(`- 이름: ${currentManager?.name}`);
    console.log(`- 역할: ${currentManager?.role}`);
    console.log(`- 조직: ${currentManager?.organizationName}`);
  }
  
  // 3. HEAD_MANAGER는 상위 매니저가 없어야 함
  console.log('\n✅ 수정 작업:');
  console.log('김경섭은 HEAD_MANAGER(본부장)이므로 상위 매니저(managerId)가 없어야 합니다.');
  
  const updated = await prisma.salesPerson.update({
    where: { id: kimKyungsub.id },
    data: {
      managerId: null,  // 본부장은 상위 매니저가 없음
    },
    select: {
      id: true,
      name: true,
      role: true,
      organizationName: true,
      managerId: true,
    },
  });
  
  console.log('\n✅ 수정 완료!');
  console.log(`- 이름: ${updated.name}`);
  console.log(`- 역할: ${updated.role}`);
  console.log(`- 조직: ${updated.organizationName}`);
  console.log(`- 상위 매니저 ID: ${updated.managerId || 'None (정상)'}`);
  
  // 4. 검증: 김경섭이 subordinate로 잘못 연결된 다른 매니저들 확인
  const wrongSubordinates = await prisma.salesPerson.findMany({
    where: {
      managerId: kimKyungsub.id,
    },
    select: {
      id: true,
      name: true,
      role: true,
      organizationName: true,
    },
  });
  
  if (wrongSubordinates.length > 0) {
    console.log(`\n⚠️ 김경섭을 상위 매니저로 가진 하위 직원 ${wrongSubordinates.length}명 발견:`);
    wrongSubordinates.forEach((s, i) => {
      console.log(`${i + 1}. ${s.name} (${s.role}) - ${s.organizationName}`);
    });
    
    // 만약 KSK본부 소속이 아닌 사람이 있다면, 이들도 수정해야 함
    const wrongOrgSubordinates = wrongSubordinates.filter(
      s => s.organizationName !== 'KSK본부'
    );
    
    if (wrongOrgSubordinates.length > 0) {
      console.log(`\n⚠️ KSK본부가 아닌 하위 직원들의 managerId를 null로 수정해야 합니다:`);
      wrongOrgSubordinates.forEach((s) => {
        console.log(`- ${s.name} (${s.organizationName})`);
      });
    }
  } else {
    console.log(`\n✅ 김경섭을 상위 매니저로 가진 하위 직원 없음 (정상)`);
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
