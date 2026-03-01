const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createNotificationsForMockupData() {
  console.log('🔔 목업 데이터에 알림 추가 생성 시작...\n');

  // 1. 공지사항 알림 생성
  console.log('1️⃣ 공지사항 알림 생성...');
  
  const announcements = await prisma.companyAnnouncement.findMany({
    where: {
      createdAt: {
        gte: new Date('2026-02-28') // 오늘 이후 생성된 것들
      }
    },
    include: {
      company: {
        include: {
          buyerProfile: {
            include: {
              disabledEmployees: true
            }
          }
        }
      }
    }
  });

  let announcementNotifCount = 0;
  
  for (const announcement of announcements) {
    const employees = announcement.company.buyerProfile?.disabledEmployees || [];
    
    for (const emp of employees) {
      // 직원의 User 계정 찾기
      const user = await prisma.user.findFirst({
        where: { employeeId: emp.id }
      });
      
      if (!user) continue;
      
      // 이미 알림이 있는지 확인
      const existingNotif = await prisma.notification.findFirst({
        where: {
          userId: user.id,
          type: 'ANNOUNCEMENT',
          data: {
            contains: announcement.id
          }
        }
      });
      
      if (existingNotif) continue; // 이미 있으면 건너뛰기
      
      // 알림 생성
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'ANNOUNCEMENT',
          title: '📢 새 공지사항',
          message: announcement.title,
          link: `/dashboard/announcements/${announcement.id}`,
          data: JSON.stringify({
            announcementId: announcement.id,
            companyId: announcement.companyId,
            priority: announcement.priority
          }),
          priority: announcement.priority === 'HIGH' ? 'URGENT' : 'NORMAL',
          read: false
        }
      });
      
      announcementNotifCount++;
    }
  }
  
  console.log(`   ✅ 공지사항 알림 ${announcementNotifCount}개 생성`);

  // 2. 업무지시 알림 생성
  console.log('\n2️⃣ 업무지시 알림 생성...');
  
  const workOrders = await prisma.workOrder.findMany({
    where: {
      createdAt: {
        gte: new Date('2026-02-28')
      }
    },
    include: {
      company: {
        include: {
          buyerProfile: {
            include: {
              disabledEmployees: true
            }
          }
        }
      }
    }
  });

  let workOrderNotifCount = 0;
  
  for (const workOrder of workOrders) {
    let targetEmployees = [];
    
    if (workOrder.targetType === 'ALL') {
      targetEmployees = workOrder.company.buyerProfile?.disabledEmployees || [];
    } else if (workOrder.targetType === 'GROUP' && workOrder.targetEmployees) {
      const targetIds = JSON.parse(workOrder.targetEmployees);
      targetEmployees = (workOrder.company.buyerProfile?.disabledEmployees || [])
        .filter(emp => targetIds.includes(emp.id));
    }
    
    for (const emp of targetEmployees) {
      const user = await prisma.user.findFirst({
        where: { employeeId: emp.id }
      });
      
      if (!user) continue;
      
      // 이미 알림이 있는지 확인
      const existingNotif = await prisma.notification.findFirst({
        where: {
          userId: user.id,
          type: 'WORK_ORDER',
          data: {
            contains: workOrder.id
          }
        }
      });
      
      if (existingNotif) continue;
      
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'WORK_ORDER',
          title: '📋 새 업무지시',
          message: workOrder.title,
          link: `/dashboard/work-orders/${workOrder.id}`,
          data: JSON.stringify({
            workOrderId: workOrder.id,
            companyId: workOrder.companyId,
            priority: workOrder.priority
          }),
          priority: workOrder.priority === 'HIGH' ? 'URGENT' : 'NORMAL',
          read: false
        }
      });
      
      workOrderNotifCount++;
    }
  }
  
  console.log(`   ✅ 업무지시 알림 ${workOrderNotifCount}개 생성`);

  // 3. 휴가 신청 알림 생성 (관리자에게)
  console.log('\n3️⃣ 휴가 신청 알림 생성 (관리자)...');
  
  const leaveRequests = await prisma.leaveRequest.findMany({
    where: {
      status: 'PENDING',
      createdAt: {
        gte: new Date('2026-02-28')
      }
    },
    include: {
      leaveType: true
    }
  });

  let leaveNotifCount = 0;
  
  for (const leave of leaveRequests) {
    // 해당 회사의 관리자 찾기
    const admins = await prisma.user.findMany({
      where: {
        companyId: leave.companyId,
        role: { in: ['BUYER', 'SUPER_ADMIN'] }
      }
    });
    
    for (const admin of admins) {
      // 이미 알림이 있는지 확인
      const existingNotif = await prisma.notification.findFirst({
        where: {
          userId: admin.id,
          type: 'LEAVE_REQUEST',
          data: {
            contains: leave.id
          }
        }
      });
      
      if (existingNotif) continue;
      
      // 직원 정보 가져오기
      const employee = await prisma.disabledEmployee.findUnique({
        where: { id: leave.employeeId }
      });
      
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'LEAVE_REQUEST',
          title: '🏖️ 휴가 신청',
          message: `${employee?.name || '직원'}님이 ${leave.leaveType.name} 휴가를 신청했습니다`,
          link: `/dashboard/leave/requests`,
          data: JSON.stringify({
            leaveRequestId: leave.id,
            employeeId: leave.employeeId,
            companyId: leave.companyId
          }),
          priority: 'NORMAL',
          read: false
        }
      });
      
      leaveNotifCount++;
    }
  }
  
  console.log(`   ✅ 휴가 신청 알림 ${leaveNotifCount}개 생성`);

  // 4. 승인된 휴가 알림 (직원에게)
  console.log('\n4️⃣ 휴가 승인 알림 생성 (직원)...');
  
  const approvedLeaves = await prisma.leaveRequest.findMany({
    where: {
      status: 'APPROVED',
      createdAt: {
        gte: new Date('2026-02-28')
      }
    },
    include: {
      leaveType: true
    }
  });

  let approvedNotifCount = 0;
  
  for (const leave of approvedLeaves) {
    const user = await prisma.user.findFirst({
      where: { employeeId: leave.employeeId }
    });
    
    if (!user) continue;
    
    const existingNotif = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        type: 'LEAVE_APPROVED',
        data: {
          contains: leave.id
        }
      }
    });
    
    if (existingNotif) continue;
    
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'LEAVE_APPROVED',
        title: '✅ 휴가 승인됨',
        message: `${leave.leaveType.name} 휴가가 승인되었습니다`,
        link: `/dashboard/leave/my-requests`,
        data: JSON.stringify({
          leaveRequestId: leave.id,
          companyId: leave.companyId
        }),
        priority: 'NORMAL',
        read: false
      }
    });
    
    approvedNotifCount++;
  }
  
  console.log(`   ✅ 휴가 승인 알림 ${approvedNotifCount}개 생성`);

  // 5. 최종 통계
  console.log('\n=== 📊 알림 생성 완료 ===');
  console.log(`총 생성된 알림: ${announcementNotifCount + workOrderNotifCount + leaveNotifCount + approvedNotifCount}개`);
  console.log(`  - 공지사항: ${announcementNotifCount}개`);
  console.log(`  - 업무지시: ${workOrderNotifCount}개`);
  console.log(`  - 휴가 신청: ${leaveNotifCount}개`);
  console.log(`  - 휴가 승인: ${approvedNotifCount}개`);

  // 전체 알림 통계
  const totalNotifs = await prisma.notification.count();
  const unreadNotifs = await prisma.notification.count({ where: { read: false } });
  
  console.log(`\n전체 알림: ${totalNotifs}개 (안읽음: ${unreadNotifs}개)`);

  await prisma.$disconnect();
}

createNotificationsForMockupData().catch(e => {
  console.error('❌ 에러:', e.message);
  process.exit(1);
});
