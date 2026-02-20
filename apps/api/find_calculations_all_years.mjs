import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findAllCalculations() {
  console.log('🔍 모든 연도의 Calculation 데이터 검색 중...\n');
  
  try {
    // 페마연(구 민간기업1) 회사
    const pemayeonCompany = await prisma.company.findUnique({
      where: { bizNo: '2668101215' },
      include: { 
        buyerProfile: {
          include: {
            calculations: {
              orderBy: [{ year: 'asc' }, { month: 'asc' }]
            }
          }
        }
      }
    });
    
    console.log(`🏢 ${pemayeonCompany.name} (${pemayeonCompany.bizNo})`);
    console.log(`📋 Buyer ID: ${pemayeonCompany.buyerProfile.id}`);
    console.log(`💰 총 Calculation: ${pemayeonCompany.buyerProfile.calculations.length}개\n`);
    
    if (pemayeonCompany.buyerProfile.calculations.length > 0) {
      console.log('📊 Calculation 데이터:');
      pemayeonCompany.buyerProfile.calculations.forEach(calc => {
        const result = JSON.parse(calc.resultJson);
        console.log(`   ${calc.year}년 ${calc.month || '연간'}월 [${calc.type}]: ${result.companyName || 'N/A'}`);
      });
    } else {
      console.log('⚠️  Calculation 데이터가 없습니다.');
      console.log('\n이유:');
      console.log('   1) 월별 페이지에서 아직 계산을 실행하지 않음');
      console.log('   2) 또는 계산 시 에러 발생');
    }
    
    // 다른 회사들도 확인
    console.log('\n\n🔍 다른 회사들의 Calculation 데이터:');
    const allCompanies = await prisma.company.findMany({
      where: { 
        NOT: { bizNo: '2668101215' }
      },
      include: {
        buyerProfile: {
          include: {
            calculations: true
          }
        }
      }
    });
    
    allCompanies.forEach(company => {
      if (company.buyerProfile && company.buyerProfile.calculations.length > 0) {
        console.log(`\n${company.name} (${company.bizNo}): ${company.buyerProfile.calculations.length}개`);
        company.buyerProfile.calculations.slice(0, 3).forEach(calc => {
          const result = JSON.parse(calc.resultJson);
          console.log(`   ${calc.year}년 ${calc.month || '연간'}월: ${result.companyName || 'N/A'}`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findAllCalculations();
