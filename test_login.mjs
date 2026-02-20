const API_URL = 'http://localhost:4000';

async function testLogin(identifier, password, userType, expectedSuccess) {
  console.log(`\n🔍 Testing: ${identifier} (${userType})`);
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password, userType })
    });
    
    const data = await response.json();
    
    if (expectedSuccess) {
      if (response.ok && data.accessToken) {
        console.log(`✅ SUCCESS: Logged in as ${data.user.name} (${data.user.role})`);
        if (data.user.company) {
          console.log(`   회사: ${data.user.company.name}`);
          console.log(`   사업자번호: ${data.user.company.bizNo}`);
          console.log(`   기업유형: ${data.user.company.type}`);
        }
      } else {
        console.log(`❌ FAILED: ${data.message || 'Unknown error'}`);
      }
    } else {
      if (!response.ok) {
        console.log(`✅ CORRECTLY REJECTED: ${data.message}`);
      } else {
        console.log(`❌ SHOULD HAVE FAILED but succeeded`);
      }
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
}

async function runTests() {
  console.log('🧪 로그인 테스트 시작...\n');
  
  // 1. 슈퍼어드민 (AGENT로 로그인)
  await testLogin('01012345678', 'admin1234', 'AGENT', true);
  
  // 2. 매니저 (AGENT로 로그인)
  await testLogin('01098765432', 'agent1234', 'AGENT', true);
  
  // 3. 표준사업장 (SUPPLIER로 로그인)
  await testLogin('supplier01', 'test1234', 'SUPPLIER', true);
  
  // 4. 민간기업1 (BUYER로 로그인)
  await testLogin('buyer01', 'test1234', 'BUYER', true);
  
  // 5. 민간기업2 (BUYER로 로그인)
  await testLogin('buyer02', 'test1234', 'BUYER', true);
  
  // 6. 공공기관1 (BUYER로 로그인)
  await testLogin('buyer03', 'test1234', 'BUYER', true);
  
  // 7. 공공기관2 (BUYER로 로그인)
  await testLogin('buyer04', 'test1234', 'BUYER', true);
  
  // 8. 교육청1 (BUYER로 로그인)
  await testLogin('buyer05', 'test1234', 'BUYER', true);
  
  // 9. 지자체1 (BUYER로 로그인)
  await testLogin('buyer06', 'test1234', 'BUYER', true);
  
  // 10. 잘못된 유형으로 로그인 시도 (표준사업장을 BUYER로)
  console.log('\n--- 잘못된 유형 테스트 ---');
  await testLogin('supplier01', 'test1234', 'BUYER', false);
  
  // 11. 잘못된 유형으로 로그인 시도 (민간기업을 SUPPLIER로)
  await testLogin('buyer01', 'test1234', 'SUPPLIER', false);
  
  console.log('\n✅ 모든 테스트 완료!');
}

runTests();
