import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('📊 사용자 및 회사 데이터 확인...\n');

    // 모든 BUYER와 SUPPLIER 사용자 조회
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'BUYER' },
          { role: 'SUPPLIER' }
        ]
      },
      include: {
        company: {
          include: {
            buyerProfile: true,
            supplierProfile: true
          }
        }
      },
      orderBy: {
        phone: 'asc'
      }
    });

    console.log(`✅ 총 ${users.length}명의 BUYER/SUPPLIER 사용자 발견\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.phone} (${user.role})`);
      if (user.company) {
        console.log(`   회사: ${user.company.name}`);
        console.log(`   타입: ${user.company.type} / ${user.company.buyerType || 'N/A'}`);
        console.log(`   buyerProfile: ${user.company.buyerProfile ? '있음' : '없음'}`);
        console.log(`   supplierProfile: ${user.company.supplierProfile ? '있음' : '없음'}`);
      } else {
        console.log(`   회사: 없음`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
