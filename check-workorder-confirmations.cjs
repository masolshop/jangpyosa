const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n=== 페마연구소 데이터 확인 ===\n');
    
    const company = await prisma.company.findFirst({
      where: { name: '페마연구소' }
    });
    
    if (!company) {
      console.log('❌ 페마연구소를 찾을 수 없습니다.');
      return;
    }
    
    console.log(`✅ 회사: ${company.name} (ID: ${company.id})\n`);
    
    // 1. 업무지시 목록
    const workOrders = await prisma.workOrder.findMany({
      where: { buyerId: company.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`📋 총 업무지시: ${workOrders.length}개\n`);
    
    for (const wo of workOrders) {
      console.log(`\n업무지시: ${wo.title}`);
      console.log(`  ID: ${wo.id}`);
      console.log(`  생성일: ${wo.createdAt}`);
      
      // 수신자 정보 가져오기
      const recipients = await prisma.workOrderRecipient.findMany({
        where: { workOrderId: wo.id }
      });
      
      console.log(`  수신자: ${recipients.length}명`);
      
      // 각 수신자의 확인 상태
      let confirmedCount = 0;
      for (const recipient of recipients) {
        const user = await prisma.user.findUnique({
          where: { id: recipient.userId }
        });
        
        if (recipient.completedAt) {
          confirmedCount++;
          console.log(`    ✅ ${user?.name || '알수없음'} - 완료 (${recipient.completedAt})`);
        } else {
          console.log(`    ⏳ ${user?.name || '알수없음'} - 대기 중 (상태: ${recipient.status})`);
        }
      }
      console.log(`  완료률: ${confirmedCount}/${recipients.length} (${recipients.length > 0 ? Math.round(confirmedCount / recipients.length * 100) : 0}%)`);
    }
    
    // 2. 공지사항 목록
    console.log('\n\n=== 공지사항 확인 ===\n');
    
    const announcements = await prisma.companyAnnouncement.findMany({
      where: { buyerId: company.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`📢 총 공지사항: ${announcements.length}개\n`);
    
    for (const ann of announcements) {
      console.log(`\n공지: ${ann.title}`);
      console.log(`  ID: ${ann.id}`);
      console.log(`  생성일: ${ann.createdAt}`);
      
      const reads = await prisma.announcementRead.findMany({
        where: { announcementId: ann.id },
        take: 5
      });
      
      console.log(`  읽은 직원: ${reads.length}명`);
      
      // 읽은 직원 리스트
      for (const read of reads.slice(0, 3)) {
        const user = await prisma.user.findUnique({
          where: { id: read.userId }
        });
        console.log(`    ✅ ${user?.name || '알수없음'} - ${read.readAt}`);
      }
      if (reads.length > 3) {
        console.log(`    ... 외 ${reads.length - 3}명`);
      }
    }
    
    // 3. 근태 기록
    console.log('\n\n=== 근태 기록 확인 ===\n');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const employees = await prisma.disabledEmployee.findMany({
      where: { companyId: company.id }
    });
    
    console.log(`전체 직원: ${employees.length}명\n`);
    
    const attendances = await prisma.attendanceRecord.findMany({
      where: {
        employeeId: {
          in: employees.map(e => e.id)
        },
        date: {
          gte: today
        }
      },
      take: 10
    });
    
    console.log(`⏰ 오늘 근태 기록: ${attendances.length}건\n`);
    
    for (const att of attendances) {
      const employee = employees.find(e => e.id === att.employeeId);
      console.log(`${employee?.name || '알수없음'}: 출근 ${att.clockIn || '미등록'} / 퇴근 ${att.clockOut || '미등록'}`);
    }
    
    // 4. 기업관리자 알림
    console.log('\n\n=== 기업관리자 알림 ===\n');
    
    const admin = await prisma.user.findFirst({
      where: {
        companyId: company.id,
        role: 'BUYER'
      }
    });
    
    if (admin) {
      const notifications = await prisma.notification.findMany({
        where: { userId: admin.id },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
      
      console.log(`🔔 관리자(${admin.name}) 알림: ${notifications.length}개\n`);
      
      const unreadCount = notifications.filter(n => !n.read).length;
      console.log(`미읽음: ${unreadCount}개\n`);
      
      // 타입별 통계
      const byType = {};
      for (const noti of notifications) {
        byType[noti.type] = (byType[noti.type] || 0) + 1;
      }
      
      console.log('타입별 알림:');
      for (const [type, count] of Object.entries(byType)) {
        console.log(`  ${type}: ${count}개`);
      }
      console.log('\n');
      
      for (const noti of notifications.slice(0, 5)) {
        console.log(`${noti.read ? '✅' : '🔔'} [${noti.type}] ${noti.title}`);
        console.log(`   ${noti.message}`);
        console.log(`   생성: ${noti.createdAt}\n`);
      }
    }
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
