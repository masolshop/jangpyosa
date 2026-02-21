import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  try {
    const employees = await prisma.disabledEmployee.findMany({
      where: { 
        buyerId: 'cmlu4gobz000a10vplc93ruqy',
        resignDate: null
      },
      select: {
        id: true,
        name: true,
        registrationNumber: true,
        workType: true,
        disabilityType: true,
      },
      take: 5
    });
    
    console.log('등록된 직원 목록:');
    console.log(JSON.stringify(employees, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
