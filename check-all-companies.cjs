const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n=== 모든 회사 데이터 확인 ===\n');
    
    const companies = await prisma.company.findMany({
      where: { type: 'BUYER' }
    });
    
    console.log(`총 ${companies.length}개 회사:\n`);
    
    for (const company of companies) {
      console.log(`\n회사: ${company.name}`);
      console.log(`  ID: ${company.id}`);
      console.log(`  사업자번호: ${company.businessNumber}`);
      
      // 관리자
      const admins = await prisma.user.findMany({
        where: { 
          companyId: company.id,
          role: 'BUYER'
        }
      });
      console.log(`  관리자: ${admins.map(a => a.name).join(', ')}`);
      
      // 직원 수
      const employees = await prisma.disabledEmployee.findMany({
        where: { buyerId: company.id }
      });
      console.log(`  직원: ${employees.length}명`);
      
      // 업무지시
      const workOrders = await prisma.workOrder.findMany({
        where: { buyerId: company.id }
      });
      console.log(`  📋 업무지시: ${workOrders.length}개`);
      
      // 공지사항
      const announcements = await prisma.companyAnnouncement.findMany({
        where: { buyerId: company.id }
      });
      console.log(`  📢 공지사항: ${announcements.length}개`);
      
      // 근태 기록
      const attendances = await prisma.attendanceRecord.findMany({
        where: {
          employeeId: {
            in: employees.map(e => e.id)
          }
        }
      });
      console.log(`  ⏰ 근태 기록: ${attendances.length}건`);
      
      // 알림
      const notifications = await prisma.notification.findMany({
        where: {
          userId: {
            in: admins.map(a => a.id)
          }
        }
      });
      console.log(`  🔔 관리자 알림: ${notifications.length}개`);
    }
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
