import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCompanyToPemayeon() {
  console.log('🔄 위드넷(주) → 주식회사 페마연 변경 시작...\n');
  
  try {
    // 1. Company 정보 업데이트
    console.log('1️⃣ Company 테이블 업데이트...');
    const company = await prisma.company.update({
      where: { bizNo: '2668101215' },
      data: {
        name: '주식회사 페마연',
        representative: '페마연 대표'
      }
    });
    console.log(`✅ Company 업데이트 완료: ${company.name}`);
    
    // 2. BuyerProfile 업데이트
    console.log('\n2️⃣ BuyerProfile 테이블 업데이트...');
    const buyerProfile = await prisma.buyerProfile.update({
      where: { companyId: company.id },
      data: {
        companyName: '주식회사 페마연'
      }
    });
    console.log(`✅ BuyerProfile 업데이트 완료: ${buyerProfile.companyName}`);
    
    // 3. Calculation 테이블의 companyName 업데이트 (월별 데이터)
    console.log('\n3️⃣ Calculation 테이블 (월별 데이터) 업데이트...');
    const calculations = await prisma.calculation.updateMany({
      where: { buyerId: buyerProfile.id },
      data: { companyName: '주식회사 페마연' }
    });
    console.log(`✅ Calculation 업데이트 완료: ${calculations.count}개 레코드`);
    
    // 4. 직원 정보 확인
    console.log('\n4️⃣ 등록된 직원 목록 확인...');
    const employees = await prisma.disabledEmployee.findMany({
      where: { buyerId: buyerProfile.id },
      select: { id: true, name: true, registrationNumber: true }
    });
    console.log(`📋 총 ${employees.length}명의 직원 확인:`);
    employees.forEach(emp => {
      console.log(`   - ${emp.name} (주민번호: ${emp.registrationNumber || 'N/A'})`);
    });
    
    // 5. 최종 확인
    console.log('\n5️⃣ 최종 확인...');
    const finalCheck = await prisma.company.findUnique({
      where: { bizNo: '2668101215' },
      include: {
        buyerProfile: {
          include: {
            disabledEmployees: {
              select: { name: true }
            }
          }
        }
      }
    });
    
    console.log('\n✅ 변경 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`회사명: ${finalCheck?.name}`);
    console.log(`사업자번호: ${finalCheck?.bizNo}`);
    console.log(`대표자: ${finalCheck?.representative}`);
    console.log(`등록 직원 수: ${finalCheck?.buyerProfile?.disabledEmployees.length}명`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateCompanyToPemayeon();
