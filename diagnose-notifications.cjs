const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNotifications() {
  console.log('=== 📬 알림 시스템 진단 ===\n');
  
  // 1. Notification 테이블 확인
  console.log('1️⃣ Notification 테이블 확인');
  const notifications = await prisma.notification.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  
  console.log(`   총 ${notifications.length}개의 알림`);
  
  if (notifications.length > 0) {
    console.log('\n   최근 알림:');
    notifications.slice(0, 3).forEach((n, i) => {
      console.log(`   [${i+1}] ${n.type} - ${n.message?.substring(0, 40)}...`);
      console.log(`       UserId: ${n.userId}, Read: ${n.isRead}, Created: ${n.createdAt}`);
    });
  } else {
    console.log('   ⚠️  알림이 하나도 없습니다!\n');
  }
  
  // 2. 공지사항과 알림 연동 확인
  console.log('\n2️⃣ 공지사항 → 알림 생성 확인');
  const announcements = await prisma.companyAnnouncement.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  
  console.log(`   총 공지사항: ${announcements.length}개`);
  
  for (const ann of announcements) {
    const annNotifications = await prisma.notification.findMany({
      where: {
        type: 'ANNOUNCEMENT',
        metadata: {
          path: ['announcementId'],
          equals: ann.id
        }
      }
    });
    
    console.log(`   - "${ann.title}"`);
    console.log(`     → 알림: ${annNotifications.length}개`);
  }
  
  // 3. 업무지시와 알림 연동 확인
  console.log('\n3️⃣ 업무지시 → 알림 생성 확인');
  const workOrders = await prisma.workOrder.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  
  console.log(`   총 업무지시: ${workOrders.length}개`);
  
  for (const wo of workOrders) {
    const woNotifications = await prisma.notification.findMany({
      where: {
        type: 'WORK_ORDER',
        metadata: {
          path: ['workOrderId'],
          equals: wo.id
        }
      }
    });
    
    console.log(`   - "${wo.title}"`);
    console.log(`     → 알림: ${woNotifications.length}개`);
  }
  
  // 4. 휴가 신청과 알림 연동 확인
  console.log('\n4️⃣ 휴가 신청 → 알림 생성 확인');
  const leaveRequests = await prisma.leaveRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  
  console.log(`   총 휴가 신청: ${leaveRequests.length}개`);
  
  for (const lr of leaveRequests) {
    const lrNotifications = await prisma.notification.findMany({
      where: {
        type: 'LEAVE_REQUEST',
        metadata: {
          path: ['leaveRequestId'],
          equals: lr.id
        }
      }
    });
    
    console.log(`   - EmployeeId: ${lr.employeeId}, Status: ${lr.status}`);
    console.log(`     → 알림: ${lrNotifications.length}개`);
  }
  
  // 5. 알림 서비스 코드 확인
  console.log('\n5️⃣ 알림 서비스 파일 존재 확인');
  const fs = require('fs');
  const notificationServicePath = '/home/ubuntu/jangpyosa/apps/api/src/services/notificationService.ts';
  
  if (fs.existsSync(notificationServicePath)) {
    console.log('   ✅ notificationService.ts 파일 존재');
    
    const content = fs.readFileSync(notificationServicePath, 'utf8');
    
    // 함수 존재 확인
    const hasNotifyLeave = content.includes('notifyLeaveRequest');
    const hasNotifyAnnouncement = content.includes('notifyAnnouncement');
    const hasNotifyWorkOrder = content.includes('notifyWorkOrder');
    
    console.log(`   - notifyLeaveRequest: ${hasNotifyLeave ? '✅' : '❌'}`);
    console.log(`   - notifyAnnouncement: ${hasNotifyAnnouncement ? '✅' : '❌'}`);
    console.log(`   - notifyWorkOrder: ${hasNotifyWorkOrder ? '✅' : '❌'}`);
  } else {
    console.log('   ❌ notificationService.ts 파일이 없습니다!');
  }
  
  // 6. 결론
  console.log('\n=== 📊 진단 결과 ===');
  
  if (notifications.length === 0) {
    console.log('❌ 문제 발견: 알림이 생성되지 않고 있습니다!');
    console.log('\n💡 가능한 원인:');
    console.log('   1. notificationService가 호출되지 않음');
    console.log('   2. 알림 생성 함수가 제대로 작동하지 않음');
    console.log('   3. 공지/업무/휴가 생성 시 알림 함수 호출 누락');
    console.log('\n🔧 해결 방법:');
    console.log('   1. notificationService.ts 파일 확인');
    console.log('   2. 공지사항/업무지시/휴가 API에서 알림 함수 호출 확인');
    console.log('   3. 테스트로 새 공지 생성 후 알림 생성 여부 확인');
  } else {
    console.log('✅ 알림 시스템 정상 작동 중');
  }
  
  await prisma.$disconnect();
}

checkNotifications().catch(e => {
  console.error('\n❌ 에러:', e.message);
  process.exit(1);
});
