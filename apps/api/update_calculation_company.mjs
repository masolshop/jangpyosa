import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCalculationCompany() {
  console.log('🔄 Calculation 데이터의 회사명 업데이트 시작...\n');
  
  try {
    // 페마연 회사 찾기
    const company = await prisma.company.findUnique({
      where: { bizNo: '2668101215' },
      include: { buyerProfile: true }
    });
    
    console.log(`🏢 회사: ${company.name}`);
    console.log(`📋 Buyer ID: ${company.buyerProfile.id}\n`);
    
    // 모든 Calculation 데이터 조회
    const calculations = await prisma.calculation.findMany({
      where: { buyerId: company.buyerProfile.id }
    });
    
    console.log(`📊 총 ${calculations.length}개의 Calculation 레코드 발견\n`);
    
    if (calculations.length === 0) {
      console.log('⚠️  Calculation 데이터가 없습니다.');
      return;
    }
    
    let updateCount = 0;
    
    // 각 Calculation의 resultJson 업데이트
    for (const calc of calculations) {
      const result = JSON.parse(calc.resultJson);
      
      // 기존 회사명 확인
      const oldCompanyName = result.companyName;
      
      if (oldCompanyName !== '주식회사 페마연') {
        // 회사명 업데이트
        result.companyName = '주식회사 페마연';
        
        await prisma.calculation.update({
          where: { id: calc.id },
          data: { resultJson: JSON.stringify(result) }
        });
        
        console.log(`✅ ${calc.year}년 ${calc.month || 'N/A'}월 [${calc.type}]: "${oldCompanyName}" → "주식회사 페마연"`);
        updateCount++;
      }
    }
    
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ 업데이트 완료: ${updateCount}개 레코드`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    // 최종 확인
    console.log('\n📋 최종 확인 (2026년 데이터):');
    const verifyCalcs = await prisma.calculation.findMany({
      where: { 
        buyerId: company.buyerProfile.id,
        year: 2026
      },
      orderBy: [{ month: 'asc' }]
    });
    
    verifyCalcs.forEach(calc => {
      const result = JSON.parse(calc.resultJson);
      console.log(`   ${calc.year}년 ${calc.month}월 [${calc.type}]: ${result.companyName}`);
    });
    
  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateCalculationCompany();
