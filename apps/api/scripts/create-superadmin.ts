import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    const phone = '01063529091';
    const password = '01063529091';
    const name = '슈퍼어드민';

    // 기존 계정 확인
    const existing = await prisma.user.findUnique({
      where: { phone },
    });

    if (existing) {
      console.log('✅ 슈퍼어드민 계정이 이미 존재합니다');
      console.log('계정 정보:');
      console.log('- 전화번호:', phone);
      console.log('- 이름:', existing.name);
      console.log('- 역할:', existing.role);
      return;
    }

    // 비밀번호 해싱
    const passwordHash = await bcrypt.hash(password, 10);

    // 슈퍼어드민 계정 생성
    const superAdmin = await prisma.user.create({
      data: {
        phone,
        passwordHash,
        name,
        role: 'SUPER_ADMIN',
        privacyAgreed: true,
        privacyAgreedAt: new Date(),
      },
    });

    console.log('🎉 슈퍼어드민 계정이 생성되었습니다!');
    console.log('');
    console.log('=== 로그인 정보 ===');
    console.log('전화번호:', phone);
    console.log('비밀번호:', password);
    console.log('역할:', superAdmin.role);
    console.log('생성일:', superAdmin.createdAt);
    console.log('');
    console.log('로그인 URL: http://localhost:3003/admin/login');
    
  } catch (error) {
    console.error('❌ 슈퍼어드민 생성 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
