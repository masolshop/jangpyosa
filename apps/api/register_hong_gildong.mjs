import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function registerHongGildong() {
  try {
    console.log('\n👤 홍길동 직원 회원가입 시뮬레이션\n');
    
    // 1. buyer01 (위드넷(주)) 회사 정보 확인
    const company = await prisma.company.findUnique({
      where: { bizNo: '2668101215' },
      include: {
        buyerProfile: true
      }
    });
    
    if (!company) {
      console.log('❌ 사업자번호 2668101215 회사를 찾을 수 없습니다.');
      return;
    }
    
    console.log('✅ 회사 정보 확인:');
    console.log(`  회사명: ${company.name}`);
    console.log(`  사업자번호: ${company.bizNo}`);
    console.log(`  Buyer Profile ID: ${company.buyerProfile?.id || 'N/A'}`);
    console.log();
    
    if (!company.buyerProfile) {
      console.log('❌ Buyer Profile이 없습니다.');
      return;
    }
    
    // 2. 기존 홍길동 계정 확인 및 삭제
    const existingUser = await prisma.user.findUnique({
      where: { phone: '01010010001' }
    });
    
    if (existingUser) {
      console.log('⚠️  기존 홍길동 User 계정 발견, 삭제 중...');
      await prisma.user.delete({
        where: { id: existingUser.id }
      });
      console.log('✅ 기존 User 계정 삭제 완료');
      console.log();
    }
    
    const existingEmployee = await prisma.disabledEmployee.findFirst({
      where: {
        name: '홍길동',
        buyerId: company.buyerProfile.id
      }
    });
    
    if (existingEmployee) {
      console.log('⚠️  기존 홍길동 DisabledEmployee 레코드 발견, 삭제 중...');
      await prisma.disabledEmployee.delete({
        where: { id: existingEmployee.id }
      });
      console.log('✅ 기존 DisabledEmployee 레코드 삭제 완료');
      console.log();
    }
    
    // 3. DisabledEmployee (장애인 직원) 등록
    console.log('📝 DisabledEmployee 등록 중...');
    const employee = await prisma.disabledEmployee.create({
      data: {
        buyerId: company.buyerProfile.id,
        name: '홍길동',
        registrationNumber: '850315',
        disabilityType: '지체장애',
        disabilityGrade: '2급',
        severity: 'SEVERE',
        gender: 'MALE',
        birthDate: new Date('1985-03-15'),
        hireDate: new Date('2024-01-01'),
        monthlySalary: 619200, // 60시간 × 10,320원
        hasEmploymentInsurance: true,
        meetsMinimumWage: true,
        workHoursPerWeek: 60,
        workType: 'OFFICE',
      }
    });
    
    console.log('✅ DisabledEmployee 등록 완료:');
    console.log(`  Employee ID: ${employee.id}`);
    console.log(`  이름: ${employee.name}`);
    console.log(`  장애유형: ${employee.disabilityType} (${employee.severity})`);
    console.log();
    
    // 4. User 계정 생성 (직원 회원가입)
    console.log('📝 User 계정 생성 중...');
    const hashedPassword = await bcrypt.hash('employee123', 10);
    
    const user = await prisma.user.create({
      data: {
        phone: '01010010001',
        passwordHash: hashedPassword,
        name: '홍길동',
        role: 'EMPLOYEE',
        employeeId: employee.id,
        companyBizNo: company.bizNo,
      }
    });
    
    console.log('✅ User 계정 생성 완료:');
    console.log(`  User ID: ${user.id}`);
    console.log(`  Phone: ${user.phone}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Employee ID: ${user.employeeId}`);
    console.log(`  Company Biz No: ${user.companyBizNo}`);
    console.log();
    
    // 5. 최종 확인
    console.log('🎉 회원가입 완료!\n');
    console.log('📋 로그인 정보:');
    console.log(`  핸드폰: 010-1001-0001`);
    console.log(`  비밀번호: employee123`);
    console.log();
    console.log('📋 출퇴근 화면 표시 예시:');
    console.log(`  ${company.name} / ${user.name}`);
    console.log();
    console.log('✅ 이제 직원 로그인 페이지(/employee/login)에서 로그인할 수 있습니다!');
    
  } catch (error) {
    console.error('에러:', error);
  } finally {
    await prisma.$disconnect();
  }
}

registerHongGildong();
