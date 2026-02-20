import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findAllCalculations() {
  console.log('🔍 모든 Calculation 데이터 검색 중...\n');
  
  try {
    // 모든 회사 조회
    const companies = await prisma.company.findMany({
      include: { 
        buyerProfile: {
          include: {
            calculations: {
              where: { year: 2026 },
              orderBy: [{ month: 'asc' }]
            }
          }
        }
      }
    });
    
    console.log(`🏢 총 ${companies.length}개 회사\n`);
    
    companies.forEach(company => {
      if (company.buyerProfile && company.buyerProfile.calculations.length > 0) {
        console.log(`\n📊 ${company.name} (${company.bizNo})`);
        console.log(`   - Buyer ID: ${company.buyerProfile.id}`);
        console.log(`   - 2026년 Calculation: ${company.buyerProfile.calculations.length}개`);
        
        company.buyerProfile.calculations.forEach(calc => {
          const result = JSON.parse(calc.resultJson);
          console.log(`      ${calc.year}년 ${calc.month}월 [${calc.type}]: ${result.companyName || 'N/A'}`);
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
