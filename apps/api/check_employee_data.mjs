import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEmployeeData() {
  try {
    console.log('\n📋 직원 계정 정보 확인\n');
    
    // 1. 직원 USER 계정 확인
    const users = await prisma.user.findMany({
      where: {
        phone: { in: ['01010010001', '01010010002', '01010010003'] }
      },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        employeeId: true,
        companyBizNo: true,
      }
    });
    
    console.log('직원 USER 계정:');
    users.forEach(u => {
      console.log(`- ${u.name} (${u.phone})`);
      console.log(`  User ID: ${u.id}`);
      console.log(`  Employee ID: ${u.employeeId || 'NULL ❌'}`);
      console.log(`  Company Biz No: ${u.companyBizNo || 'NULL ❌'}`);
      console.log();
    });
    
    // 2. 직원 EMPLOYEE 레코드 확인 (DisabledEmployee 테이블)
    const employees = await prisma.disabledEmployee.findMany({
      where: {
        OR: [
          { name: '홍길동' },
          { name: '김민수' },
          { name: '박영희' },
          { name: '이철수' },
        ]
      },
      include: {
        company: {
          select: { name: true, businessRegistrationNumber: true }
        }
      }
    });
    
    console.log('\n직원 EMPLOYEE 레코드:');
    employees.forEach(e => {
      console.log(`- ${e.name} (${e.company.name})`);
      console.log(`  Employee ID: ${e.id}`);
      console.log(`  Company ID: ${e.companyId}`);
      console.log(`  Company Biz No: ${e.company.businessRegistrationNumber}`);
      console.log();
    });
    
    // 3. 이름이 "김민수"인 레코드 찾기
    const oldName = await prisma.disabledEmployee.findMany({
      where: { name: '김민수' }
    });
    
    if (oldName.length > 0) {
      console.log('\n⚠️  "김민수" 이름이 아직 남아있습니다:');
      oldName.forEach(e => {
        console.log(`  Employee ID: ${e.id}, Company ID: ${e.companyId}`);
      });
    }
    
  } catch (error) {
    console.error('에러:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmployeeData();
