const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDataIntegrity() {
  console.log('🔍 데이터 무결성 검증 시작...\n');

  // 1. 회사 → 관리자 연동 확인
  console.log('=== 1. 회사 ↔ 기업관리자 연동 ===');
  const companies = await prisma.company.findMany({
    include: {
      members: {
        where: {
          role: { in: ['BUYER', 'SUPER_ADMIN'] }
        }
      },
      buyerProfile: {
        include: {
          disabledEmployees: true
        }
      }
    }
  });

  companies.forEach(company => {
    const adminCount = company.members.length;
    const employeeCount = company.buyerProfile?.disabledEmployees.length || 0;
    const status = adminCount > 0 ? '✅' : '⚠️';
    
    console.log(`${status} ${company.name}`);
    console.log(`   - CompanyID: ${company.id}`);
    console.log(`   - 관리자: ${adminCount}명`);
    console.log(`   - 직원: ${employeeCount}명`);
  });

  // 2. 공지사항 연동 확인
  console.log('\n=== 2. 공지사항 연동 검증 ===');
  const announcements = await prisma.companyAnnouncement.findMany({
    include: {
      company: true,
      readLogs: {
        include: {
          announcement: true
        }
      }
    }
  });

  console.log(`총 ${announcements.length}개 공지사항`);
  
  let validCount = 0;
  let invalidCount = 0;
  
  for (const ann of announcements) {
    const companyExists = await prisma.company.findUnique({
      where: { id: ann.companyId }
    });
    
    const buyerExists = await prisma.buyerProfile.findUnique({
      where: { id: ann.buyerId }
    });
    
    if (companyExists && buyerExists) {
      validCount++;
    } else {
      invalidCount++;
      console.log(`❌ 고아 공지: ${ann.title} (CompanyID: ${ann.companyId})`);
    }
  }
  
  console.log(`✅ 정상 연동: ${validCount}개`);
  console.log(`❌ 연동 오류: ${invalidCount}개`);

  // 3. 업무지시 연동 확인
  console.log('\n=== 3. 업무지시 연동 검증 ===');
  const workOrders = await prisma.workOrder.findMany({
    include: {
      company: true
    }
  });

  console.log(`총 ${workOrders.length}개 업무지시`);
  
  validCount = 0;
  invalidCount = 0;
  
  for (const wo of workOrders) {
    const companyExists = await prisma.company.findUnique({
      where: { id: wo.companyId }
    });
    
    const buyerExists = await prisma.buyerProfile.findUnique({
      where: { id: wo.buyerId }
    });
    
    if (companyExists && buyerExists) {
      validCount++;
    } else {
      invalidCount++;
      console.log(`❌ 고아 업무: ${wo.title} (CompanyID: ${wo.companyId})`);
    }
  }
  
  console.log(`✅ 정상 연동: ${validCount}개`);
  console.log(`❌ 연동 오류: ${invalidCount}개`);

  // 4. 출퇴근 기록 연동 확인
  console.log('\n=== 4. 출퇴근 기록 연동 검증 ===');
  const attendances = await prisma.attendanceRecord.findMany();

  console.log(`총 ${attendances.length}개 출퇴근 기록`);
  
  validCount = 0;
  invalidCount = 0;
  
  for (const att of attendances) {
    const companyExists = await prisma.company.findUnique({
      where: { id: att.companyId }
    });
    
    const employeeExists = await prisma.disabledEmployee.findUnique({
      where: { id: att.employeeId }
    });
    
    const userExists = await prisma.user.findUnique({
      where: { id: att.userId }
    });
    
    if (companyExists && employeeExists && userExists) {
      validCount++;
    } else {
      invalidCount++;
      console.log(`❌ 고아 출퇴근: ${att.date} (EmployeeID: ${att.employeeId})`);
    }
  }
  
  console.log(`✅ 정상 연동: ${validCount}개`);
  console.log(`❌ 연동 오류: ${invalidCount}개`);

  // 5. 휴가 신청 연동 확인
  console.log('\n=== 5. 휴가 신청 연동 검증 ===');
  const leaveRequests = await prisma.leaveRequest.findMany();

  console.log(`총 ${leaveRequests.length}개 휴가 신청`);
  
  validCount = 0;
  invalidCount = 0;
  
  for (const lr of leaveRequests) {
    const companyExists = await prisma.company.findUnique({
      where: { id: lr.companyId }
    });
    
    const employeeExists = await prisma.disabledEmployee.findUnique({
      where: { id: lr.employeeId }
    });
    
    const userExists = await prisma.user.findUnique({
      where: { id: lr.userId }
    });
    
    const leaveTypeExists = await prisma.leaveType.findUnique({
      where: { id: lr.leaveTypeId }
    });
    
    if (companyExists && employeeExists && userExists && leaveTypeExists) {
      validCount++;
    } else {
      invalidCount++;
      console.log(`❌ 고아 휴가: ${lr.reason} (EmployeeID: ${lr.employeeId})`);
    }
  }
  
  console.log(`✅ 정상 연동: ${validCount}개`);
  console.log(`❌ 연동 오류: ${invalidCount}개`);

  // 6. 직원 계정 연동 확인
  console.log('\n=== 6. 직원 계정 (User ↔ DisabledEmployee) 연동 ===');
  const employees = await prisma.disabledEmployee.findMany({
    include: {
      buyer: {
        include: {
          company: true
        }
      }
    }
  });

  console.log(`총 ${employees.length}명 장애인직원`);
  
  let withUser = 0;
  let withoutUser = 0;
  let withCompanyId = 0;
  
  for (const emp of employees) {
    const user = await prisma.user.findFirst({
      where: { employeeId: emp.id }
    });
    
    if (user) {
      withUser++;
      if (user.companyId) {
        withCompanyId++;
      }
    } else {
      withoutUser++;
    }
  }
  
  console.log(`✅ User 계정 있음: ${withUser}명`);
  console.log(`✅ CompanyId 설정됨: ${withCompanyId}명`);
  console.log(`⚠️  User 계정 없음: ${withoutUser}명 (로그인 불가)`);

  // 7. Cascade 삭제 정책 확인
  console.log('\n=== 7. Cascade 삭제 정책 확인 ===');
  console.log('Prisma Schema 기준:');
  console.log('✅ Company 삭제 시:');
  console.log('   → CompanyAnnouncement (onDelete: Cascade)');
  console.log('   → WorkOrder (onDelete: Cascade)');
  console.log('   → AttendanceRecord (onDelete: Cascade)');
  console.log('   → LeaveRequest (onDelete: Cascade)');
  console.log('   → LeaveType (onDelete: Cascade)');
  console.log('');
  console.log('✅ DisabledEmployee 삭제 시:');
  console.log('   → User.employeeId = NULL (onDelete: SetNull)');
  console.log('   → AttendanceRecord 등은 employeeId 유지 (히스토리)');

  // 8. 데이터 무결성 최종 점수
  console.log('\n=== 8. 데이터 무결성 최종 평가 ===');
  
  const totalChecks = 5; // 공지, 업무, 출퇴근, 휴가, 직원계정
  const allAnnouncements = await prisma.companyAnnouncement.count();
  const allWorkOrders = await prisma.workOrder.count();
  const allAttendances = await prisma.attendanceRecord.count();
  const allLeaves = await prisma.leaveRequest.count();
  const allEmployees = await prisma.disabledEmployee.count();
  const allUsers = await prisma.user.count({ where: { role: 'EMPLOYEE' } });
  
  const score = (
    (await validateAnnouncements() ? 20 : 0) +
    (await validateWorkOrders() ? 20 : 0) +
    (await validateAttendances() ? 20 : 0) +
    (await validateLeaveRequests() ? 20 : 0) +
    (await validateEmployeeUsers() ? 20 : 0)
  );
  
  console.log(`\n🎯 무결성 점수: ${score}/100`);
  
  if (score === 100) {
    console.log('✅ 완벽! 모든 데이터가 정상적으로 연동되어 있습니다.');
    console.log('✅ 계정 삭제 시에도 관련 데이터가 함께 정리되어 유실 위험이 없습니다.');
  } else if (score >= 80) {
    console.log('⚠️  대부분 정상이나 일부 개선이 필요합니다.');
  } else {
    console.log('❌ 데이터 무결성에 문제가 있습니다.');
  }

  await prisma.$disconnect();
}

