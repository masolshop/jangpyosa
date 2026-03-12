#!/usr/bin/env node
/**
 * 페마연지사 목업 매니저 생성 스크립트
 * - 페마연지사에 소속될 테스트 매니저 생성
 * - managerId를 지사장(문지용)으로 설정
 * - organizationId를 페마연지사로 설정
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('='.repeat(60));
  console.log('페마연지사 목업 매니저 생성');
  console.log('='.repeat(60));
  console.log('');

  // 1. 페마연지사와 지사장 찾기
  console.log('🔍 페마연지사 정보 확인 중...\n');
  
  const pemayeonBranch = await prisma.organization.findFirst({
    where: {
      name: '페마연지사',
      type: 'BRANCH',
    },
    include: {
      parent: true,
    }
  });
  
  if (!pemayeonBranch) {
    console.log('❌ 페마연지사를 찾을 수 없습니다.');
    return;
  }
  
  console.log(`✅ 페마연지사 발견:`);
  console.log(`  조직명: ${pemayeonBranch.name}`);
  console.log(`  조직 ID: ${pemayeonBranch.id}`);
  console.log(`  상위 조직: ${pemayeonBranch.parent?.name || 'N/A'}`);
  console.log('');
  
  const branchManager = await prisma.salesPerson.findFirst({
    where: {
      name: '문지용',
      role: 'BRANCH_MANAGER',
      organizationId: pemayeonBranch.id,
    }
  });
  
  if (!branchManager) {
    console.log('❌ 페마연 지사장(문지용)을 찾을 수 없습니다.');
    return;
  }
  
  console.log(`✅ 페마연 지사장 발견:`);
  console.log(`  이름: ${branchManager.name}`);
  console.log(`  ID: ${branchManager.id}`);
  console.log(`  핸드폰: ${branchManager.phone}`);
  console.log('');
  
  // 2. 목업 매니저 데이터 준비
  const mockManagerData = {
    name: '김매니저',
    phone: '01099998888',
    email: 'mock.manager@pemayeon.com',
    password: 'test1234',
  };
  
  console.log('📝 생성할 목업 매니저 정보:');
  console.log(`  이름: ${mockManagerData.name}`);
  console.log(`  핸드폰: ${mockManagerData.phone}`);
  console.log(`  이메일: ${mockManagerData.email}`);
  console.log('');
  
  // 3. 중복 확인
  const existingUser = await prisma.user.findFirst({
    where: {
      phone: mockManagerData.phone,
    }
  });
  
  if (existingUser) {
    console.log('⚠️  이미 존재하는 핸드폰 번호입니다. 기존 매니저 정보:');
    
    const existingSalesPerson = await prisma.salesPerson.findUnique({
      where: { userId: existingUser.id },
      include: {
        organization: true,
        manager: true,
      }
    });
    
    if (existingSalesPerson) {
      console.log(`  이름: ${existingSalesPerson.name}`);
      console.log(`  역할: ${existingSalesPerson.role}`);
      console.log(`  조직: ${existingSalesPerson.organization?.name || 'N/A'}`);
      console.log(`  상위 매니저: ${existingSalesPerson.manager?.name || 'N/A'}`);
      console.log('');
      
      // 기존 매니저를 페마연지사로 이동
      if (existingSalesPerson.organizationId !== pemayeonBranch.id || 
          existingSalesPerson.managerId !== branchManager.id) {
        console.log('🔧 기존 매니저를 페마연지사로 이동 중...\n');
        
        const updated = await prisma.salesPerson.update({
          where: { id: existingSalesPerson.id },
          data: {
            organizationId: pemayeonBranch.id,
            managerId: branchManager.id,
            role: 'MANAGER', // 역할 확인
          }
        });
        
        console.log('✅ 매니저 이동 완료!');
        console.log(`  조직 ID: ${updated.organizationId}`);
        console.log(`  관리자 ID: ${updated.managerId}`);
      } else {
        console.log('✅ 이미 페마연지사에 올바르게 배정되어 있습니다.');
      }
    }
    
    await verifyResult(pemayeonBranch.id, branchManager.id);
    return;
  }
  
  // 4. 트랜잭션으로 User + SalesPerson 생성
  console.log('🚀 목업 매니저 생성 중...\n');
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 비밀번호 해시
      const hashedPassword = await bcrypt.hash(mockManagerData.password, 10);
      
      // User 생성
      const user = await tx.user.create({
        data: {
          username: mockManagerData.phone.replace(/-/g, ''),
          passwordHash: hashedPassword,
          name: mockManagerData.name,
          phone: mockManagerData.phone,
          email: mockManagerData.email,
          role: 'AGENT',
        }
      });
      
      // SalesPerson 생성
      const salesPerson = await tx.salesPerson.create({
        data: {
          userId: user.id,
          name: mockManagerData.name,
          phone: mockManagerData.phone,
          email: mockManagerData.email,
          role: 'MANAGER',
          organizationId: pemayeonBranch.id, // 페마연지사에 소속
          managerId: branchManager.id, // 문지용 지사장의 부하
          referralCode: mockManagerData.phone.replace(/-/g, ''),
          referralLink: `https://jangpyosa.com/${mockManagerData.phone.replace(/-/g, '')}`,
          isActive: true,
        }
      });
      
      return { user, salesPerson };
    });
    
    console.log('✅ 목업 매니저 생성 완료!\n');
    console.log('User 정보:');
    console.log(`  ID: ${result.user.id}`);
    console.log(`  Username: ${result.user.username}`);
    console.log(`  Role: ${result.user.role}`);
    console.log('');
    
    console.log('SalesPerson 정보:');
    console.log(`  ID: ${result.salesPerson.id}`);
    console.log(`  이름: ${result.salesPerson.name}`);
    console.log(`  역할: ${result.salesPerson.role}`);
    console.log(`  조직 ID: ${result.salesPerson.organizationId}`);
    console.log(`  관리자 ID: ${result.salesPerson.managerId}`);
    console.log(`  추천 코드: ${result.salesPerson.referralCode}`);
    console.log('');
    
  } catch (error) {
    console.error('❌ 생성 실패:', error.message);
    throw error;
  }
  
  // 5. 결과 검증
  await verifyResult(pemayeonBranch.id, branchManager.id);
}

async function verifyResult(branchOrgId, branchManagerId) {
  console.log('='.repeat(60));
  console.log('✅ 결과 검증');
  console.log('='.repeat(60));
  console.log('');
  
  // 지사장의 부하 매니저 확인
  const branchManagerWithSubs = await prisma.salesPerson.findUnique({
    where: { id: branchManagerId },
    include: {
      subordinates: {
        where: { isActive: true },
      },
      organization: true,
    }
  });
  
  console.log('📊 페마연 지사장 (문지용):');
  console.log(`  조직: ${branchManagerWithSubs.organization?.name || 'N/A'}`);
  console.log(`  직속 매니저 수: ${branchManagerWithSubs.subordinates.length}명`);
  
  if (branchManagerWithSubs.subordinates.length > 0) {
    console.log('  직속 매니저:');
    branchManagerWithSubs.subordinates.forEach(sub => {
      console.log(`    - ${sub.name} (${sub.phone})`);
    });
  }
  console.log('');
  
  // 조직 소속 확인
  const branchOrg = await prisma.organization.findUnique({
    where: { id: branchOrgId },
    include: {
      salesPeople: {
        where: { isActive: true },
      }
    }
  });
  
  console.log('📊 페마연지사 조직:');
  console.log(`  소속 영업사원 수: ${branchOrg.salesPeople.length}명`);
  if (branchOrg.salesPeople.length > 0) {
    console.log('  소속 영업사원:');
    branchOrg.salesPeople.forEach(sp => {
      console.log(`    - ${sp.name} (${sp.role})`);
    });
  }
  console.log('');
  
  console.log('='.repeat(60));
  console.log('🎉 테스트 완료!');
  console.log('='.repeat(60));
  console.log('');
  console.log('📋 로그인 정보:');
  console.log(`  Username: 01099998888`);
  console.log(`  Password: test1234`);
  console.log('  URL: https://jangpyosa.com/login');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
