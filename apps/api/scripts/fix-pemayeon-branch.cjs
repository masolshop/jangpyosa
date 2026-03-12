#!/usr/bin/env node
/**
 * 페마연 지사 매칭 수정 스크립트
 * 
 * 문제: 페마연지사가 페마연본부에 연결되지 않음
 * 해결: parentId 설정 및 매니저 organizationId 업데이트
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('='.repeat(60));
  console.log('페마연 지사 매칭 수정 스크립트');
  console.log('='.repeat(60));
  console.log('');

  // 1. 현재 상태 확인
  console.log('📊 현재 상태 확인 중...\n');
  
  const pemayeonOrgs = await prisma.organization.findMany({
    where: {
      OR: [
        { name: { contains: '페마연' } },
        { name: { contains: '페마' } }
      ]
    },
    include: {
      parent: true,
      subOrganizations: true,
      salesPeople: true,
    }
  });
  
  console.log(`✅ 페마연 관련 조직 ${pemayeonOrgs.length}개 발견:\n`);
  
  pemayeonOrgs.forEach(org => {
    console.log(`조직명: ${org.name}`);
    console.log(`  ID: ${org.id}`);
    console.log(`  타입: ${org.type}`);
    console.log(`  리더: ${org.leaderName} (${org.phone})`);
    console.log(`  상위 조직 ID: ${org.parentId || 'null'}`);
    console.log(`  상위 조직명: ${org.parent?.name || 'N/A'}`);
    console.log(`  하위 조직 수: ${org.subOrganizations.length}`);
    console.log(`  소속 영업사원 수: ${org.salesPeople.length}`);
    if (org.salesPeople.length > 0) {
      org.salesPeople.forEach(sp => {
        console.log(`    - ${sp.name} (${sp.role})`);
      });
    }
    console.log('');
  });
  
  // 2. 페마연 본부 찾기
  const pemayeonHQ = pemayeonOrgs.find(org => 
    org.type === 'HEADQUARTERS' && org.name.includes('페마연')
  );
  
  if (!pemayeonHQ) {
    console.log('❌ 페마연 본부를 찾을 수 없습니다.');
    return;
  }
  
  console.log(`✅ 페마연 본부 발견: ${pemayeonHQ.name} (${pemayeonHQ.id})\n`);
  
  // 3. 페마연 지사 찾기 (본부에 연결되지 않은 지사)
  const unmatchedBranches = pemayeonOrgs.filter(org => 
    org.type === 'BRANCH' && 
    org.name.includes('페마연') &&
    org.parentId !== pemayeonHQ.id
  );
  
  if (unmatchedBranches.length === 0) {
    console.log('✅ 모든 페마연 지사가 본부에 연결되어 있습니다.');
    return;
  }
  
  console.log(`⚠️  본부에 연결되지 않은 페마연 지사 ${unmatchedBranches.length}개:\n`);
  unmatchedBranches.forEach(branch => {
    console.log(`  - ${branch.name} (${branch.id})`);
    console.log(`    현재 상위 조직: ${branch.parent?.name || 'null'}`);
  });
  console.log('');
  
  // 4. 수정 진행
  console.log('🔧 수정 작업 시작...\n');
  
  for (const branch of unmatchedBranches) {
    console.log(`📝 ${branch.name} 수정 중...`);
    
    try {
      // 트랜잭션으로 처리
      const result = await prisma.$transaction(async (tx) => {
        // 지사의 parentId 업데이트
        const updatedBranch = await tx.organization.update({
          where: { id: branch.id },
          data: {
            parentId: pemayeonHQ.id,
          },
        });
        
        // 지사 소속 매니저의 organizationId 확인 및 업데이트
        const branchManagers = await tx.salesPerson.findMany({
          where: {
            OR: [
              { phone: branch.phone }, // 지사장 핸드폰 번호로 찾기
              { name: branch.leaderName }, // 지사장 이름으로 찾기
            ],
          },
        });
        
        const updatedManagers = [];
        for (const manager of branchManagers) {
          if (manager.organizationId !== branch.id) {
            const updated = await tx.salesPerson.update({
              where: { id: manager.id },
              data: {
                organizationId: branch.id,
              },
            });
            updatedManagers.push(updated);
          }
        }
        
        return { updatedBranch, updatedManagers };
      });
      
      console.log(`  ✅ parentId 업데이트: ${branch.parentId} → ${pemayeonHQ.id}`);
      if (result.updatedManagers.length > 0) {
        console.log(`  ✅ ${result.updatedManagers.length}명의 매니저 organizationId 업데이트`);
        result.updatedManagers.forEach(m => {
          console.log(`     - ${m.name} (${m.role})`);
        });
      }
      console.log('');
    } catch (error) {
      console.error(`  ❌ 오류 발생:`, error.message);
      console.log('');
    }
  }
  
  // 5. 결과 확인
  console.log('='.repeat(60));
  console.log('✅ 수정 작업 완료! 결과 확인 중...\n');
  
  const updatedPemayeonHQ = await prisma.organization.findUnique({
    where: { id: pemayeonHQ.id },
    include: {
      subOrganizations: {
        include: {
          salesPeople: true,
        }
      },
      salesPeople: true,
    }
  });
  
  console.log(`본부: ${updatedPemayeonHQ.name}`);
  console.log(`  소속 지사: ${updatedPemayeonHQ.subOrganizations.length}개`);
  updatedPemayeonHQ.subOrganizations.forEach(branch => {
    console.log(`    - ${branch.name} (매니저 ${branch.salesPeople.length}명)`);
  });
  console.log(`  직속 매니저: ${updatedPemayeonHQ.salesPeople.length}명`);
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
