const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const employee = await prisma.user.findFirst({
    where: { phone: '01010010001' },
    select: { id: true, name: true, companyId: true, employeeId: true }
  });
  
  console.log("=== 직원 정보 ===");
  console.log(`이름: ${employee.name}`);
  console.log(`User ID: ${employee.id}`);
  console.log(`Company ID: ${employee.companyId}`);
  console.log(`Employee ID: ${employee.employeeId}`);
  
  // 공지사항 확인
  console.log("\n=== 공지사항 (전체) ===");
  const allAnnouncements = await prisma.companyAnnouncement.findMany({
    where: { companyId: employee.companyId },
    select: { id: true, title: true, companyId: true, isActive: true }
  });
  console.log(`전체 ${allAnnouncements.length}개`);
  allAnnouncements.slice(0, 3).forEach(a => {
    console.log(`- ${a.title} (활성: ${a.isActive})`);
  });
  
  // 업무지시 확인
  console.log("\n=== 업무지시 (전체) ===");
  const allWorkOrders = await prisma.workOrder.findMany({
    where: { companyId: employee.companyId },
    select: { id: true, title: true, companyId: true }
  });
  console.log(`전체 ${allWorkOrders.length}개`);
  allWorkOrders.slice(0, 3).forEach(w => {
    console.log(`- ${w.title}`);
  });
  
  // 직원용 공지사항 확인 (읽음 로그 포함)
  console.log("\n=== 직원이 볼 수 있는 공지사항 ===");
  const employeeAnnouncements = await prisma.companyAnnouncement.findMany({
    where: {
      companyId: employee.companyId,
      isActive: true
    },
    include: {
      readLogs: {
        where: { employeeId: employee.employeeId }
      }
    },
    take: 5
  });
  console.log(`조회 가능: ${employeeAnnouncements.length}개`);
  employeeAnnouncements.forEach(a => {
    const isRead = a.readLogs.length > 0;
    console.log(`- ${a.title} (읽음: ${isRead})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
