import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 주민번호 앞자리(YYMMDD)를 Date 객체로 변환
 * 예: "850315" -> 1985-03-15
 *     "030520" -> 2003-05-20
 */
function parseRegistrationNumberToBirthDate(regNumber) {
  if (!regNumber || regNumber.length < 6) {
    return null;
  }
  
  const yymmdd = regNumber.substring(0, 6);
  const yy = parseInt(yymmdd.substring(0, 2));
  const mm = parseInt(yymmdd.substring(2, 4));
  const dd = parseInt(yymmdd.substring(4, 6));
  
  // 2000년대/1900년대 판단: 30 이하면 2000년대, 그 이상이면 1900년대
  const yyyy = yy <= 30 ? 2000 + yy : 1900 + yy;
  
  // 날짜 유효성 검사
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    return null;
  }
  
  return new Date(yyyy, mm - 1, dd);
}

async function addEmployeeBirthdates() {
  console.log('🎂 직원 birthDate 추가 시작...\n');
  
  try {
    // 페마연 회사의 모든 직원 조회
    const company = await prisma.company.findUnique({
      where: { bizNo: '2668101215' },
      include: {
        buyerProfile: {
          include: {
            disabledEmployees: true
          }
        }
      }
    });
    
    console.log(`🏢 ${company.name}`);
    console.log(`📋 총 직원: ${company.buyerProfile.disabledEmployees.length}명\n`);
    
    let updateCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const employee of company.buyerProfile.disabledEmployees) {
      // 이미 birthDate가 있으면 스킵
      if (employee.birthDate) {
        skipCount++;
        continue;
      }
      
      // registrationNumber가 없으면 스킵
      if (!employee.registrationNumber) {
        console.log(`⚠️  ${employee.name}: 주민번호 없음 (스킵)`);
        errorCount++;
        continue;
      }
      
      // 주민번호에서 생년월일 추출
      const birthDate = parseRegistrationNumberToBirthDate(employee.registrationNumber);
      
      if (!birthDate) {
        console.log(`❌ ${employee.name}: 주민번호 파싱 실패 (${employee.registrationNumber})`);
        errorCount++;
        continue;
      }
      
      // 업데이트
      await prisma.disabledEmployee.update({
        where: { id: employee.id },
        data: { birthDate }
      });
      
      console.log(`✅ ${employee.name}: ${employee.registrationNumber} → ${birthDate.toISOString().split('T')[0]}`);
      updateCount++;
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ 업데이트: ${updateCount}명`);
    console.log(`⏭️  스킵 (이미 있음): ${skipCount}명`);
    console.log(`❌ 실패: ${errorCount}명`);
    console.log(`📊 총: ${company.buyerProfile.disabledEmployees.length}명`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 최종 확인
    console.log('\n📋 최종 확인 (생년월일 있는 직원):');
    const updatedEmployees = await prisma.disabledEmployee.findMany({
      where: { 
        buyerId: company.buyerProfile.id,
        birthDate: { not: null }
      },
      select: { name: true, birthDate: true, registrationNumber: true }
    });
    
    console.log(`\n생년월일이 있는 직원: ${updatedEmployees.length}명`);
    updatedEmployees.slice(0, 5).forEach(emp => {
      console.log(`   ${emp.name}: ${emp.birthDate?.toISOString().split('T')[0]}`);
    });
    if (updatedEmployees.length > 5) {
      console.log(`   ... 외 ${updatedEmployees.length - 5}명`);
    }
    
  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addEmployeeBirthdates();
