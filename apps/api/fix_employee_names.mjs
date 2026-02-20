import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixEmployeeNames() {
  try {
    console.log('\n🔧 직원 이름 수정 및 데이터 연결 확인\n');
    
    // 1. 현재 User와 DisabledEmployee 데이터 확인
    const user1 = await prisma.user.findUnique({
      where: { phone: '01010010001' },
      select: {
        id: true,
        name: true,
        employeeId: true,
        companyBizNo: true,
      }
    });
    
    if (!user1) {
      console.log('❌ 010-1001-0001 사용자를 찾을 수 없습니다.');
      return;
    }
    
    console.log('현재 User 정보 (김민수 → 홍길동):');
    console.log(`  User ID: ${user1.id}`);
    console.log(`  Name: ${user1.name}`);
    console.log(`  Employee ID: ${user1.employeeId}`);
    console.log(`  Company Biz No: ${user1.companyBizNo}`);
    console.log();
    
    // 2. DisabledEmployee 레코드 확인
    const employee1 = await prisma.disabledEmployee.findUnique({
      where: { id: user1.employeeId },
      include: {
        buyer: {
          include: {
            company: {
              select: {
                name: true,
                bizNo: true, // businessRegistrationNumber 대신 bizNo 사용
              }
            }
          }
        }
      }
    });
    
    if (!employee1) {
      console.log('❌ DisabledEmployee 레코드를 찾을 수 없습니다.');
      return;
    }
    
    console.log('현재 DisabledEmployee 정보:');
    console.log(`  Employee ID: ${employee1.id}`);
    console.log(`  Name: ${employee1.name}`);
    console.log(`  Buyer ID: ${employee1.buyerId}`);
    console.log(`  Company: ${employee1.buyer.company.name}`);
    console.log(`  Company Biz No: ${employee1.buyer.company.bizNo}`);
    console.log();
    
    // 3. 이름 업데이트
    if (user1.name === '김민수') {
      console.log('✏️  User 이름 변경: 김민수 → 홍길동');
      await prisma.user.update({
        where: { id: user1.id },
        data: { name: '홍길동' }
      });
      console.log('✅ User 이름 변경 완료');
    } else {
      console.log(`ℹ️  User 이름이 이미 "${user1.name}"로 설정되어 있습니다.`);
    }
    
    if (employee1.name === '김민수') {
      console.log('✏️  DisabledEmployee 이름 변경: 김민수 → 홍길동');
      await prisma.disabledEmployee.update({
        where: { id: employee1.id },
        data: { name: '홍길동' }
      });
      console.log('✅ DisabledEmployee 이름 변경 완료');
    } else {
      console.log(`ℹ️  DisabledEmployee 이름이 이미 "${employee1.name}"로 설정되어 있습니다.`);
    }
    
    console.log('\n✅ 모든 수정 완료!');
    console.log('\n📋 최종 확인:');
    
    // 최종 확인
    const updatedUser = await prisma.user.findUnique({
      where: { phone: '01010010001' }
    });
    
    const updatedEmployee = await prisma.disabledEmployee.findUnique({
      where: { id: updatedUser.employeeId },
      include: {
        buyer: {
          include: {
            company: { select: { name: true } }
          }
        }
      }
    });
    
    console.log(`  User: ${updatedUser.name}`);
    console.log(`  DisabledEmployee: ${updatedEmployee.name}`);
    console.log(`  Company: ${updatedEmployee.buyer.company.name}`);
    
  } catch (error) {
    console.error('에러:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEmployeeNames();
