const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  console.log("=== 모든 관리자 계정 companyId 체크 ===\n");
  
  const admins = await prisma.user.findMany({
    where: {
      role: { in: ["BUYER", "SUPPLIER"] }
    },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      companyId: true,
      company: {
        select: {
          id: true,
          name: true,
          type: true
        }
      }
    },
    orderBy: { createdAt: "asc" }
  });
  
  console.log(`총 관리자 수: ${admins.length}\n`);
  
  let withCompany = 0;
  let withoutCompany = 0;
  
  for (const admin of admins) {
    if (admin.companyId && admin.company) {
      withCompany++;
      console.log(`✅ ${admin.username || admin.name} (${admin.role}) → ${admin.company.name}`);
    } else {
      withoutCompany++;
      console.log(`❌ ${admin.username || admin.name} (${admin.role}) → companyId: ${admin.companyId || "NULL"}`);
    }
  }
  
  console.log(`\n정상: ${withCompany}, 문제: ${withoutCompany}`);
  
  await prisma.$disconnect();
})();
