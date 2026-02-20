import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateToPemayeon() {
  console.log('🔄 위드넷(주) → 주식회사 페마연 변경 시작...\n');
  
  try {
    // 1. Company 정보 업데이트
    console.log('1️⃣ Company 테이블 업데이트...');
    const company = await prisma.company.update({
      where: { bizNo: '2668101215' },
      data: {
        name: '주식회사 페마연',
        representative: '페마연 대표'
      },
      include: {
        buyerProfile: true
      }
    });
    console.log(`✅ Company 업데이트 완료: ${company.name}`);
    
    // 2. Calculation 테이블의 companyName 업데이트 (월별 데이터)
    console.log('\n2️⃣ Calculation 테이블 (월별 데이터) 업데이트...');
    const calculations = await prisma.calculation.updateMany({
      where: { buyerId: company.buyerProfile.id },
      data: { companyName: '주식회사 페마연' }
    });
    console.log(`✅ Calculation 업데이트 완료: ${calculations.count}개 레코드`);
    
    // 3. MonthlyEmployeeData 테이블의 회사 관련 정보 확인
    console.log('\n3️⃣ MonthlyEmployeeData 확인...');
    const monthlyData = await prisma.monthlyEmployeeData.findMany({
      where: { buyerId: company.buyerProfile.id },
      select: { year: true, month: true, id: true }
    });
    console.log(`📊 월별 데이터: ${monthlyData.length}개 레코드`);
    
    // 4. 직원 정보 확인
    console.log('\n4️⃣ 등록된 직원 목록 확인...');
    const employees = await prisma.disabledEmployee.findMany({
      where: { buyerId: company.buyerProfile.id },
      select: { id: true, name: true, registrationNumber: true }
    });
    console.log(`📋 총 ${employees.length}명의 직원:`);
    employees.forEach(emp => {
      console.log(`   - ${emp.name} (주민번호: ${emp.registrationNumber || 'N/A'})`);
    });
    
    // 5. User 테이블의 직원 계정 확인
    console.log('\n5️⃣ 직원 User 계정 확인...');
    const users = await prisma.user.findMany({
      where: { 
        role: 'EMPLOYEE',
        companyBizNo: '2668101215'
      },
      select: { id: true, name: true, phone: true }
    });
    console.log(`👤 총 ${users.length}명의 직원 계정:`);
    users.forEach(user => {
      console.log(`   - ${user.name} (전화: ${user.phone})`);
    });
    
    // 6. 최종 확인
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 변경 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`회사명: ${company.name}`);
    console.log(`사업자번호: ${company.bizNo}`);
    console.log(`대표자: ${company.representative}`);
    console.log(`등록 직원 수: ${employees.length}명`);
    console.log(`직원 계정 수: ${users.length}명`);
    console.log(`월별 데이터: ${monthlyData.length}개`);
    console.log(`계산 레코드: ${calculations.count}개`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateToPemayeon();
