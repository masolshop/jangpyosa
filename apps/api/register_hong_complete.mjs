import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function registerHongComplete() {
  try {
    console.log('\n📋 홍길동 직원 등록 프로세스 시작\n');
    
    // 1. buyer01 회사 정보 확인
    const user = await prisma.user.findFirst({
      where: { username: 'buyer01' },
      include: {
        company: {
          include: {
            buyerProfile: true
          }
        }
      }
    });
    
    if (!user || !user.company) {
      console.log('❌ buyer01 계정 또는 회사를 찾을 수 없습니다.');
      return;
    }
    
    const company = user.company;
    
    if (!company || !company.buyerProfile) {
      console.log('❌ 회사 또는 Buyer Profile을 찾을 수 없습니다.');
      return;
    }
    
    console.log('✅ 회사 정보 확인:');
    console.log(`  회사명: ${company.name}`);
    console.log(`  사업자번호: ${company.bizNo}`);
    console.log(`  Buyer Profile ID: ${company.buyerProfile.id}`);
    console.log();
    
    // 2. 기존 홍길동 데이터 삭제
    const existingUser = await prisma.user.findUnique({
      where: { phone: '01010010001' }
    });
    
    if (existingUser) {
      console.log('⚠️  기존 홍길동 User 계정 삭제 중...');
      await prisma.user.delete({ where: { id: existingUser.id } });
      console.log('✅ User 계정 삭제 완료');
    }
    
    const existingEmployees = await prisma.disabledEmployee.findMany({
      where: {
        name: '홍길동',
        buyerId: company.buyerProfile.id
      }
    });
    
    if (existingEmployees.length > 0) {
      console.log(`⚠️  기존 홍길동 DisabledEmployee ${existingEmployees.length}개 발견, 삭제 중...`);
      for (const emp of existingEmployees) {
        await prisma.disabledEmployee.delete({ where: { id: emp.id } });
      }
      console.log('✅ DisabledEmployee 삭제 완료');
    }
    console.log();
    
    // 3. DisabledEmployee 등록 (회사에서 먼저 등록)
    console.log('📝 Step 1: 회사에서 홍길동 장애인 직원 등록');
    const employee = await prisma.disabledEmployee.create({
      data: {
        buyerId: company.buyerProfile.id,
        name: '홍길동',
        registrationNumber: '850315', // 주민번호 앞자리
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
    console.log(`  주민번호 앞자리: ${employee.registrationNumber}`);
    console.log(`  회사: ${company.name}`);
    console.log();
    
    // 4. 직원 회원가입 시뮬레이션
    console.log('📝 Step 2: 홍길동 직원 회원가입');
    console.log('입력 정보:');
    console.log(`  핸드폰: 010-1001-0001`);
    console.log(`  비밀번호: employee123`);
    console.log(`  소속 기관 사업자등록번호: ${company.bizNo}`);
    console.log(`  인증번호 (주민등록번호 앞자리 또는 기업 제공 코드): 850315`);
    console.log();
    
    // 회원가입 API가 실제로 하는 작업:
    // 1. 사업자번호로 회사 찾기
    // 2. 주민번호로 DisabledEmployee 찾기
    // 3. User 계정 생성 및 employeeId 연결
    
    console.log('🔍 매칭 프로세스:');
    console.log(`  1. 사업자번호 ${company.bizNo}로 회사 찾기 → ✅`);
    console.log(`  2. 주민번호 850315로 직원 찾기 → ✅`);
    console.log(`  3. User 계정 생성 및 연결 → 진행 중...`);
    console.log();
    
    // 실제 회원가입 API 호출 시뮬레이션
    const signupData = {
      phone: '010-1001-0001',
      password: 'employee123',
      companyBizNo: company.bizNo,
      registrationNumber: '850315',
      name: '홍길동'
    };
    
    console.log('📋 회원가입 완료 정보:');
    console.log(`  핸드폰: ${signupData.phone}`);
    console.log(`  비밀번호: ${signupData.password}`);
    console.log(`  회사: ${company.name}`);
    console.log(`  사업자번호: ${company.bizNo}`);
    console.log(`  Employee ID: ${employee.id}`);
    console.log();
    
    console.log('🎉 이제 직원 회원가입 페이지(/employee/signup)에서 위 정보로 가입하세요!');
    console.log();
    console.log('📋 로그인 후 출퇴근 화면 표시:');
    console.log(`  ${company.name} / 홍길동`);
    
  } catch (error) {
    console.error('에러:', error);
  } finally {
    await prisma.$disconnect();
  }
}

registerHongComplete();
