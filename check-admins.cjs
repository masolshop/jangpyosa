const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allRoles = await prisma.user.groupBy({
    by: ['role'],
    _count: true
  });
  
  console.log("=== 모든 역할 통계 ===");
  for (const r of allRoles) {
    console.log(`${r.role}: ${r._count}명`);
  }
  
  // BUYER와 COMPANY_ADMIN 역할 찾기
  const buyers = await prisma.user.findMany({
    where: { role: 'BUYER' },
    take: 3,
    select: { id: true, phone: true, name: true, role: true, companyId: true }
  });
  
  console.log("\n=== BUYER 역할 (3명) ===");
  for (const b of buyers) {
    console.log(`${b.name} (${b.phone}) - CompanyID: ${b.companyId}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
