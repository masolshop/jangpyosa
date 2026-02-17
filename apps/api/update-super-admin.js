import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updateSuperAdmin() {
  const phone = '01063529091';
  const password = '01063529091';
  
  try {
    // 사용자 찾기
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (user) {
      // 기존 사용자 업데이트
      console.log('기존 사용자 발견, SUPER_ADMIN으로 업데이트...');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      user = await prisma.user.update({
        where: { phone },
        data: {
          role: 'SUPER_ADMIN',
          passwordHash: hashedPassword,
          name: '슈퍼관리자',
        },
      });
      console.log('✅ 업데이트 완료:', user.phone, user.role);
    } else {
      // 새 사용자 생성
      console.log('새 슈퍼어드민 계정 생성...');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // 기존 회사 찾기
      let company = await prisma.company.findUnique({
        where: { bizNo: '2668101215' },
      });
      
      user = await prisma.user.create({
        data: {
          phone,
          passwordHash: hashedPassword,
          name: '슈퍼관리자',
          role: 'SUPER_ADMIN',
          refCode: 'SUPER' + Date.now(),
        },
      });
      
      // Company가 없으면 생성, 있으면 연결
      if (!company) {
        company = await prisma.company.create({
          data: {
            name: '장표사닷컴',
            bizNo: '2668101215',
            representative: '대표자',
            type: 'PRIVATE',
            ownerUserId: user.id,
            isVerified: true,
          },
        });
      } else {
        // 기존 회사의 소유자 업데이트
        await prisma.company.update({
          where: { id: company.id },
          data: { ownerUserId: user.id },
        });
      }
      
      console.log('✅ 생성 완료:', user.phone, user.role);
    }
    
    console.log('\n로그인 정보:');
    console.log('전화번호:', phone);
    console.log('비밀번호:', password);
    console.log('역할:', user.role);
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateSuperAdmin();