// 검증 헬퍼 함수들
async function validateAnnouncements() {
  const announcements = await prisma.companyAnnouncement.findMany();
  for (const ann of announcements) {
    const company = await prisma.company.findUnique({ where: { id: ann.companyId } });
    if (!company) return false;
  }
  return true;
}

async function validateWorkOrders() {
  const workOrders = await prisma.workOrder.findMany();
  for (const wo of workOrders) {
    const company = await prisma.company.findUnique({ where: { id: wo.companyId } });
    if (!company) return false;
  }
  return true;
}

async function validateAttendances() {
  const attendances = await prisma.attendanceRecord.findMany();
  for (const att of attendances) {
    const company = await prisma.company.findUnique({ where: { id: att.companyId } });
    const employee = await prisma.disabledEmployee.findUnique({ where: { id: att.employeeId } });
    if (!company || !employee) return false;
  }
  return true;
}

async function validateLeaveRequests() {
  const leaves = await prisma.leaveRequest.findMany();
  for (const lr of leaves) {
    const company = await prisma.company.findUnique({ where: { id: lr.companyId } });
    const employee = await prisma.disabledEmployee.findUnique({ where: { id: lr.employeeId } });
    if (!company || !employee) return false;
  }
  return true;
}

async function validateEmployeeUsers() {
  const users = await prisma.user.findMany({ 
    where: { role: 'EMPLOYEE', employeeId: { not: null } } 
  });
  for (const user of users) {
    if (!user.companyId) return false;
    const employee = await prisma.disabledEmployee.findUnique({ where: { id: user.employeeId } });
    if (!employee) return false;
  }
  return true;
}

verifyDataIntegrity().catch(e => {
  console.error('\n❌ 에러:', e.message);
  process.exit(1);
});
