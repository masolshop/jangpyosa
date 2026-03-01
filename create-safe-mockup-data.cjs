const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// KST 시간 생성 함수
function getKSTDate(daysOffset = 0, hoursOffset = 0) {
  const now = new Date();
  now.setHours(now.getHours() + 9 + hoursOffset); // UTC -> KST
  now.setDate(now.getDate() + daysOffset);
  return now;
}

async function createSafeMockupData() {
  console.log('🚀 안전한 목업 데이터 생성 시작...\n');

  // 1. 관리자가 있는 회사만 조회
  const companies = await prisma.company.findMany({
    where: {
      members: {
        some: {
          role: { in: ['BUYER', 'SUPER_ADMIN'] }
        }
      }
    },
    include: {
      buyerProfile: {
        include: {
          disabledEmployees: {
            take: 10, // 각 회사당 최대 10명
            orderBy: { createdAt: 'asc' }
          }
        }
      },
      members: {
        where: {
          role: { in: ['BUYER', 'SUPER_ADMIN'] }
        },
        take: 1
      }
    }
  });

  console.log(`✅ ${companies.length}개의 유효한 회사 발견\n`);

  for (const company of companies) {
    if (!company.buyerProfile) {
      console.log(`⚠️  ${company.name}: BuyerProfile 없음, 건너뜀\n`);
      continue;
    }

    if (company.members.length === 0) {
      console.log(`⚠️  ${company.name}: 관리자 없음, 건너뜀\n`);
      continue;
    }

    const admin = company.members[0];
    const buyerId = company.buyerProfile.id;
    const employees = company.buyerProfile.disabledEmployees;

    if (employees.length === 0) {
      console.log(`⚠️  ${company.name}: 장애인직원 없음, 건너뜀\n`);
      continue;
    }

    console.log(`\n📋 [${company.name}] 데이터 생성 중...`);
    console.log(`   - CompanyID: ${company.id}`);
    console.log(`   - BuyerID: ${buyerId}`);
    console.log(`   - 관리자: ${admin.name} (${admin.phone})`);
    console.log(`   - 직원 수: ${employees.length}명`);

    // ===== 1. 공지사항 생성 =====
    console.log(`\n   📢 공지사항 생성...`);
    
    // 안전교육 공지
    const announcement1 = await prisma.companyAnnouncement.create({
      data: {
        companyId: company.id,
        buyerId: buyerId,
        createdById: admin.id,
        title: '[필독] 3월 안전교육 실시 안내',
        content: `안녕하세요. ${company.name}입니다.\n\n오는 3월 15일(금) 14:00에 전직원 대상 안전교육을 실시합니다.\n\n📍 장소: 본사 2층 대강당\n⏰ 시간: 14:00 ~ 16:00\n\n참석 필수이오니 일정 조율 바랍니다.`,
        priority: 'HIGH',
        isActive: true,
        createdAt: getKSTDate(-2), // 2일 전
      }
    });

    // 일부 직원이 읽음 처리
    const readers1 = employees.slice(0, Math.min(3, employees.length));
    for (const emp of readers1) {
      const empUser = await prisma.user.findFirst({
        where: { employeeId: emp.id }
      });
      if (empUser) {
        await prisma.announcementReadLog.create({
          data: {
            announcementId: announcement1.id,
            companyId: company.id,
            buyerId: buyerId,
            employeeId: emp.id,
            userId: empUser.id,
            readAt: getKSTDate(-1, -3) // 1일 전
          }
        });
      }
    }

    // 근태관리 시스템 업데이트 공지
    const announcement2 = await prisma.companyAnnouncement.create({
      data: {
        companyId: company.id,
        buyerId: buyerId,
        createdById: admin.id,
        title: '근태관리 시스템 업데이트 안내',
        content: `직원 여러분께,\n\n근태관리 시스템이 업데이트되었습니다.\n\n✅ 변경사항:\n- 출퇴근 기록 시 GPS 위치 자동 저장\n- 지각/조퇴 사유 입력 필수\n- 월별 근태 통계 확인 가능\n\n문의사항은 인사팀으로 연락주시기 바랍니다.`,
        priority: 'NORMAL',
        isActive: true,
        createdAt: getKSTDate(-1), // 1일 전
      }
    });

    console.log(`      ✅ 공지 2개 생성 (읽음: ${readers1.length}명)`);

    // ===== 2. 업무지시 생성 =====
    console.log(`\n   📝 업무지시 생성...`);

    // 전체 직원 대상 업무
    const workOrder1 = await prisma.workOrder.create({
      data: {
        companyId: company.id,
        buyerId: buyerId,
        createdById: admin.id,
        createdByName: admin.name,
        title: '3월 주간 업무 보고서 제출',
        content: `모든 직원은 금주 업무 보고서를 작성하여 제출해 주시기 바랍니다.\n\n📄 제출 내용:\n1. 이번 주 주요 업무\n2. 다음 주 계획\n3. 건의사항\n\n제출 기한: 3월 8일(금) 18:00까지`,
        targetType: 'ALL',
        priority: 'NORMAL',
        status: 'PENDING',
        dueDate: getKSTDate(7), // 7일 후
        isActive: true,
        createdAt: getKSTDate(-1),
      }
    });

    // 일부 직원이 확인함
    const confirmedEmps1 = employees.slice(0, Math.min(5, employees.length));
    for (const emp of confirmedEmps1) {
      const empUser = await prisma.user.findFirst({
        where: { employeeId: emp.id }
      });
      if (empUser) {
        await prisma.workOrderConfirmation.create({
          data: {
            workOrderId: workOrder1.id,
            companyId: company.id,
            buyerId: buyerId,
            employeeId: emp.id,
            userId: empUser.id,
            confirmedAt: getKSTDate(0, -2), // 2시간 전
          }
        });
      }
    }

    // 특정 직원 대상 업무 (GROUP)
    const targetEmps = employees.slice(0, Math.min(3, employees.length));
    const targetEmpIds = targetEmps.map(e => e.id);

    const workOrder2 = await prisma.workOrder.create({
      data: {
        companyId: company.id,
        buyerId: buyerId,
        createdById: admin.id,
        createdByName: admin.name,
        title: '안전점검 실시 요청',
        content: `담당자 분들은 작업장 안전점검을 실시하고 체크리스트를 작성해 주세요.\n\n점검 항목:\n- 소화기 위치 및 상태\n- 비상구 확보 여부\n- 안전표지판 부착 상태`,
        targetType: 'GROUP',
        targetEmployees: JSON.stringify(targetEmpIds),
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: getKSTDate(3), // 3일 후
        isActive: true,
        createdAt: getKSTDate(0, -5), // 5시간 전
      }
    });

    console.log(`      ✅ 업무지시 2개 생성 (확인: ${confirmedEmps1.length}명)`);

    // ===== 3. 출퇴근 기록 생성 =====
    console.log(`\n   🕐 출퇴근 기록 생성...`);

    let attendanceCount = 0;
    const recordEmps = employees.slice(0, Math.min(5, employees.length));

    for (const emp of recordEmps) {
      const empUser = await prisma.user.findFirst({
        where: { employeeId: emp.id }
      });
      
      if (!empUser) continue;

      // 최근 3일간 출퇴근 기록
      for (let day = -2; day <= 0; day++) {
        const date = getKSTDate(day);
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dateStr = dateOnly.toISOString().split('T')[0]; // YYYY-MM-DD

        // 이미 존재하는지 확인
        const existing = await prisma.attendanceRecord.findFirst({
          where: {
            employeeId: emp.id,
            date: dateStr
          }
        });

        if (existing) continue; // 이미 있으면 건너뜀

        // 출근 시간: 08:50 ~ 09:10
        const clockIn = new Date(dateOnly);
        clockIn.setHours(8, 50 + Math.floor(Math.random() * 20), 0, 0);

        // 퇴근 시간: 17:50 ~ 18:10
        const clockOut = new Date(dateOnly);
        clockOut.setHours(17, 50 + Math.floor(Math.random() * 20), 0, 0);

        await prisma.attendanceRecord.create({
          data: {
            companyId: company.id,
            buyerId: buyerId,
            employeeId: emp.id,
            userId: empUser.id,
            date: dateStr,
            workType: 'OFFICE',
            clockIn: clockIn.toISOString(),
            clockOut: clockOut.toISOString(),
          }
        });

        attendanceCount++;
      }
    }

    console.log(`      ✅ 출퇴근 기록 ${attendanceCount}개 생성`);

    // ===== 4. 휴가 유형 & 휴가 신청 생성 =====
    console.log(`\n   🏖️  휴가 데이터 생성...`);

    // 휴가 유형 확인 및 생성
    const leaveTypes = ['연차', '병가', '경조사'];
    const createdTypes = [];

    for (const typeName of leaveTypes) {
      let leaveType = await prisma.leaveType.findFirst({
        where: {
          companyId: company.id,
          name: typeName
        }
      });

      if (!leaveType) {
        leaveType = await prisma.leaveType.create({
          data: {
            companyId: company.id,
            name: typeName,
            description: `${typeName} 휴가`,
            requiresDocument: typeName === '병가',
            isPaid: typeName !== '병가',
            maxDaysPerYear: typeName === '연차' ? 15 : null,
            displayOrder: leaveTypes.indexOf(typeName),
          }
        });
        createdTypes.push(typeName);
      }
    }

    if (createdTypes.length > 0) {
      console.log(`      ✅ 휴가 유형 ${createdTypes.length}개 생성: ${createdTypes.join(', ')}`);
    }

    // 휴가 신청 생성
    const leaveEmps = employees.slice(0, Math.min(3, employees.length));
    let leaveRequestCount = 0;

    for (let i = 0; i < leaveEmps.length; i++) {
      const emp = leaveEmps[i];
      const empUser = await prisma.user.findFirst({
        where: { employeeId: emp.id }
      });

      if (!empUser) continue;

      const leaveType = await prisma.leaveType.findFirst({
        where: {
          companyId: company.id,
          name: i === 0 ? '연차' : (i === 1 ? '병가' : '경조사')
        }
      });

      if (!leaveType) continue;

      const startDate = getKSTDate(10 + i * 3); // 10일 후부터 3일 간격
      const endDate = getKSTDate(11 + i * 3);
      const days = 2;

      const status = i === 0 ? 'PENDING' : (i === 1 ? 'APPROVED' : 'PENDING');

      const leaveRequest = await prisma.leaveRequest.create({
        data: {
          companyId: company.id,
          employeeId: emp.id,
          userId: empUser.id,
          buyerId: buyerId,
          leaveTypeId: leaveType.id,
          startDate: startDate,
          endDate: endDate,
          days: days,
          reason: i === 0 ? '개인 사유' : (i === 1 ? '몸살 감기' : '가족 경조사'),
          status: status,
          createdAt: getKSTDate(-1),
          reviewedBy: status === 'APPROVED' ? admin.id : null,
          reviewedAt: status === 'APPROVED' ? getKSTDate(0, -3) : null,
        }
      });

      leaveRequestCount++;
    }

    console.log(`      ✅ 휴가 신청 ${leaveRequestCount}개 생성`);

    console.log(`\n✅ [${company.name}] 완료!\n`);
  }

  console.log('\n🎉 모든 목업 데이터 생성 완료!');
  
  // 최종 통계
  const stats = {
    announcements: await prisma.companyAnnouncement.count(),
    workOrders: await prisma.workOrder.count(),
    attendances: await prisma.attendanceRecord.count(),
    leaveRequests: await prisma.leaveRequest.count(),
    leaveTypes: await prisma.leaveType.count(),
  };

  console.log('\n📊 전체 데이터 통계:');
  console.log(`   - 공지사항: ${stats.announcements}개`);
  console.log(`   - 업무지시: ${stats.workOrders}개`);
  console.log(`   - 출퇴근 기록: ${stats.attendances}개`);
  console.log(`   - 휴가 신청: ${stats.leaveRequests}개`);
  console.log(`   - 휴가 유형: ${stats.leaveTypes}개`);

  await prisma.$disconnect();
}

createSafeMockupData().catch(e => {
  console.error('\n❌ 에러 발생:', e);
  prisma.$disconnect();
  process.exit(1);
});
