#!/usr/bin/env node
/**
 * 페마연 관련 모든 매니저 확인
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('='.repeat(60));
  console.log('페마연 관련 매니저 확인');
  console.log('='.repeat(60));
  console.log('');

  // 1. 페마연 본부와 지사 정보
  const pemayeonOrgs = await prisma.organization.findMany({
    where: {
      name: { contains: '페마연' }
    },
    include: {
      salesPeople: {
        where: { isActive: true },
      }
    }
  });
  
  console.log('📊 페마연 조직:\n');
  pemayeonOrgs.forEach(org => {
    console.log(`${org.type === 'HEADQUARTERS' ? '🏢' : '🏪'} ${org.name}`);
    console.log(`  ID: ${org.id}`);
    console.log(`  소속 영업사원: ${org.salesPeople.length}명`);
    org.salesPeople.forEach(sp => {
      console.log(`    - ${sp.name} (${sp.role})`);
    });
    console.log('');
  });
  
  // 2. 조직에 배정되지 않은 활성 매니저 찾기
  const unassignedManagers = await prisma.salesPerson.findMany({
    where: {
      role: 'MANAGER',
      isActive: true,
      organizationId: null, // 조직 미배정
    }
  });
  
  console.log('📋 조직에 배정되지 않은 활성 매니저:\n');
  if (unassignedManagers.length === 0) {
    console.log('  없음\n');
  } else {
    unassignedManagers.forEach(manager => {
      console.log(`  - ${manager.name} (${manager.phone})`);
      console.log(`    ID: ${manager.id}`);
      console.log(`    이메일: ${manager.email || 'N/A'}`);
      console.log(`    관리자 ID: ${manager.managerId || 'null'}`);
      console.log('');
    });
  }
  
  // 3. 페마연 본부에 직속으로 배정된 매니저 찾기
  const pemayeonHQ = pemayeonOrgs.find(org => org.type === 'HEADQUARTERS');
  if (pemayeonHQ) {
    const hqManagers = await prisma.salesPerson.findMany({
      where: {
        role: 'MANAGER',
        isActive: true,
        organizationId: pemayeonHQ.id,
      }
    });
    
    console.log('👥 페마연 본부 직속 매니저:\n');
    if (hqManagers.length === 0) {
      console.log('  없음\n');
    } else {
      hqManagers.forEach(manager => {
        console.log(`  - ${manager.name} (${manager.phone})`);
        console.log(`    ID: ${manager.id}`);
        console.log(`    관리자 ID: ${manager.managerId || 'null'}`);
        console.log('');
      });
    }
  }
  
  // 4. 페마연 관련 모든 활성 매니저 (참고용)
  const allManagers = await prisma.salesPerson.findMany({
    where: {
      role: 'MANAGER',
      isActive: true,
    },
    include: {
      organization: true,
      manager: true,
    }
  });
  
  console.log('📊 전체 활성 매니저 수: ' + allManagers.length + '명\n');
  console.log('조직별 분포:');
  const orgCount = {};
  allManagers.forEach(m => {
    const orgName = m.organization?.name || '미배정';
    orgCount[orgName] = (orgCount[orgName] || 0) + 1;
  });
  
  Object.entries(orgCount).forEach(([org, count]) => {
    console.log(`  - ${org}: ${count}명`);
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
