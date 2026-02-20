import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMonthlyData() {
  console.log('📊 월별 데이터 확인 중...\n');
  
  try {
    // 페마연 회사 찾기
    const company = await prisma.company.findUnique({
      where: { bizNo: '2668101215' },
      include: { buyerProfile: true }
    });
    
    if (!company) {
      console.log('❌ 회사를 찾을 수 없습니다');
      return;
    }
    
    console.log(`🏢 회사: ${company.name} (${company.bizNo})`);
    console.log(`📋 Buyer ID: ${company.buyerProfile.id}\n`);
    
    // 월별 데이터 확인
    const monthlyData = await prisma.monthlyEmployeeData.findMany({
      where: { 
        buyerId: company.buyerProfile.id,
        year: 2026
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }]
    });
    
    console.log(`📅 2026년 월별 데이터: ${monthlyData.length}개\n`);
    
    if (monthlyData.length === 0) {
      console.log('⚠️  2026년 데이터가 없습니다. 생성이 필요합니다.\n');
    } else {
      console.log('월별 데이터:');
      monthlyData.forEach(data => {
        console.log(`   ${data.year}년 ${data.month}월 - 상시근로자: ${data.totalEmployeeCount}명, 장애인: ${data.disabledCount}명`);
      });
    }
    
    // Calculation 데이터 확인
    const calculations = await prisma.calculation.findMany({
      where: {
        buyerId: company.buyerProfile.id,
        year: 2026
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }]
    });
    
    console.log(`\n💰 2026년 Calculation 데이터: ${calculations.count}개`);
    
  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkMonthlyData();
