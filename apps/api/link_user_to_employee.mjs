import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function linkUserToEmployee() {
  try {
    console.log('\n🔗 User와 DisabledEmployee 연결 수정\n');
    
    // 1. 홍길동 DisabledEmployee 찾기
    const hongEmployee = await prisma.disabledEmployee.findFirst({
      where: {
        name: '홍길동',
        buyerId: 'cmlu4gobz000a10vplc93ruqy' // 민간기업1의 buyerId
      }
    });
    
    if (!hongEmployee) {
      console.log('❌ 홍길동 DisabledEmployee를 찾을 수 없습니다.');
      return;
    }
    
    console.log('✅ 홍길동 DisabledEmployee 찾음:');
    console.log(`  ID: ${hongEmployee.id}`);
    console.log(`  Name: ${hongEmployee.name}`);
    console.log();
    
    // 2. User 계정 찾기
    const user = await prisma.user.findUnique({
      where: { phone: '01010010001' }
    });
    
    if (!user) {
      console.log('❌ User를 찾을 수 없습니다.');
      return;
    }
    
    console.log('✅ User 계정 찾음:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Current Employee ID: ${user.employeeId}`);
    console.log();
    
    // 3. User 이름과 employeeId 업데이트
    console.log('🔧 User 업데이트 중...');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: '홍길동',
        employeeId: hongEmployee.id
      }
    });
    
    console.log('✅ User 업데이트 완료!');
    console.log(`  Name: 김민수 → 홍길동`);
    console.log(`  Employee ID: ${user.employeeId} → ${hongEmployee.id}`);
    
    // 4. 최종 확인
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    
    const linkedEmployee = await prisma.disabledEmployee.findUnique({
      where: { id: updatedUser.employeeId }
    });
    
    console.log('\n📋 최종 확인:');
    console.log(`  User Name: ${updatedUser.name}`);
    console.log(`  Employee ID: ${updatedUser.employeeId}`);
    console.log(`  Employee Name: ${linkedEmployee.name}`);
    console.log();
    console.log('✅ 연결 완료! 이제 출퇴근 등록 시 "민간기업1 / 홍길동"으로 표시됩니다.');
    
  } catch (error) {
    console.error('에러:', error);
  } finally {
    await prisma.$disconnect();
  }
}

linkUserToEmployee();
