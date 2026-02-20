import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function signupHongAPI() {
  try {
    console.log('\n📝 홍길동 직원 회원가입 API 호출\n');
    
    // 회원가입 데이터
    const signupData = {
      phone: '010-1001-0001',
      password: 'employee123',
      companyBizNo: '2668101215',
      registrationNumber: '850315'
    };
    
    console.log('입력 데이터:');
    console.log(`  핸드폰: ${signupData.phone}`);
    console.log(`  비밀번호: ${signupData.password}`);
    console.log(`  사업자등록번호: ${signupData.companyBizNo}`);
    console.log(`  인증번호 (주민번호 앞자리): ${signupData.registrationNumber}`);
    console.log();
    
    // API 호출
    const response = await fetch('http://localhost:3000/auth/signup/employee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signupData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.log('❌ 회원가입 실패:');
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    
    console.log('✅ 회원가입 성공!\n');
    console.log('응답 데이터:');
    console.log(JSON.stringify(result, null, 2));
    console.log();
    
    // 생성된 User 확인
    const user = await prisma.user.findUnique({
      where: { phone: '01010010001' },
      include: {
        company: true
      }
    });
    
    if (user) {
      console.log('✅ User 계정 확인:');
      console.log(`  User ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Phone: ${user.phone}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Employee ID: ${user.employeeId}`);
      console.log(`  Company: ${user.company?.name || 'N/A'}`);
      console.log();
      
      console.log('📋 로그인 정보:');
      console.log(`  핸드폰: ${user.phone}`);
      console.log(`  비밀번호: employee123`);
      console.log();
      console.log('📋 출퇴근 화면 표시 예시:');
      console.log(`  ${user.company?.name || '회사명'} / ${user.name}`);
    }
    
  } catch (error) {
    console.error('에러:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

signupHongAPI();
