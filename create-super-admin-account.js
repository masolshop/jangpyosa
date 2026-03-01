import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createOrUpdateSuperAdmin() {
  const phone = '01063529091';
  const password = 'admin123'; // 원하시는 비밀번호로 변경하세요
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    // 기존 사용자 확인
    const existing = await prisma.user.findUnique({ where: { phone } });

    if (existing) {
      // 기존 사용자가 있으면 SUPER_ADMIN으로 업데이트
      await prisma.user.update({
        where: { phone },
        data: {
          role: 'SUPER_ADMIN',
          passwordHash,
        },
      });
      console.log('✅ 기존 사용자를 슈퍼어드민으로 업데이트:', phone);
    } else {
      // 새로운 슈퍼어드민 생성
      await prisma.user.create({
        data: {
          phone,
          name: '슈퍼관리자',
          email: 'admin@jangpyosa.com',
          role: 'SUPER_ADMIN',
          passwordHash,
          privacyAgreed: true,
          privacyAgreedAt: new Date(),
        },
      });
      console.log('✅ 새로운 슈퍼어드민 생성:', phone);
    }

    // 최종 확인
    const user = await prisma.user.findUnique({ where: { phone } });
    console.log('\n📊 최종 계정 정보:');
    console.log('   전화번호:', user.phone);
    console.log('   이름:', user.name);
    console.log('   역할:', user.role);
    console.log('   이메일:', user.email);
    console.log('\n🔑 로그인 정보:');
    console.log('   URL: https://jangpyosa.com/admin/login');
    console.log('   아이디:', phone);
    console.log('   비밀번호:', password);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createOrUpdateSuperAdmin();
