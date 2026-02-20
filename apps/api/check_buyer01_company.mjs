import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBuyer01() {
  try {
    // buyer01 User 계정 찾기
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: 'buyer01' },
          { phone: '01011112222' }
        ]
      },
      include: {
        company: true
      }
    });
    
    if (!user) {
      console.log('❌ buyer01 계정을 찾을 수 없습니다.');
      return;
    }
    
    console.log('\n📋 buyer01 계정 정보:\n');
    console.log(`User ID: ${user.id}`);
    console.log(`Username: ${user.username || 'N/A'}`);
    console.log(`Phone: ${user.phone}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
    
    if (user.company) {
      console.log('\n🏢 회사 정보:\n');
      console.log(`회사명: ${user.company.name}`);
      console.log(`사업자번호: ${user.company.bizNo}`);
      console.log(`대표자: ${user.company.representative}`);
      console.log(`회사 타입: ${user.company.type}`);
      console.log(`Buyer 타입: ${user.company.buyerType || 'N/A'}`);
    } else {
      console.log('\n⚠️  연결된 회사 정보가 없습니다.');
    }
    
  } catch (error) {
    console.error('에러:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBuyer01();
