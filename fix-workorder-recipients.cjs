const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n=== 업무지시 수신자 추가 ===\n');
    
    // 페마연구소 찾기
    const company = await prisma.company.findFirst({
      where: { name: '페마연구소' }
    });
    
    if (!company) {
      console.log('❌ 페마연구소를 찾을 수 없습니다.');
      return;
    }
    
    const buyerProfile = await prisma.buyerProfile.findFirst({
      where: { companyId: company.id }
    });
    
    if (!buyerProfile) {
      console.log('❌ BuyerProfile을 찾을 수 없습니다.');
      return;
    }
    
    console.log(`✅ 회사: ${company.name}`);
    console.log(`✅ BuyerProfile: ${buyerProfile.id}\n`);
    
    // 업무지시 목록
    const workOrders = await prisma.workOrder.findMany({
      where: { buyerId: buyerProfile.id }
    });
    
    console.log(`📋 업무지시: ${workOrders.length}개\n`);
    
    // 직원 목록
    const employees = await prisma.disabledEmployee.findMany({
      where: { buyerId: buyerProfile.id },
      take: 10
    });
    
    console.log(`👥 직원: ${employees.length}명\n`);
    
    if (employees.length === 0) {
      console.log('❌ 직원이 없습니다.');
      return;
    }
    
    let addedCount = 0;
    
    // 각 업무지시에 수신자 추가
    for (const wo of workOrders) {
      // 이미 수신자가 있는지 확인
      const existingRecipients = await prisma.workOrderRecipient.findMany({
        where: { workOrderId: wo.id }
      });
      
      if (existingRecipients.length > 0) {
        console.log(`⏭️  ${wo.title}: 이미 ${existingRecipients.length}명의 수신자가 있음`);
        continue;
      }
      
      // 랜덤으로 3~7명 선택
      const recipientCount = Math.floor(Math.random() * 5) + 3;
      const selectedEmployees = employees.slice(0, recipientCount);
      
      // 수신자 추가
      for (const emp of selectedEmployees) {
        // User 찾기
        const user = await prisma.user.findFirst({
          where: { 
            companyId: company.id,
            role: 'EMPLOYEE',
            name: emp.name
          }
        });
        
        if (!user) {
          console.log(`  ⚠️  ${emp.name}: User를 찾을 수 없음`);
          continue;
        }
        
        // WorkOrderRecipient 생성
        const statuses = ['PENDING', 'PENDING', 'PENDING', 'COMPLETED'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        await prisma.workOrderRecipient.create({
          data: {
            workOrderId: wo.id,
            companyId: company.id,
            buyerId: buyerProfile.id,
            employeeId: emp.id,
            userId: user.id,
            status,
            completedAt: status === 'COMPLETED' ? new Date() : null,
          }
        });
        
        addedCount++;
      }
      
      console.log(`✅ ${wo.title}: ${selectedEmployees.length}명 추가`);
    }
    
    console.log(`\n🎉 총 ${addedCount}명의 수신자 추가 완료!`);
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
