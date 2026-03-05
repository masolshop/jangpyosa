#!/usr/bin/env node
/**
 * 경남지사 상태 확인 스크립트
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('='.repeat(60));
  console.log('경남지사 상태 확인');
  console.log('='.repeat(60));
  console.log('');

  // 경남지사장 찾기
  const gyeongnamBranchManager = await prisma.salesPerson.findFirst({
    where: {
      name: '박지사',
      role: 'BRANCH_MANAGER',
    },
    include: {
      organization: true,
      subordinates: {
        where: { isActive: true },
      },
      manager: true,
    }
  });
  
  if (!gyeongnamBranchManager) {
    console.log('❌ 경남 지사장(박지사)을 찾을 수 없습니다.');
    return;
  }
  
  console.log(`✅ 경남 지사장 발견:`);
  console.log(`  이름: ${gyeongnamBranchManager.name}`);
  console.log(`  ID: ${gyeongnamBranchManager.id}`);
  console.log(`  핸드폰: ${gyeongnamBranchManager.phone}`);
  console.log(`  역할: ${gyeongnamBranchManager.role}`);
  console.log(`  조직 ID: ${gyeongnamBranchManager.organizationId}`);
  console.log(`  조직명: ${gyeongnamBranchManager.organization?.name || 'N/A'}`);
  console.log(`  상위 매니저: ${gyeongnamBranchManager.manager?.name || 'N/A'}`);
  console.log(`  직속 하위 매니저 수: ${gyeongnamBranchManager.subordinates.length}`);
  console.log('');
  
  if (gyeongnamBranchManager.subordinates.length > 0) {
    console.log('  직속 하위 매니저:');
    gyeongnamBranchManager.subordinates.forEach(sub => {
      console.log(`    - ${sub.name} (${sub.role}, ${sub.phone})`);
    });
    console.log('');
  }
  
  // 경남지사 조직 확인
  if (gyeongnamBranchManager.organizationId) {
    const gyeongnamBranch = await prisma.organization.findUnique({
      where: { id: gyeongnamBranchManager.organizationId },
      include: {
        parent: true,
        salesPeople: {
          where: { isActive: true },
        },
      }
    });
    
    if (gyeongnamBranch) {
      console.log(`✅ 경남 지사 조직:`);
      console.log(`  조직명: ${gyeongnamBranch.name}`);
      console.log(`  조직 ID: ${gyeongnamBranch.id}`);
      console.log(`  타입: ${gyeongnamBranch.type}`);
      console.log(`  상위 조직: ${gyeongnamBranch.parent?.name || 'N/A'}`);
      console.log(`  소속 영업사원 수: ${gyeongnamBranch.salesPeople.length}`);
      console.log('');
      
      if (gyeongnamBranch.salesPeople.length > 0) {
        console.log('  소속 영업사원:');
        gyeongnamBranch.salesPeople.forEach(sp => {
          console.log(`    - ${sp.name} (${sp.role})`);
          console.log(`      ID: ${sp.id}`);
          console.log(`      관리자 ID: ${sp.managerId || 'null'}`);
        });
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
