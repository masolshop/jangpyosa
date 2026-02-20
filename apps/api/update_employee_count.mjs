import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateEmployeeCount() {
  try {
    console.log('🔄 총 직원 수를 1000명으로 업데이트 시작...\n');

    // 모든 BUYER 기업 조회
    const buyers = await prisma.company.findMany({
      where: { type: 'BUYER' },
      include: { 
        ownerUser: true,
        buyerProfile: true 
      },
      orderBy: { createdAt: 'asc' }
    });

    if (buyers.length === 0) {
      console.error('❌ BUYER 기업을 찾을 수 없습니다');
      return;
    }

    for (const buyer of buyers) {
      console.log(`\n📌 ${buyer.name} (${buyer.buyerType})`);
      
      if (!buyer.buyerProfile) {
        console.log('   ⚠️ BuyerProfile이 없습니다. 건너뜁니다.');
        continue;
      }

      // 기존 장애인 직원 수 (가중치 포함)
      const currentDisabledCount = buyer.buyerProfile.disabledCount;
      
      // 총 직원 수를 1000명으로 업데이트
      await prisma.buyerProfile.update({
        where: { id: buyer.buyerProfile.id },
        data: {
          employeeCount: 1000
        }
      });

      // 의무고용률 계산
      const requiredRate = buyer.buyerType === 'PRIVATE_COMPANY' ? 3.1 : 3.8;
      const requiredCount = Math.ceil(1000 * requiredRate / 100);
      const fulfillmentRate = (currentDisabledCount / requiredCount * 100).toFixed(1);

      console.log(`   총 직원 수: 100명 → 1000명`);
      console.log(`   의무고용률: ${requiredRate}%`);
      console.log(`   의무고용 인원: ${requiredCount}명`);
      console.log(`   실제 고용 인원: ${currentDisabledCount}명 (가중치 포함)`);
      console.log(`   달성률: ${fulfillmentRate}%`);
      
      if (currentDisabledCount >= requiredCount) {
        console.log(`   ✅ 의무고용 달성!`);
      } else {
        const shortage = requiredCount - currentDisabledCount;
        console.log(`   ⚠️ ${shortage}명 부족 (${(shortage).toFixed(1)}명)`);
      }
    }

    console.log('\n\n✅ 총 직원 수 업데이트 완료!');

  } catch (error) {
    console.error('❌ 에러:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateEmployeeCount();
