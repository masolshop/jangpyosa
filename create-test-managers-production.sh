#!/bin/bash

echo "========================================"
echo "🚀 프로덕션 서버에 테스트 매니저 3개 생성"
echo "========================================"

ssh -i /home/user/.ssh/jangpyosa.pem ubuntu@43.201.0.129 << 'ENDSSH'

cd /home/ubuntu/jangpyosa/apps/api

# Node.js 스크립트 생성
cat > create-managers.mjs << 'ENDNODE'
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const testManagers = [
  {
    name: '김영희',
    phone: '01012345001',
    email: 'kim@jangpyosa.com',
    password: 'manager123',
    birthDate: '900101',
  },
  {
    name: '이철수',
    phone: '01012345002',
    email: 'lee@jangpyosa.com',
    password: 'manager123',
    birthDate: '850505',
  },
  {
    name: '박민수',
    phone: '01012345003',
    email: 'park@jangpyosa.com',
    password: 'manager123',
    birthDate: '920815',
  },
];

async function createManager(manager) {
  try {
    console.log(`\n📝 ${manager.name} 생성 중...`);

    // 이미 존재하는지 확인
    const existingUser = await prisma.user.findUnique({
      where: { phone: manager.phone },
    });

    if (existingUser) {
      console.log(`⚠️  ${manager.name} - 이미 존재하는 계정입니다 (${manager.phone})`);
      return null;
    }

    // 비밀번호 해싱
    const passwordHash = await bcrypt.hash(manager.password, 10);

    // User 생성
    const user = await prisma.user.create({
      data: {
        phone: manager.phone,
        email: manager.email,
        passwordHash,
        name: manager.name,
        role: 'EMPLOYEE',
        birthDate: manager.birthDate,
      },
    });

    // SalesPerson 생성
    const salesPerson = await prisma.salesPerson.create({
      data: {
        userId: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: 'MANAGER',
        referralCode: user.phone.replace(/^0/, ''),
        referralLink: `https://jangpyosa.com/${user.phone}`,
        totalReferrals: 0,
        activeReferrals: 0,
        totalRevenue: 0,
        commission: 0,
        isActive: true,
      },
    });

    console.log(`✅ ${manager.name} 생성 완료!`);
    console.log(`   📱 아이디: ${manager.phone}`);
    console.log(`   🔐 비밀번호: ${manager.password}`);
    console.log(`   👤 역할: MANAGER`);
    console.log(`   🔗 추천인 링크: ${salesPerson.referralLink}`);

    return { user, salesPerson };
  } catch (error) {
    console.error(`❌ ${manager.name} 생성 실패:`, error.message);
    return null;
  }
}

async function main() {
  console.log('========================================');
  console.log('🚀 테스트 매니저 계정 3개 생성 시작');
  console.log('========================================');

  const results = [];

  for (const manager of testManagers) {
    const result = await createManager(manager);
    results.push(result);
  }

  console.log('\n========================================');
  console.log('📊 생성 결과 요약');
  console.log('========================================');

  const successCount = results.filter(r => r !== null).length;
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패/중복: ${testManagers.length - successCount}개`);

  console.log('\n📋 로그인 정보:');
  console.log('----------------------------------------');
  testManagers.forEach((manager, index) => {
    console.log(`${index + 1}. ${manager.name}`);
    console.log(`   아이디: ${manager.phone}`);
    console.log(`   비밀번호: ${manager.password}`);
    console.log('');
  });

  console.log('🔗 로그인 페이지: https://jangpyosa.com/admin/sales');
  console.log('========================================');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('오류 발생:', error);
  prisma.$disconnect();
  process.exit(1);
});
ENDNODE

# 스크립트 실행
echo ""
echo "📦 매니저 계정 생성 중..."
node create-managers.mjs

# 생성한 파일 삭제
rm create-managers.mjs

ENDSSH

echo ""
echo "========================================"
echo "✅ 완료!"
echo "========================================"
