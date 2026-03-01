const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 관리자 계정들
  console.log("=== 관리자 계정들 ===");
  const managers = await prisma.user.findMany({
    where: { role: 'COMPANY_ADMIN' },
    select: {
      id: true,
      phone: true,
      username: true,
      name: true,
      companyId: true,
      company: { select: { name: true } }
    }
  });
  
  for (const m of managers) {
    const loginId = m.username || m.phone;
    console.log(`${m.name} (${loginId}) - ${m.company?.name}`);
  }

  // 직원 계정들 (5명만)
  console.log("\n=== 직원 계정들 (샘플 5명) ===");
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    take: 5,
    select: {
      id: true,
      phone: true,
      username: true,
      name: true,
      companyId: true,
      company: { select: { name: true } }
    }
  });
  
  for (const e of employees) {
    const loginId = e.username || e.phone;
    console.log(`${e.name} (${loginId}) - ${e.company?.name}`);
  }
  
  console.log("\n✅ 모든 계정 비밀번호: password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
