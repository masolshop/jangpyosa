import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 부담기초액 (2024년 기준)
const LEVY_BASE_AMOUNT = {
  ABOVE_100: 1_148_000,  // 100인 이상
  BELOW_100: 919_000     // 100인 미만
};

// 장려금 (2024년 기준)
const INCENTIVE_AMOUNT = {
  SEVERE_MALE: 600_000,           // 중증 남성
  SEVERE_FEMALE: 700_000,         // 중증 여성
  MILD_MALE: 400_000,             // 경증 남성
  MILD_FEMALE: 500_000            // 경증 여성
};

async function calculateLevyAndIncentive() {
  try {
    console.log('💰 고용부담금 및 고용장려금 정밀 계산\n');
    console.log('='.repeat(80));

    // 모든 BUYER 기업 조회
    const buyers = await prisma.company.findMany({
      where: { type: 'BUYER' },
      include: { 
        ownerUser: true,
        buyerProfile: true 
      },
      orderBy: { createdAt: 'asc' }
    });

    let totalLevy = 0;
    let totalIncentive = 0;

    for (const buyer of buyers) {
      console.log(`\n\n📊 ${buyer.name} (${buyer.buyerType})`);
      console.log('-'.repeat(80));
      
      if (!buyer.buyerProfile) {
        console.log('   ⚠️ BuyerProfile이 없습니다.');
        continue;
      }

      const profile = buyer.buyerProfile;
      const totalEmployees = profile.employeeCount;
      const disabledCount = profile.disabledCount;

      // 의무고용 계산
      const requiredRate = buyer.buyerType === 'PRIVATE_COMPANY' ? 3.1 : 3.8;
      const requiredCount = Math.ceil(totalEmployees * requiredRate / 100);

      console.log(`\n📋 기본 정보:`);
      console.log(`   • 총 직원 수: ${totalEmployees.toLocaleString()}명`);
      console.log(`   • 의무고용률: ${requiredRate}%`);
      console.log(`   • 의무고용 인원: ${requiredCount}명 (${totalEmployees} × ${requiredRate}% = ${(totalEmployees * requiredRate / 100).toFixed(1)} → 올림)`);
      console.log(`   • 실제 고용 인원: ${disabledCount}명 (가중치 포함)`);
      console.log(`   • 달성률: ${(disabledCount / requiredCount * 100).toFixed(1)}%`);

      // 부담기초액 결정
      const levyBaseAmount = totalEmployees >= 100 ? LEVY_BASE_AMOUNT.ABOVE_100 : LEVY_BASE_AMOUNT.BELOW_100;
      
      if (disabledCount < requiredCount) {
        // 미달 - 고용부담금 계산
        const shortage = requiredCount - disabledCount;
        const monthlyLevy = Math.ceil(shortage * levyBaseAmount);
        const yearlyLevy = monthlyLevy * 12;
        
        totalLevy += yearlyLevy;

        console.log(`\n⚠️ 의무고용 미달 - 고용부담금 발생`);
        console.log(`\n💸 고용부담금 계산:`);
        console.log(`   • 미고용 인원: ${shortage.toFixed(1)}명`);
        console.log(`   • 부담기초액: ${levyBaseAmount.toLocaleString()}원/월 (${totalEmployees >= 100 ? '100인 이상' : '100인 미만'})`);
        console.log(`   • 계산식: ${shortage.toFixed(1)}명 × ${levyBaseAmount.toLocaleString()}원`);
        console.log(`   • 월 부담금: ${monthlyLevy.toLocaleString()}원`);
        console.log(`   • 연 부담금: ${yearlyLevy.toLocaleString()}원`);

      } else {
        // 초과 달성 - 고용장려금 계산
        const excess = disabledCount - requiredCount;
        
        console.log(`\n✅ 의무고용 달성 - 고용장려금 수령 가능`);
        console.log(`\n🎁 고용장려금 계산:`);
        console.log(`   • 초과 고용 인원: ${excess.toFixed(1)}명 (가중치 포함)`);
        
        // 실제 직원별 장려금 계산을 위해 가정
        // (실제로는 DisabledEmployee 데이터가 필요하지만, 현재는 가중치만 저장됨)
        // 예시 계산: 초과 인원을 중증/경증, 남성/여성 비율로 추정
        
        // 간단한 추정: 50% 중증, 50% 경증, 60% 남성, 40% 여성
        const severeCount = excess * 0.5;
        const mildCount = excess * 0.5;
        
        const severeMaleCount = severeCount * 0.6;
        const severeFemaleCount = severeCount * 0.4;
        const mildMaleCount = mildCount * 0.6;
        const mildFemaleCount = mildCount * 0.4;
        
        const monthlyIncentive = Math.floor(
          severeMaleCount * INCENTIVE_AMOUNT.SEVERE_MALE +
          severeFemaleCount * INCENTIVE_AMOUNT.SEVERE_FEMALE +
          mildMaleCount * INCENTIVE_AMOUNT.MILD_MALE +
          mildFemaleCount * INCENTIVE_AMOUNT.MILD_FEMALE
        );
        
        const yearlyIncentive = monthlyIncentive * 12;
        totalIncentive += yearlyIncentive;

        console.log(`\n   📝 추정 구성 (초과 ${excess.toFixed(1)}명):`);
        console.log(`      - 중증 남성: ${severeMaleCount.toFixed(1)}명 × ${INCENTIVE_AMOUNT.SEVERE_MALE.toLocaleString()}원 = ${Math.floor(severeMaleCount * INCENTIVE_AMOUNT.SEVERE_MALE).toLocaleString()}원/월`);
        console.log(`      - 중증 여성: ${severeFemaleCount.toFixed(1)}명 × ${INCENTIVE_AMOUNT.SEVERE_FEMALE.toLocaleString()}원 = ${Math.floor(severeFemaleCount * INCENTIVE_AMOUNT.SEVERE_FEMALE).toLocaleString()}원/월`);
        console.log(`      - 경증 남성: ${mildMaleCount.toFixed(1)}명 × ${INCENTIVE_AMOUNT.MILD_MALE.toLocaleString()}원 = ${Math.floor(mildMaleCount * INCENTIVE_AMOUNT.MILD_MALE).toLocaleString()}원/월`);
        console.log(`      - 경증 여성: ${mildFemaleCount.toFixed(1)}명 × ${INCENTIVE_AMOUNT.MILD_FEMALE.toLocaleString()}원 = ${Math.floor(mildFemaleCount * INCENTIVE_AMOUNT.MILD_FEMALE).toLocaleString()}원/월`);
        console.log(`\n   💰 예상 장려금:`);
        console.log(`      • 월 장려금: ${monthlyIncentive.toLocaleString()}원`);
        console.log(`      • 연 장려금: ${yearlyIncentive.toLocaleString()}원`);
      }
    }

    // 전체 요약
    console.log('\n\n' + '='.repeat(80));
    console.log('📈 전체 요약');
    console.log('='.repeat(80));
    console.log(`\n💸 총 고용부담금 (연간): ${totalLevy.toLocaleString()}원`);
    console.log(`🎁 총 고용장려금 (연간): ${totalIncentive.toLocaleString()}원`);
    console.log(`💵 순 재정 효과: ${(totalIncentive - totalLevy).toLocaleString()}원`);
    
    if (totalIncentive > totalLevy) {
      console.log(`   ✅ 정부 지원금 수령 초과 (${(totalIncentive - totalLevy).toLocaleString()}원 수령)`);
    } else if (totalLevy > totalIncentive) {
      console.log(`   ⚠️ 부담금 납부 초과 (${(totalLevy - totalIncentive).toLocaleString()}원 납부)`);
    } else {
      console.log(`   ➖ 수지 균형`);
    }

    console.log('\n✅ 계산 완료!\n');

  } catch (error) {
    console.error('❌ 에러:', error);
  } finally {
    await prisma.$disconnect();
  }
}

calculateLevyAndIncentive();
