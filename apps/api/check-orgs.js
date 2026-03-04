const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orgs = await prisma.organization.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      type: true,
      leaderName: true,
      phone: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  
  console.log('\n📊 현재 조직 목록:');
  console.log('='.repeat(80));
  
  orgs.forEach((org, i) => {
    console.log(`\n${i + 1}. ${org.type === 'HEADQUARTERS' ? '🏢 본부' : '🏪 지사'}`);
    console.log(`   ID: ${org.id}`);
    console.log(`   조직명 (name): "${org.name}"`);
    console.log(`   ${org.type === 'HEADQUARTERS' ? '본부장' : '지사장'}명 (leaderName): "${org.leaderName}"`);
    console.log(`   연락처: ${org.phone}`);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log(`총 ${orgs.length}개 조직\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
