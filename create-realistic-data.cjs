const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 한국 시간 유틸
function getKSTDate(daysAgo = 0) {
  const now = new Date();
  now.setDate(now.getDate() - daysAgo);
  now.setHours(now.getHours() + 9);
  return now.toISOString().split('T')[0];
}

function getKSTTime(hoursAgo = 0, minutesAgo = 0) {
  const now = new Date();
  now.setHours(now.getHours() + 9 - hoursAgo);
  now.setMinutes(now.getMinutes() - minutesAgo);
  return now.toTimeString().split(' ')[0];
}

async function main() {
  console.log('=== 🎬 실전 목업 데이터 생성 시작 ===\n');
  
  // 1. 회사 정보 조회
  const companies = await prisma.company.findMany({
    where: {
      name: { in: ['페마연구소', '공공기관A', '행복한표준사업장'] }
    },
    include: {
      buyerProfile: true,
      members: {
        where: { role: { in: ['BUYER', 'SUPPLIER'] }},
        select: { id: true, username: true }
      }
    }
  });
  
  console.log(`✅ 회사 ${companies.length}곳 발견\n`);
  
  for (const company of companies) {
    if (!company.buyerProfile) {
      console.log(`⚠️  ${company.name}: buyerProfile 없음, 건너뜀`);
      continue;
    }
    
    const admin = company.members[0];
    if (!admin) {
      console.log(`⚠️  ${company.name}: 관리자 없음, 건너뜀`);
      continue;
    }
    
    console.log(`\n📍 ${company.name} (관리자: ${admin.username})`);
    console.log(`   BuyerId: ${company.buyerProfile.id}`);
    
    // 2. 직원 조회
    const employees = await prisma.disabledEmployee.findMany({
      where: { 
        buyerId: company.buyerProfile.id,
        resignDate: null
      },
      take: 5 // 처음 5명만
    });
    
    // User 정보 추가
    const employeesWithUser = [];
    for (const emp of employees) {
      const user = await prisma.user.findFirst({
        where: { employeeId: emp.id },
        select: { id: true, phone: true }
      });
      employeesWithUser.push({ ...emp, user });
    }
    
    console.log(`   직원: ${employeesWithUser.length}명`);
    
    if (employeesWithUser.length === 0) {
      console.log(`   ⚠️  직원 없음, 다음 회사로`);
      continue;
    }
    
    // 3. 공지사항 생성 (2개)
    const announcements = [
      {
        title: '2026년 3월 안전교육 안내',
        content: '전 직원은 3월 5일(수) 오전 10시 회의실에서 진행되는 안전교육에 참석해 주시기 바랍니다.',
        priority: 'NORMAL'
      },
      {
        title: '[긴급] 근태 시스템 업데이트',
        content: '3월 2일부터 모바일 출퇴근 시스템이 개선됩니다. 반드시 앱을 최신 버전으로 업데이트해 주세요.',
        priority: 'URGENT'
      }
    ];
    
    let announcementCount = 0;
    for (const ann of announcements) {
      const created = await prisma.companyAnnouncement.create({
        data: {
          companyId: company.id,
          buyerId: company.buyerProfile.id,
          title: ann.title,
          content: ann.content,
          priority: ann.priority,
          createdById: admin.id
        }
      });
      announcementCount++;
      
      // 일부 직원이 읽음 처리 (첫 번째 공지만)
      if (announcementCount === 1) {
        for (let i = 0; i < Math.min(3, employees.length); i++) {
          const emp = employees[i];
          if (emp.user) {
            await prisma.announcementReadLog.create({
              data: {
                announcementId: created.id,
                companyId: company.id,
                buyerId: company.buyerProfile.id,
                employeeId: emp.id,
                userId: emp.user.id
              }
            });
          }
        }
      }
    }
    console.log(`   ✅ 공지사항: ${announcementCount}건 생성`);
    
    // 4. 업무지시 생성 (2개)
    const workOrders = [
      {
        title: '주간 업무 보고서 제출',
        content: '이번 주 금요일까지 주간 업무 보고서를 제출해 주시기 바랍니다.',
        priority: 'NORMAL',
        targetType: 'ALL',
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: '안전점검 협조 요청',
        content: '내일 오전 안전점검이 예정되어 있습니다. 작업 공간을 정리해 주세요.',
        priority: 'URGENT',
        targetType: 'GROUP',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    let workOrderCount = 0;
    for (const wo of workOrders) {
      const targetEmployees = wo.targetType === 'ALL' 
        ? employees.map(e => e.id)
        : employees.slice(0, 3).map(e => e.id);
      
      const created = await prisma.workOrder.create({
        data: {
          companyId: company.id,
          buyerId: company.buyerProfile.id,
          title: wo.title,
          content: wo.content,
          priority: wo.priority,
          targetType: wo.targetType,
          targetEmployees: JSON.stringify(targetEmployees),
          dueDate: wo.dueDate,
          createdById: admin.id
        }
      });
      workOrderCount++;
      
      // 일부 직원이 확인 (첫 번째 업무만)
      if (workOrderCount === 1) {
        for (let i = 0; i < Math.min(2, employees.length); i++) {
          const emp = employees[i];
          if (emp.user) {
            await prisma.workOrderRecipient.create({
              data: {
                workOrderId: created.id,
                employeeId: emp.id,
                userId: emp.user.id
              }
            });
          }
        }
      }
    }
    console.log(`   ✅ 업무지시: ${workOrderCount}건 생성`);
    
    // 5. 출퇴근 기록 생성 (최근 3일)
    let attendanceCount = 0;
    for (let day = 2; day >= 0; day--) {
      const date = getKSTDate(day);
      
      for (const emp of employees.slice(0, 3)) { // 처음 3명만
        if (!emp.user) continue;
        
        // 출근
        const clockIn = day === 0 
          ? getKSTTime(1, 0) // 오늘: 1시간 전
          : '09:00:00'; // 과거: 9시
        
        // 퇴근 (오늘은 아직 안 함)
        const clockOut = day === 0 ? null : '18:00:00';
        
        await prisma.attendanceRecord.create({
          data: {
            companyId: company.id,
            buyerId: company.buyerProfile.id,
            employeeId: emp.id,
            userId: emp.user.id,
            date: date,
            workType: 'OFFICE',
            clockIn: clockIn,
            clockOut: clockOut
          }
        });
        attendanceCount++;
      }
    }
    console.log(`   ✅ 출퇴근: ${attendanceCount}건 생성`);
    
    // 6. 휴가 유형 생성
    const leaveTypes = await prisma.leaveType.findMany({
      where: { companyId: company.id }
    });
    
    if (leaveTypes.length === 0) {
      const types = ['연차', '병가', '경조사'];
      for (const name of types) {
        await prisma.leaveType.create({
          data: {
            companyId: company.id,
            name: name,
            isPaid: name === '연차',
            displayOrder: types.indexOf(name)
          }
        });
      }
      console.log(`   ✅ 휴가유형: 3건 생성`);
    } else {
      console.log(`   ℹ️  휴가유형: ${leaveTypes.length}건 이미 존재`);
    }
    
    // 7. 휴가 신청 생성 (2건)
    const leaveTypesForRequest = await prisma.leaveType.findMany({
      where: { companyId: company.id }
    });
    
    if (leaveTypesForRequest.length > 0 && employees.length > 0) {
      const leaveType = leaveTypesForRequest[0]; // 첫 번째 유형
      
      // 신청 1: 대기 중
      const emp1 = employees[0];
      if (emp1.user) {
        await prisma.leaveRequest.create({
          data: {
            companyId: company.id,
            buyerId: company.buyerProfile.id,
            leaveTypeId: leaveType.id,
            employeeId: emp1.id,
            userId: emp1.user.id,
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
            days: 3,
            reason: '개인 사유',
            status: 'PENDING'
          }
        });
      }
      
      // 신청 2: 승인됨 (두 번째 직원)
      if (employees.length > 1) {
        const emp2 = employees[1];
        if (emp2.user) {
          await prisma.leaveRequest.create({
            data: {
              companyId: company.id,
              buyerId: company.buyerProfile.id,
              leaveTypeId: leaveType.id,
              employeeId: emp2.id,
              userId: emp2.user.id,
              startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              days: 2,
              reason: '병원 진료',
              status: 'APPROVED',
              reviewedBy: admin.id,
              reviewedAt: new Date()
            }
          });
        }
      }
      
      console.log(`   ✅ 휴가신청: 2건 생성`);
    }
  }
  
  console.log('\n=== ✅ 목업 데이터 생성 완료! ===');
  
  await prisma.$disconnect();
}

main().catch(console.error);
