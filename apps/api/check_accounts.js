const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAccounts() {
  try {
    const users = await prisma.user.findMany({
      include: {
        company: true,
        branch: true
      },
      orderBy: [
        { role: 'asc' },
        { phone: 'asc' }
      ]
    });

    console.log('=== 데이터베이스 계정 목록 ===\n');
    
    users.forEach(user => {
      const roleLabel = user.role === 'SUPER_ADMIN' ? '슈퍼어드민' :
                        user.role === 'AGENT' ? '매니저' :
                        user.role === 'SUPPLIER' ? '표준사업장' :
                        user.role === 'BUYER' ? '고용의무기업' : user.role;
      
      console.log(`[${roleLabel}] ${user.name || user.company?.name}`);
      console.log(`  핸드폰: ${user.phone}`);
      console.log(`  username: ${user.username || '(없음)'}`);
      
      if (user.company) {
        console.log(`  회사: ${user.company.name}`);
        console.log(`  사업자번호: ${user.company.bizNo}`);
        if (user.company.buyerType) {
          const typeLabel = user.company.buyerType === 'PRIVATE_COMPANY' ? '민간기업' :
                           user.company.buyerType === 'PUBLIC_INSTITUTION' ? '공공기관' :
                           user.company.buyerType === 'GOVERNMENT' ? '국가/지자체/교육청' : user.company.buyerType;
          const rate = user.company.buyerType === 'PRIVATE_COMPANY' ? '3.1%' : '3.8%';
          console.log(`  유형: ${typeLabel} (${rate})`);
        }
      }
      
      if (user.managerName) {
        console.log(`  담당자: ${user.managerName}`);
        console.log(`  담당자 핸드폰: ${user.managerPhone || '(없음)'}`);
      }
      
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAccounts();
