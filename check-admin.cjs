const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const admins = ["pema_admin", "public_admin", "standard_admin"];
  
  for (const username of admins) {
    const user = await prisma.user.findFirst({
      where: { username },
      select: { id: true, username: true, role: true, companyId: true, company: { select: { name: true }}}
    });
    
    console.log(username, ":", user ? (user.companyId ? "OK - " + user.company.name : "NULL") : "NOT FOUND");
  }
  
  await prisma.$disconnect();
})();
