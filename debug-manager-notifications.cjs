const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== 1. 관리자 계정 확인 ===");
  const manager = await prisma.user.findFirst({
    where: { phone: '01010000001' },
    select: {
      id: true,
      phone: true,
      name: true,
      role: true,
      companyId: true,
      company: { select: { id: true, name: true, buyerProfile: { select: { id: true } } } }
    }
  });
  
  if (!manager) {
    console.log("❌ 관리자를 찾을 수 없습니다");
    return;
  }
  
  console.log(`이름: ${manager.name}`);
  console.log(`User ID: ${manager.id}`);
  console.log(`역할: ${manager.role}`);
  console.log(`Company ID: ${manager.companyId}`);
  console.log(`Buyer ID: ${manager.company?.buyerProfile?.id || 'N/A'}`);
  
  // 2. 관리자의 알림 확인
  console.log("\n=== 2. 관리자 알림 (최근 10개) ===");
  const notifications = await prisma.notification.findMany({
    where: { userId: manager.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      read: true,
      createdAt: true
    }
  });
  
  console.log(`총 ${notifications.length}개`);
  notifications.forEach((n, i) => {
    console.log(`${i+1}. [${n.type}] ${n.title} (읽음: ${n.read})`);
    console.log(`   메시지: ${n.message}`);
    console.log(`   생성: ${n.createdAt}`);
  });
  
  // 3. 공지사항 읽음 통계
  console.log("\n=== 3. 공지사항 읽음 통계 ===");
  const buyerId = manager.company?.buyerProfile?.id;
  
  if (!buyerId) {
    console.log("❌ Buyer ID를 찾을 수 없습니다");
    return;
  }
  
  const announcements = await prisma.companyAnnouncement.findMany({
    where: { buyerId },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: {
      id: true,
      title: true,
      createdAt: true,
      _count: {
        select: { readLogs: true }
      }
    }
  });
  
  const totalEmployees = await prisma.disabledEmployee.count({
    where: { buyerId }
  });
  
  console.log(`전체 직원 수: ${totalEmployees}`);
  for (const ann of announcements) {
    const readCount = ann._count.readLogs;
    const percentage = Math.round((readCount / totalEmployees) * 100);
    console.log(`- ${ann.title}: ${readCount}/${totalEmployees} (${percentage}%)`);
    
    // 50% 이상인 경우 알림이 있어야 함
    if (percentage >= 50) {
      const relatedNotif = await prisma.notification.findFirst({
        where: {
          userId: manager.id,
          type: 'ANNOUNCEMENT',
          data: { contains: ann.id }
        }
      });
      console.log(`  → 50% 이상 알림: ${relatedNotif ? '✅ 있음' : '❌ 없음'}`);
    }
  }
  
  // 4. 업무지시 완료 통계
  console.log("\n=== 4. 업무지시 완료 통계 ===");
  const workOrders = await prisma.workOrder.findMany({
    where: { buyerId },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: {
      id: true,
      title: true,
      createdAt: true,
      _count: {
        select: { confirmations: true }
      }
    }
  });
  
  for (const wo of workOrders) {
    const confirmCount = wo._count.confirmations;
    const percentage = Math.round((confirmCount / totalEmployees) * 100);
    console.log(`- ${wo.title}: ${confirmCount}/${totalEmployees} (${percentage}%)`);
    
    // 50% 이상인 경우 알림이 있어야 함
    if (percentage >= 50) {
      const relatedNotif = await prisma.notification.findFirst({
        where: {
          userId: manager.id,
          type: 'WORK_ORDER',
          data: { contains: wo.id }
        }
      });
      console.log(`  → 50% 이상 알림: ${relatedNotif ? '✅ 있음' : '❌ 없음'}`);
    }
  }
  
  // 5. 근태 기록 확인
  console.log("\n=== 5. 최근 출근 기록 ===");
  const recentAttendance = await prisma.attendanceRecord.findMany({
    where: { companyId: manager.companyId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      employee: { select: { name: true } }
    }
  });
  
  console.log(`최근 ${recentAttendance.length}개`);
  recentAttendance.forEach(a => {
    console.log(`- ${a.employee?.name}: ${a.workType} (${a.date})`);
    console.log(`  출근: ${a.clockIn}, 퇴근: ${a.clockOut || '미처리'}`);
  });
  
  // 근태 관련 알림이 있는지 확인
  const attendanceNotifs = await prisma.notification.findMany({
    where: {
      userId: manager.id,
      type: { in: ['ATTENDANCE_REMINDER', 'ATTENDANCE_ISSUE'] }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  console.log(`\n근태 관련 알림: ${attendanceNotifs.length}개`);
  attendanceNotifs.forEach(n => {
    console.log(`- [${n.type}] ${n.title}: ${n.message}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
