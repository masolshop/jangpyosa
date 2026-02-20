// Create employee accounts with proper fields
const API_BASE = 'http://localhost:4000';

const employeeAccounts = [
  {
    phone: '01010010002',
    password: 'employee123',
    name: '박영희',
    companyName: '공공기관1',
    companyBizNo: '3333344444', // buyer03
    registrationNumber: '900720'
  },
  {
    phone: '01010010003',
    password: 'employee123',
    name: '이철수',
    companyName: '교육청1',
    companyBizNo: '5555566666', // buyer05
    registrationNumber: '881130'
  }
];

async function createEmployeeAccounts() {
  try {
    console.log('\n🎯 직원 계정 생성 중...\n');

    for (const account of employeeAccounts) {
      console.log(`📌 ${account.name} (${account.companyName}) 계정 생성...\n`);
      
      const res = await fetch(`${API_BASE}/auth/signup/employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...account,
          privacyAgreed: true
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`  ✅ ${account.name} 계정 생성 성공`);
        console.log(`     - 핸드폰: ${account.phone}`);
        console.log(`     - 비밀번호: ${account.password}`);
        console.log(`     - 회사: ${account.companyName}\n`);
      } else {
        const error = await res.text();
        console.log(`  ❌ ${account.name} 계정 생성 실패: ${error}\n`);
      }
    }

    console.log('🎉 직원 계정 생성 완료!\n');
    console.log('📊 총 3명의 직원 로그인 정보:\n');
    console.log('1️⃣ 홍길동 (민간기업1 - buyer01)');
    console.log('   - 핸드폰: 010-1001-0001');
    console.log('   - 비밀번호: employee123');
    console.log('   - 사업자번호: 1111122222\n');
    
    console.log('2️⃣ 박영희 (공공기관1 - buyer03)');
    console.log('   - 핸드폰: 010-1001-0002');
    console.log('   - 비밀번호: employee123');
    console.log('   - 사업자번호: 3333344444\n');
    
    console.log('3️⃣ 이철수 (교육청1 - buyer05)');
    console.log('   - 핸드폰: 010-1001-0003');
    console.log('   - 비밀번호: employee123');
    console.log('   - 사업자번호: 5555566666\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createEmployeeAccounts();
