import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000';

async function signupEmployee() {
  console.log('📝 홍길동 직원 회원가입 시작...\n');
  
  const signupData = {
    phone: '01010010001',
    password: 'employee123',
    companyBizNo: '2668101215',
    registrationNumber: '850315'
  };
  
  console.log('📤 회원가입 요청 데이터:', signupData);
  
  try {
    const response = await fetch(`${API_URL}/auth/signup/employee`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData)
    });
    
    const text = await response.text();
    console.log(`\n📥 응답 상태: ${response.status}`);
    console.log('📥 응답 내용:', text);
    
    if (response.ok) {
      const result = JSON.parse(text);
      console.log('\n✅ 회원가입 성공!');
      console.log('User ID:', result.user?.id);
      console.log('이름:', result.user?.name);
      console.log('회사:', result.user?.companyBizNo);
    } else {
      console.log('\n❌ 회원가입 실패');
    }
  } catch (error) {
    console.error('❌ 에러:', error.message);
  }
}

signupEmployee();
