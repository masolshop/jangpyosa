#!/usr/bin/env node
/**
 * 전체 본부-지사-매니저 연동 검증 및 수정 스크립트
 * 
 * 문제:
 * 1. 지사별 통계: 페마연지사가 본부에 연결 안 됨 (소속 본부가 "-"로 표시)
 * 2. 매니저별 통계: 김매니저가 지사에 연결 안 됨 (소속 지사가 공백)
 * 
 * 검증 및 수정:
 * - Organization.parentId (지사 → 본부)
 * - SalesPerson.organizationId (매니저/지사장 → 조직)
 * - SalesPerson.managerId (매니저 → 지사장/본부장)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('='.repeat(80));
  console.log('전체 본부-지사-매니저 연동 검증 및 수정');
  console.log('='.repeat(80));
  console.log('');

  // ========================================
  // 1단계: 전체 조직 구조 확인
  // ========================================
  console.log('📊 [1단계] 전체 조직 구조 확인\n');
  
  const allOrgs = await prisma.organization.findMany({
    include: {
      parent: true,
      subOrganizations: true,
      salesPeople: {
        where: { isActive: true },
      }
    },
    orderBy: [
      { type: 'asc' },
      { name: 'asc' }
    ]
  });
  
  console.log(`총 조직 수: ${allOrgs.length}개\n`);
  
  const headquarters = allOrgs.filter(org => org.type === 'HEADQUARTERS');
  const branches = allOrgs.filter(org => org.type === 'BRANCH');
  
  console.log(`본부: ${headquarters.length}개`);
  console.log(`지사: ${branches.length}개\n`);
  
  // 본부별 정리
  console.log('🏢 본부 목록:\n');
  headquarters.forEach(hq => {
    console.log(`  ${hq.name}`);
    console.log(`    ID: ${hq.id}`);
    console.log(`    리더: ${hq.leaderName} (${hq.phone})`);
    console.log(`    하위 지사: ${hq.subOrganizations.length}개`);
    console.log(`    소속 영업사원: ${hq.salesPeople.length}명`);
    if (hq.subOrganizations.length > 0) {
      hq.subOrganizations.forEach(sub => {
        console.log(`      - ${sub.name}`);
      });
    }
    console.log('');
  });
  
  // 지사별 정리
  console.log('🏪 지사 목록:\n');
  branches.forEach(branch => {
    console.log(`  ${branch.name}`);
    console.log(`    ID: ${branch.id}`);
    console.log(`    리더: ${branch.leaderName} (${branch.phone})`);
    console.log(`    상위 본부 ID: ${branch.parentId || '❌ 없음'}`);
    console.log(`    상위 본부명: ${branch.parent?.name || '❌ 없음'}`);
    console.log(`    소속 영업사원: ${branch.salesPeople.length}명`);
    console.log('');
  });
  
  // ========================================
  // 2단계: 지사의 parentId 검증 및 수정
  // ========================================
  console.log('='.repeat(80));
  console.log('🔧 [2단계] 지사의 parentId 검증 및 수정\n');
  
  const branchesWithoutParent = branches.filter(b => !b.parentId);
  
  if (branchesWithoutParent.length === 0) {
    console.log('✅ 모든 지사가 본부에 연결되어 있습니다.\n');
  } else {
    console.log(`⚠️  본부에 연결되지 않은 지사: ${branchesWithoutParent.length}개\n`);
    
    for (const branch of branchesWithoutParent) {
      console.log(`📝 지사: ${branch.name}`);
      console.log(`  리더: ${branch.leaderName} (${branch.phone})`);
      
      // 지사장 찾기
      const branchManager = await prisma.salesPerson.findFirst({
        where: {
          phone: branch.phone,
          role: 'BRANCH_MANAGER',
        },
        include: {
          manager: {
            include: {
              organization: true
            }
          }
        }
      });
      
      if (branchManager && branchManager.manager) {
        const headManager = branchManager.manager;
        console.log(`  상위 매니저: ${headManager.name} (${headManager.role})`);
        
        if (headManager.organizationId) {
          const headquarter = await prisma.organization.findUnique({
            where: { id: headManager.organizationId }
          });
          
          if (headquarter && headquarter.type === 'HEADQUARTERS') {
            console.log(`  본부 발견: ${headquarter.name}`);
            console.log(`  🔧 parentId 업데이트 중...`);
            
            await prisma.organization.update({
              where: { id: branch.id },
              data: { parentId: headquarter.id }
            });
            
            console.log(`  ✅ 완료: ${branch.name} → ${headquarter.name}\n`);
          }
        }
      } else {
        console.log(`  ⚠️  상위 매니저를 찾을 수 없습니다. 수동 설정 필요\n`);
      }
    }
  }
  
  // ========================================
  // 3단계: 전체 영업사원 구조 확인
  // ========================================
  console.log('='.repeat(80));
  console.log('👥 [3단계] 전체 영업사원 구조 확인\n');
  
  const allSalesPeople = await prisma.salesPerson.findMany({
    where: { isActive: true },
    include: {
      organization: true,
      manager: true,
      subordinates: {
        where: { isActive: true }
      }
    },
    orderBy: [
      { role: 'desc' },
      { name: 'asc' }
    ]
  });
  
  console.log(`총 활성 영업사원: ${allSalesPeople.length}명\n`);
  
  const headManagers = allSalesPeople.filter(sp => sp.role === 'HEAD_MANAGER');
  const branchManagers = allSalesPeople.filter(sp => sp.role === 'BRANCH_MANAGER');
  const managers = allSalesPeople.filter(sp => sp.role === 'MANAGER');
  
  console.log(`본부장: ${headManagers.length}명`);
  console.log(`지사장: ${branchManagers.length}명`);
  console.log(`매니저: ${managers.length}명\n`);
  
  // 본부장별
  console.log('🏢 본부장 목록:\n');
  headManagers.forEach(hm => {
    console.log(`  ${hm.name} (${hm.phone})`);
    console.log(`    ID: ${hm.id}`);
    console.log(`    조직 ID: ${hm.organizationId || '❌ 없음'}`);
    console.log(`    조직명: ${hm.organization?.name || '❌ 없음'}`);
    console.log(`    직속 부하: ${hm.subordinates.length}명`);
    if (hm.subordinates.length > 0) {
      hm.subordinates.forEach(sub => {
        console.log(`      - ${sub.name} (${sub.role})`);
      });
    }
    console.log('');
  });
  
  // 지사장별
  console.log('🏪 지사장 목록:\n');
  branchManagers.forEach(bm => {
    console.log(`  ${bm.name} (${bm.phone})`);
    console.log(`    ID: ${bm.id}`);
    console.log(`    조직 ID: ${bm.organizationId || '❌ 없음'}`);
    console.log(`    조직명: ${bm.organization?.name || '❌ 없음'}`);
    console.log(`    상위 매니저 ID: ${bm.managerId || '❌ 없음'}`);
    console.log(`    상위 매니저: ${bm.manager?.name || '❌ 없음'}`);
    console.log(`    직속 부하: ${bm.subordinates.length}명`);
    if (bm.subordinates.length > 0) {
      bm.subordinates.forEach(sub => {
        console.log(`      - ${sub.name}`);
      });
    }
    console.log('');
  });
  
  // 매니저별
  console.log('👤 매니저 목록:\n');
  managers.forEach(m => {
    console.log(`  ${m.name} (${m.phone})`);
    console.log(`    ID: ${m.id}`);
    console.log(`    조직 ID: ${m.organizationId || '❌ 없음'}`);
    console.log(`    조직명: ${m.organization?.name || '❌ 없음'}`);
    console.log(`    상위 매니저 ID: ${m.managerId || '❌ 없음'}`);
    console.log(`    상위 매니저: ${m.manager?.name || '❌ 없음'} (${m.manager?.role || ''})`);
    console.log('');
  });
  
  // ========================================
  // 4단계: organizationId 누락 검증 및 수정
  // ========================================
  console.log('='.repeat(80));
  console.log('🔧 [4단계] organizationId 누락 검증 및 수정\n');
  
  const peopleWithoutOrg = allSalesPeople.filter(sp => !sp.organizationId);
  
  if (peopleWithoutOrg.length === 0) {
    console.log('✅ 모든 영업사원이 조직에 소속되어 있습니다.\n');
  } else {
    console.log(`⚠️  조직에 소속되지 않은 영업사원: ${peopleWithoutOrg.length}명\n`);
    
    for (const person of peopleWithoutOrg) {
      console.log(`📝 ${person.name} (${person.role})`);
      
      if (person.role === 'HEAD_MANAGER') {
        // 본부장: 핸드폰 번호로 본부 조직 찾기
        const hqOrg = await prisma.organization.findFirst({
          where: {
            phone: person.phone,
            type: 'HEADQUARTERS'
          }
        });
        
        if (hqOrg) {
          console.log(`  본부 발견: ${hqOrg.name}`);
          await prisma.salesPerson.update({
            where: { id: person.id },
            data: { organizationId: hqOrg.id }
          });
          console.log(`  ✅ organizationId 업데이트 완료\n`);
        } else {
          console.log(`  ⚠️  매칭되는 본부 조직을 찾을 수 없습니다.\n`);
        }
      } else if (person.role === 'BRANCH_MANAGER') {
        // 지사장: 핸드폰 번호로 지사 조직 찾기
        const branchOrg = await prisma.organization.findFirst({
          where: {
            phone: person.phone,
            type: 'BRANCH'
          }
        });
        
        if (branchOrg) {
          console.log(`  지사 발견: ${branchOrg.name}`);
          await prisma.salesPerson.update({
            where: { id: person.id },
            data: { organizationId: branchOrg.id }
          });
          console.log(`  ✅ organizationId 업데이트 완료\n`);
        } else {
          console.log(`  ⚠️  매칭되는 지사 조직을 찾을 수 없습니다.\n`);
        }
      } else if (person.role === 'MANAGER') {
        // 매니저: 상위 매니저의 조직 확인
        if (person.manager) {
          console.log(`  상위 매니저: ${person.manager.name} (${person.manager.role})`);
          console.log(`  상위 매니저 조직: ${person.manager.organization?.name || 'N/A'}`);
          
          if (person.manager.organizationId) {
            await prisma.salesPerson.update({
              where: { id: person.id },
              data: { organizationId: person.manager.organizationId }
            });
            console.log(`  ✅ organizationId 업데이트 완료\n`);
          }
        } else {
          console.log(`  ⚠️  상위 매니저가 없습니다. 수동 설정 필요\n`);
        }
      }
    }
  }
  
  // ========================================
  // 5단계: managerId 누락 검증 및 수정
  // ========================================
  console.log('='.repeat(80));
  console.log('🔧 [5단계] managerId 누락 검증 및 수정\n');
  
  const managersWithoutHead = managers.filter(m => !m.managerId);
  const branchesWithoutHead = branchManagers.filter(bm => !bm.managerId);
  
  console.log(`상위 매니저 없는 일반 매니저: ${managersWithoutHead.length}명`);
  console.log(`상위 매니저 없는 지사장: ${branchesWithoutHead.length}명\n`);
  
  if (managersWithoutHead.length > 0) {
    console.log('⚠️  일반 매니저 수정:\n');
    for (const manager of managersWithoutHead) {
      console.log(`📝 ${manager.name}`);
      console.log(`  조직: ${manager.organization?.name || 'N/A'}`);
      
      if (manager.organizationId) {
        // 조직의 지사장/본부장 찾기
        const leader = await prisma.salesPerson.findFirst({
          where: {
            organizationId: manager.organizationId,
            role: { in: ['BRANCH_MANAGER', 'HEAD_MANAGER'] }
          }
        });
        
        if (leader) {
          console.log(`  리더 발견: ${leader.name} (${leader.role})`);
          await prisma.salesPerson.update({
            where: { id: manager.id },
            data: { managerId: leader.id }
          });
          console.log(`  ✅ managerId 업데이트 완료\n`);
        } else {
          console.log(`  ⚠️  조직의 리더를 찾을 수 없습니다.\n`);
        }
      }
    }
  }
  
  if (branchesWithoutHead.length > 0) {
    console.log('⚠️  지사장 수정:\n');
    for (const branchMgr of branchesWithoutHead) {
      console.log(`📝 ${branchMgr.name}`);
      console.log(`  조직: ${branchMgr.organization?.name || 'N/A'}`);
      
      if (branchMgr.organizationId) {
        // 조직의 상위 본부 찾기
        const branchOrg = await prisma.organization.findUnique({
          where: { id: branchMgr.organizationId },
          include: {
            parent: {
              include: {
                salesPeople: {
                  where: { role: 'HEAD_MANAGER' }
                }
              }
            }
          }
        });
        
        if (branchOrg?.parent?.salesPeople[0]) {
          const headManager = branchOrg.parent.salesPeople[0];
          console.log(`  본부장 발견: ${headManager.name}`);
          await prisma.salesPerson.update({
            where: { id: branchMgr.id },
            data: { managerId: headManager.id }
          });
          console.log(`  ✅ managerId 업데이트 완료\n`);
        } else {
          console.log(`  ⚠️  상위 본부장을 찾을 수 없습니다.\n`);
        }
      }
    }
  }
  
  // ========================================
  // 6단계: 최종 검증
  // ========================================
  console.log('='.repeat(80));
  console.log('✅ [6단계] 최종 검증\n');
  
  const finalOrgs = await prisma.organization.findMany({
    include: {
      parent: true,
      salesPeople: { where: { isActive: true } }
    }
  });
  
  const finalPeople = await prisma.salesPerson.findMany({
    where: { isActive: true },
    include: {
      organization: true,
      manager: true,
      subordinates: { where: { isActive: true } }
    }
  });
  
  console.log('📊 최종 통계:\n');
  console.log(`조직 수: ${finalOrgs.length}개`);
  console.log(`  본부: ${finalOrgs.filter(o => o.type === 'HEADQUARTERS').length}개`);
  console.log(`  지사: ${finalOrgs.filter(o => o.type === 'BRANCH').length}개`);
  console.log(`    - parentId 있음: ${finalOrgs.filter(o => o.type === 'BRANCH' && o.parentId).length}개`);
  console.log(`    - parentId 없음: ${finalOrgs.filter(o => o.type === 'BRANCH' && !o.parentId).length}개 ❌`);
  console.log('');
  
  console.log(`영업사원 수: ${finalPeople.length}명`);
  console.log(`  본부장: ${finalPeople.filter(p => p.role === 'HEAD_MANAGER').length}명`);
  console.log(`    - organizationId 있음: ${finalPeople.filter(p => p.role === 'HEAD_MANAGER' && p.organizationId).length}명`);
  console.log(`    - organizationId 없음: ${finalPeople.filter(p => p.role === 'HEAD_MANAGER' && !p.organizationId).length}명 ❌`);
  console.log(`  지사장: ${finalPeople.filter(p => p.role === 'BRANCH_MANAGER').length}명`);
  console.log(`    - organizationId 있음: ${finalPeople.filter(p => p.role === 'BRANCH_MANAGER' && p.organizationId).length}명`);
  console.log(`    - organizationId 없음: ${finalPeople.filter(p => p.role === 'BRANCH_MANAGER' && !p.organizationId).length}명 ❌`);
  console.log(`    - managerId 있음: ${finalPeople.filter(p => p.role === 'BRANCH_MANAGER' && p.managerId).length}명`);
  console.log(`    - managerId 없음: ${finalPeople.filter(p => p.role === 'BRANCH_MANAGER' && !p.managerId).length}명 ⚠️`);
  console.log(`  매니저: ${finalPeople.filter(p => p.role === 'MANAGER').length}명`);
  console.log(`    - organizationId 있음: ${finalPeople.filter(p => p.role === 'MANAGER' && p.organizationId).length}명`);
  console.log(`    - organizationId 없음: ${finalPeople.filter(p => p.role === 'MANAGER' && !p.organizationId).length}명 ❌`);
  console.log(`    - managerId 있음: ${finalPeople.filter(p => p.role === 'MANAGER' && p.managerId).length}명`);
  console.log(`    - managerId 없음: ${finalPeople.filter(p => p.role === 'MANAGER' && !p.managerId).length}명 ❌`);
  console.log('');
  
  console.log('='.repeat(80));
  console.log('🎉 검증 및 수정 완료!');
  console.log('='.repeat(80));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
