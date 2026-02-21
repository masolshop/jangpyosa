import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  try {
    const employee = await prisma.disabledEmployee.create({
      data: {
        name: "김테스트",
        registrationNumber: "950312",
        gender: "MALE",
        severity: "SEVERE",
        workType: "OFFICE",
        disabilityType: "지체",
        disabilityGrade: "SEVERE",
        monthlySalary: 3000000,
        buyerId: "cmlu4gobz000a10vplc93ruqy",
        hireDate: new Date(),
      }
    });
    
    console.log('✅ 테스트 직원 생성 완료:');
    console.log(`이름: ${employee.name}`);
    console.log(`인증번호: ${employee.registrationNumber}`);
    console.log(`장애유형: ${employee.disabilityType}`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
