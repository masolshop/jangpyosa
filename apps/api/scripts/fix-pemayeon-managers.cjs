#!/usr/bin/env node
/**
 * 페마연 지사 매니저 매칭 수정 스크립트
 * 
 * 문제: 페마연지사의 매니저들이 지사장(문지용)의 subordinates로 연결되지 않음
 * 해결: managerId 필드 업데이트
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('='.repeat(60));
  console.log('페마연 지사 매니저 매칭 수정 스크립트');
  console.log('='.repeat(60));
  console.log('');

  // 1. 페마연 지사장 찾기
  console.log('🔍 페마연 지사장 찾는 중...\n');
  
  const pemayeonBranchManager = await prisma.salesPerson.findFirst({
    where: {
      name: '문지용',
      role: 'BRANCH_MANAGER',
    },
    include: {
      organization: true,
      subordinates: true,
      manager: true,
    }
  });
  
  if (!pemayeonBranchManager) {
    console.log('❌ 페마연 지사장(문지용)을 찾을 수 없습니다.');
    return;
  }
  
  console.log(`✅ 페마연 지사장 발견:`);
  console.log(`  이름: ${pemayeonBranchManager.name}`);
  console.log(`  ID: ${pemayeonBranchManager.id}`);
  console.log(`  핸드폰: ${pemayeonBranchManager.phone}`);
  console.log(`  역할: ${pemayeonBranchManager.role}`);
  console.log(`  조직 ID: ${pemayeonBranchManager.organizationId}`);
  console.log(`  조직명: ${pemayeonBranchManager.organization?.name || 'N/A'}`);
  console.log(`  상위 매니저: ${pemayeonBranchManager.manager?.name || 'N/A'}`);
  console.log(`  직속 하위 매니저 수: ${pemayeonBranchManager.subordinates.length}`);
  console.log('');
  
  if (pemayeonBranchManager.subordinates.length > 0) {
    console.log('  직속 하위 매니저:');
    pemayeonBranchManager.subordinates.forEach(sub => {
      console.log(`    - ${sub.name} (${sub.role})`);
    });
    console.log('');
  }
  
  // 2. 페마연 지사 조직 찾기
  if (!pemayeonBranchManager.organizationId) {
    console.log('❌ 페마연 지사장이 조직에 소속되어 있지 않습니다.');
    return;
  }
  
  const pemayeonBranch = await prisma.organization.findUnique({
    where: { id: pemayeonBranchManager.organizationId },
    include: {
      parent: true,
      salesPeople: {
        where: { isActive: true },
      },
    }
  });
  
  if (!pemayeonBranch) {
    console.log('❌ 페마연 지사 조직을 찾을 수 없습니다.');
    return;
  }
  
  console.log(`✅ 페마연 지사 조직 발견:`);
  console.log(`  조직명: ${pemayeonBranch.name}`);
  console.log(`  조직 ID: ${pemayeonBranch.id}`);
  console.log(`  타입: ${pemayeonBranch.type}`);
  console.log(`  상위 조직: ${pemayeonBranch.parent?.name || 'N/A'}`);
  console.log(`  소속 영업사원 수: ${pemayeonBranch.salesPeople.length}`);
  console.log('');
  
  if (pemayeonBranch.salesPeople.length > 0) {
    console.log('  소속 영업사원:');
    pemayeonBranch.salesPeople.forEach(sp => {
      console.log(`    - ${sp.name} (${sp.role})`);
      console.log(`      ID: ${sp.id}`);
      console.log(`      관리자 ID: ${sp.managerId || 'null'}`);
      console.log(`      조직 ID: ${sp.organizationId || 'null'}`);
    });
    console.log('');
  }
  
  // 3. 매칭이 잘못된 매니저 찾기
  const unmatchedManagers = pemayeonBranch.salesPeople.filter(sp => 
    sp.role === 'MANAGER' && 
    sp.managerId !== pemayeonBranchManager.id
  );
  
  if (unmatchedManagers.length === 0) {
    console.log('✅ 모든 매니저가 지사장에게 올바르게 연결되어 있습니다.');
    console.log('');
    
    // 4. 최종 상태 확인
    console.log('='.repeat(60));
    console.log('✅ 최종 상태 확인');
    console.log('='.repeat(60));
    console.log('');
    
    const finalStats = await prisma.salesPerson.findUnique({
      where: { id: pemayeonBranchManager.id },
      include: {
        subordinates: {
          where: { isActive: true },
        },
      }
    });
    
    console.log(`페마연 지사장: ${finalStats.name}`);
    console.log(`  직속 매니저 수: ${finalStats.subordinates.length}`);
    if (finalStats.subordinates.length > 0) {
      finalStats.subordinates.forEach(sub => {
        console.log(`    - ${sub.name} (${sub.phone})`);
      });
    }
    
    return;
  }
  
  console.log(`⚠️  지사장에게 연결되지 않은 매니저 ${unmatchedManagers.length}명 발견:\n`);
  unmatchedManagers.forEach(manager => {
    console.log(`  - ${manager.name} (${manager.phone})`);
    console.log(`    현재 managerId: ${manager.managerId || 'null'}`);
    console.log(`    조직 ID: ${manager.organizationId || 'null'}`);
  });
  console.log('');
  
  // 4. 수정 진행
  console.log('🔧 수정 작업 시작...\n');
  
  for (const manager of unmatchedManagers) {
    console.log(`📝 ${manager.name} 수정 중...`);
    
    try {
      const updated = await prisma.salesPerson.update({
        where: { id: manager.id },
        data: {
          managerId: pemayeonBranchManager.id,
          organizationId: pemayeonBranch.id, // 조직 ID도 확인 및 업데이트
        },
      });
      
      console.log(`  ✅ managerId 업데이트: ${manager.managerId} → ${pemayeonBranchManager.id}`);
      console.log(`  ✅ organizationId 확인: ${updated.organizationId}`);
      console.log('');
    } catch (error) {
      console.error(`  ❌ 오류 발생:`, error.message);
      console.log('');
    }
  }
  
  // 5. 최종 결과 확인
  console.log('='.repeat(60));
  console.log('✅ 수정 작업 완료! 결과 확인 중...\n');
  
  const updatedBranchManager = await prisma.salesPerson.findUnique({
    where: { id: pemayeonBranchManager.id },
    include: {
      subordinates: {
        where: { isActive: true },
      },
      organization: true,
    }
  });
  
  console.log(`페마연 지사장: ${updatedBranchManager.name}`);
  console.log(`  조직: ${updatedBranchManager.organization?.name || 'N/A'}`);
  console.log(`  직속 매니저 수: ${updatedBranchManager.subordinates.length}`);
  
  if (updatedBranchManager.subordinates.length > 0) {
    console.log('  직속 매니저:');
    updatedBranchManager.subordinates.forEach(sub => {
      console.log(`    - ${sub.name} (${sub.phone})`);
    });
  }
  console.log('');
  
  console.log('='.repeat(60));
  console.log('🎉 작업 완료!');
  console.log('='.repeat(60));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
