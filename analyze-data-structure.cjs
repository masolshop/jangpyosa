const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n=== 📊 시스템 데이터 구조 분석 ===\n');
    
    // 1. Company (회사)
    console.log('1️⃣ Company (회사)');
    const companies = await prisma.company.findMany({
      where: { type: 'BUYER' }
    });
    console.log(`   총 ${companies.length}개`);
    for (const c of companies) {
      console.log(`   - ${c.name} (ID: ${c.id})`);
    }
    
    // 2. User (관리자 + 직원)
    console.log('\n2️⃣ User (사용자)');
    const buyers = await prisma.user.findMany({ where: { role: 'BUYER' } });
    const employees = await prisma.user.findMany({ where: { role: 'EMPLOYEE' } });
    console.log(`   - 관리자(BUYER): ${buyers.length}명`);
    console.log(`   - 직원(EMPLOYEE): ${employees.length}명`);
    
    if (employees.length > 0) {
      console.log(`   예시: ${employees[0].name} (${employees[0].phone}) - Company: ${employees[0].companyId}`);
    }
    
    // 3. DisabledEmployee (장애인 직원 상세)
    console.log('\n3️⃣ DisabledEmployee (장애인 직원 정보)');
    const disEmployees = await prisma.disabledEmployee.findMany();
    console.log(`   총 ${disEmployees.length}명`);
    if (disEmployees.length > 0) {
      console.log(`   예시: ${disEmployees[0].name} - BuyerId: ${disEmployees[0].buyerId}`);
    }
    
    // 4. BuyerProfile (구매자 프로필)
    console.log('\n4️⃣ BuyerProfile');
    const buyerProfiles = await prisma.buyerProfile.findMany();
    console.log(`   총 ${buyerProfiles.length}개`);
    for (const bp of buyerProfiles) {
      console.log(`   - ID: ${bp.id}, CompanyId: ${bp.companyId}`);
    }
    
    // 5. WorkOrder (업무지시)
    console.log('\n5️⃣ WorkOrder (업무지시)');
    const workOrders = await prisma.workOrder.findMany();
    console.log(`   총 ${workOrders.length}개`);
    if (workOrders.length > 0) {
      const wo = workOrders[0];
      console.log(`   예시: "${wo.title}" - BuyerId: ${wo.buyerId}, CompanyId: ${wo.companyId}`);
    }
    
    // 6. CompanyAnnouncement (공지사항)
    console.log('\n6️⃣ CompanyAnnouncement (공지사항)');
    const announcements = await prisma.companyAnnouncement.findMany();
    console.log(`   총 ${announcements.length}개`);
    if (announcements.length > 0) {
      const ann = announcements[0];
      console.log(`   예시: "${ann.title}" - BuyerId: ${ann.buyerId}, CompanyId: ${ann.companyId}`);
    }
    
    // 7. AttendanceRecord (근태 기록)
    console.log('\n7️⃣ AttendanceRecord (근태)');
    const attendances = await prisma.attendanceRecord.findMany();
    console.log(`   총 ${attendances.length}건`);
    if (attendances.length > 0) {
      const att = attendances[0];
      console.log(`   예시: EmployeeId: ${att.employeeId}, Date: ${att.date}`);
    }
    
    // 8. LeaveRequest (휴가)
    console.log('\n8️⃣ LeaveRequest (휴가)');
    const leaves = await prisma.leaveRequest.findMany();
    console.log(`   총 ${leaves.length}건`);
    if (leaves.length > 0) {
      const leave = leaves[0];
      console.log(`   예시: EmployeeId: ${leave.employeeId}, CompanyId: ${leave.companyId}`);
    }
    
    // ==========================================
    // 핵심: 관계 매핑 확인
    // ==========================================
    console.log('\n\n🔍 관계 매핑 확인\n');
    
    if (companies.length > 0 && buyerProfiles.length > 0) {
      const company = companies[0];
      console.log(`회사: ${company.name} (${company.id})`);
      
      // BuyerProfile 찾기
      const bp = buyerProfiles.find(b => b.companyId === company.id);
      if (bp) {
        console.log(`  ✅ BuyerProfile 연결됨: ${bp.id}`);
        
        // 이 BuyerProfile의 DisabledEmployee 찾기
        const emps = disEmployees.filter(e => e.buyerId === bp.id);
        console.log(`  ${emps.length > 0 ? '✅' : '❌'} DisabledEmployee: ${emps.length}명`);
        
        // 이 BuyerProfile의 WorkOrder 찾기
        const wos = workOrders.filter(w => w.buyerId === bp.id);
        console.log(`  ${wos.length > 0 ? '✅' : '❌'} WorkOrder: ${wos.length}개`);
        
        // 이 BuyerProfile의 Announcement 찾기
        const anns = announcements.filter(a => a.buyerId === bp.id);
        console.log(`  ${anns.length > 0 ? '✅' : '❌'} CompanyAnnouncement: ${anns.length}개`);
        
      } else {
        console.log(`  ❌ BuyerProfile이 없음! (Company.id → BuyerProfile.companyId 매핑 실패)`);
      }
    }
    
    // 모든 회사에 대해 확인
    console.log('\n\n📋 전체 회사별 데이터 매핑\n');
    for (const company of companies) {
      console.log(`\n회사: ${company.name}`);
      console.log(`  Company.id: ${company.id}`);
      
      const bp = buyerProfiles.find(b => b.companyId === company.id);
      if (bp) {
        console.log(`  BuyerProfile.id: ${bp.id}`);
        
        const emps = disEmployees.filter(e => e.buyerId === bp.id);
        const wos = workOrders.filter(w => w.buyerId === bp.id);
        const anns = announcements.filter(a => a.buyerId === bp.id);
        const atts = attendances.filter(att => {
          const emp = emps.find(e => e.id === att.employeeId);
          return !!emp;
        });
        
        console.log(`  → 직원: ${emps.length}명`);
        console.log(`  → 업무지시: ${wos.length}개`);
        console.log(`  → 공지사항: ${anns.length}개`);
        console.log(`  → 근태기록: ${atts.length}건`);
      } else {
        console.log(`  ❌ BuyerProfile 없음!`);
      }
    }
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
