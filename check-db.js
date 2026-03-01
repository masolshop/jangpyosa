const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findUnique({
    where: { bizNo: '2668101215' },
    include: { buyerProfile: true }
  });
  
  if (!company || !company.buyerProfile) {
    console.log('❌ 회사를 찾을 수 없습니다.');
    return;
  }
  
  console.log('✅ 회사:', company.name);
  console.log('   BuyerProfile ID:', company.buyerProfile.id);
  
  const employees = await prisma.disabledEmployee.findMany({
    where: { buyerId: company.buyerProfile.id },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  console.log('\n📋 직원 목록 (최근 10명):');
  console.log('='.repeat(100));
  
  employees.forEach((emp, idx) => {
    console.log(`\n${idx + 1}. ${emp.name}`);
    console.log(`   - ID: ${emp.id}`);
    console.log(`   - 핸드폰: ${emp.phone || '없음'}`);
    console.log(`   - 주민번호: ${emp.registrationNumber || '없음'}`);
    console.log(`   - 장애유형: ${emp.disabilityType}`);
    console.log(`   - 장애등급: ${emp.disabilityGrade || '없음'}`);
    console.log(`   - 등록일: ${emp.createdAt.toISOString()}`);
  });
  
  console.log('\n' + '='.repeat(100));
  console.log(`총 ${employees.length}명`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
