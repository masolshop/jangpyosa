import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findEmployees() {
  try {
    // 민간기업1의 buyer profile 찾기
    const company = await prisma.company.findUnique({
      where: { bizNo: '1111122222' },
      include: {
        buyerProfile: {
          include: {
            disabledEmployees: {
              where: {
                OR: [
                  { name: { contains: '홍길동' } },
                  { name: { contains: '김민수' } },
                  { name: { contains: '박영희' } },
                  { name: { contains: '이철수' } },
                ]
              },
              take: 5
            }
          }
        }
      }
    });
    
    if (!company) {
      console.log('❌ 회사를 찾을 수 없습니다.');
      return;
    }
    
    console.log('\n🏢 회사:', company.name);
    console.log('Biz No:', company.bizNo);
    
    if (!company.buyerProfile) {
      console.log('❌ Buyer Profile이 없습니다.');
      return;
    }
    
    console.log('Buyer Profile ID:', company.buyerProfile.id);
    console.log('\n👥 등록된 직원:');
    
    company.buyerProfile.disabledEmployees.forEach(e => {
      console.log(`- ${e.name} (ID: ${e.id})`);
    });
    
    // 전체 직원 수
    const totalCount = await prisma.disabledEmployee.count({
      where: { buyerId: company.buyerProfile.id }
    });
    
    console.log(`\n총 직원 수: ${totalCount}명`);
    
  } catch (error) {
    console.error('에러:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findEmployees();
