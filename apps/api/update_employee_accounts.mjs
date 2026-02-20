// Update employee accounts and create new ones
const API_BASE = 'http://localhost:4000';

async function updateEmployeeAccounts() {
  try {
    console.log('\n🔧 직원 계정 업데이트 중...\n');

    // 1. 김민수 → 홍길동 개명 (EMPLOYEE 계정)
    console.log('📌 김민수 → 홍길동 개명...\n');
    
    const updateRes = await fetch(`${API_BASE}/auth/update-employee-name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '01010010001',
        password: 'employee123',
        newName: '홍길동'
      }),
    });

    if (updateRes.ok) {
      console.log('  ✅ 김민수 → 홍길동 개명 완료\n');
    } else {
      console.log('  ⚠️  API 엔드포인트 없음, 스킵\n');
    }

    // 2. 박영희 EMPLOYEE 계정 생성
    console.log('📌 박영희 계정 생성...\n');
    
    const parkRes = await fetch(`${API_BASE}/auth/signup/employee`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '01010010002',
        password: 'employee123',
        name: '박영희',
        companyName: '공공기관1',
        privacyAgreed: true
      }),
    });

    if (parkRes.ok) {
      console.log('  ✅ 박영희 계정 생성 성공\n');
    } else {
      const error = await parkRes.text();
      console.log(`  ❌ 박영희 계정 생성 실패: ${error}\n`);
    }

    // 3. 이철수 EMPLOYEE 계정 생성
    console.log('📌 이철수 계정 생성...\n');
    
    const leeRes = await fetch(`${API_BASE}/auth/signup/employee`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '01010010003',
        password: 'employee123',
        name: '이철수',
        companyName: '교육청1',
        privacyAgreed: true
      }),
    });

    if (leeRes.ok) {
      console.log('  ✅ 이철수 계정 생성 성공\n');
    } else {
      const error = await leeRes.text();
      console.log(`  ❌ 이철수 계정 생성 실패: ${error}\n`);
    }

    console.log('🎉 직원 계정 설정 완료!\n');
    console.log('📊 로그인 정보:');
    console.log('  1. 홍길동 (민간기업1)');
    console.log('     - 핸드폰: 010-1001-0001');
    console.log('     - 비밀번호: employee123');
    console.log('');
    console.log('  2. 박영희 (공공기관1)');
    console.log('     - 핸드폰: 010-1001-0002');
    console.log('     - 비밀번호: employee123');
    console.log('');
    console.log('  3. 이철수 (교육청1)');
    console.log('     - 핸드폰: 010-1001-0003');
    console.log('     - 비밀번호: employee123');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateEmployeeAccounts();
