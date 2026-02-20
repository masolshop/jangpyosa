import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function randomizeEmployment() {
  try {
    console.log('🎲 장애인 직원 수를 랜덤으로 조정 시작...\n');

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

    // 각 기업별로 랜덤 달성률 설정
    const targetRates = [
      { rate: 0.5, label: '50% 달성 (미달)' },    // 민간기업1
      { rate: 0.75, label: '75% 달성 (미달)' },   // 민간기업2
      { rate: 0.9, label: '90% 달성 (미달)' },    // 공공기관1
      { rate: 1.1, label: '110% 달성 (초과)' },   // 공공기관2
      { rate: 1.3, label: '130% 달성 (초과)' },   // 교육청1
      { rate: 1.5, label: '150% 달성 (초과)' },   // 지자체1
    ];

    for (let i = 0; i < buyers.length; i++) {
      const buyer = buyers[i];
      const target = targetRates[i];
      
      console.log(`\n📌 ${buyer.name} (${buyer.buyerType})`);
      console.log(`   목표: ${target.label}`);
      
      if (!buyer.buyerProfile) {
        console.log('   ⚠️ BuyerProfile이 없습니다. 건너뜁니다.');
        continue;
      }

      // 의무고용 계산
      const requiredRate = buyer.buyerType === 'PRIVATE_COMPANY' ? 3.1 : 3.8;
      const requiredCount = Math.ceil(1000 * requiredRate / 100);
      
      // 목표 고용 인원 (가중치 기준)
      const targetEmployed = Math.round(requiredCount * target.rate * 10) / 10; // 소수점 첫째자리
      
      // 기존 장애인 직원 모두 삭제
      await prisma.disabledEmployee.deleteMany({
        where: { buyerId: buyer.buyerProfile.id }
      });

      // BuyerProfile 업데이트
      await prisma.buyerProfile.update({
        where: { id: buyer.buyerProfile.id },
        data: {
          employeeCount: 1000,
          disabledCount: targetEmployed
        }
      });

      // 달성률 계산
      const fulfillmentRate = (targetEmployed / requiredCount * 100).toFixed(1);
      
      console.log(`   총 직원 수: 1000명`);
      console.log(`   의무고용률: ${requiredRate}%`);
      console.log(`   의무고용 인원: ${requiredCount}명`);
      console.log(`   실제 고용 인원: ${targetEmployed}명 (가중치 포함)`);
      console.log(`   달성률: ${fulfillmentRate}%`);
      
      if (targetEmployed >= requiredCount) {
        const excess = targetEmployed - requiredCount;
        console.log(`   ✅ 의무고용 달성! (초과: ${excess.toFixed(1)}명)`);
      } else {
        const shortage = requiredCount - targetEmployed;
        console.log(`   ⚠️ 의무고용 미달 (부족: ${shortage.toFixed(1)}명)`);
      }
    }

    console.log('\n\n✅ 랜덤 조정 완료!');

  } catch (error) {
    console.error('❌ 에러:', error);
  } finally {
    await prisma.$disconnect();
  }
}

randomizeEmployment();
