const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== 관리자 계정 companyId 확인 ===\n');
  
  const admins = [
    { username: 'pema_admin', expectedCompany: '페마연구소' },
    { username: 'public_admin', expectedCompany: '공공기관A' },
    { username: 'standard_admin', expectedCompany: '행복한표준사업장' }
  ];
  
  for (const admin of admins) {
    const user = await prisma.user.findFirst({
      where: { username: admin.username },
      select: {
        id: true,
        username: true,
        role: true,
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });
    
    console.log(`👤 ${admin.username}:`);
    if (user) {
      console.log(`   - User ID: ${user.id}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - CompanyId: ${user.companyId || '❌ NULL'}`);
      if (user.company) {
        console.log(`   - Company: ${user.company.name} (${user.company.type})`);
        console.log(`   - ✅ 연동 정상`);
      } else {
        console.log(`   - ❌ 회사 정보 없음`);
      }
    } else {
      console.log(`   - ❌ 계정 없음`);
    }
    console.log('');
  }
  
  await prisma.$disconnect();
}

main();
