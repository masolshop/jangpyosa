import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCalculation() {
  const company = await prisma.company.findUnique({
    where: { bizNo: '2668101215' },
    include: { buyerProfile: true }
  });
  
  const calculations = await prisma.calculation.findMany({
    where: {
      buyerId: company.buyerProfile.id,
      year: 2026
    },
    orderBy: [{ month: 'asc' }]
  });
  
  console.log(`💰 2026년 Calculation 데이터: ${calculations.length}개\n`);
  
  calculations.forEach(calc => {
    const result = JSON.parse(calc.resultJson);
    console.log(`${calc.year}년 ${calc.month}월 [${calc.type}]:`);
    console.log(`   - 회사명: ${result.companyName || 'N/A'}`);
    console.log(`   - 총 직원: ${result.totalEmployees || 'N/A'}명`);
  });
  
  await prisma.$disconnect();
}

checkCalculation();
