const fetch = require('node-fetch');

const API_BASE = 'http://localhost:4000';

// 테스트 매니저 계정 3개
const testManagers = [
  {
    name: '김영희',
    phone: '01012345001',
    email: 'kim@jangpyosa.com',
    password: 'manager123',
    rrn1: '900101',
    rrn2: '2345678',
  },
  {
    name: '이철수',
    phone: '01012345002',
    email: 'lee@jangpyosa.com',
    password: 'manager123',
    rrn1: '850505',
    rrn2: '1234567',
  },
  {
    name: '박민수',
    phone: '01012345003',
    email: 'park@jangpyosa.com',
    password: 'manager123',
    rrn1: '920815',
    rrn2: '1987654',
  },
];

async function createManager(manager) {
  try {
    // 1단계: 실명인증
    console.log(`\n🔐 ${manager.name} - 실명인증 중...`);
    const verifyResponse = await fetch(`${API_BASE}/sales/auth/verify-identity-with-name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: manager.name,
        rrn1: manager.rrn1,
        rrn2: manager.rrn2,
      }),
    });

    const verifyData = await verifyResponse.json();
    
    if (!verifyResponse.ok || !verifyData.verified) {
      console.log(`❌ ${manager.name} - 실명인증 실패:`, verifyData.error || verifyData.message);
      return null;
    }

    console.log(`✅ ${manager.name} - 실명인증 완료`);

    // 2단계: 회원가입
    console.log(`📝 ${manager.name} - 회원가입 중...`);
    const signupResponse = await fetch(`${API_BASE}/sales/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: manager.name,
        phone: manager.phone,
        email: manager.email,
        password: manager.password,
        rrn1: manager.rrn1,
        rrn2: manager.rrn2,
        verified: true,
      }),
    });

    const signupData = await signupResponse.json();

    if (!signupResponse.ok) {
      console.log(`❌ ${manager.name} - 회원가입 실패:`, signupData.error);
      return null;
    }

    console.log(`✅ ${manager.name} - 회원가입 완료!`);
    console.log(`   📱 아이디: ${manager.phone}`);
    console.log(`   🔐 비밀번호: ${manager.password}`);
    console.log(`   🔗 추천인 링크: https://jangpyosa.com/${manager.phone}`);
    
    return signupData;
  } catch (error) {
    console.error(`❌ ${manager.name} - 오류:`, error.message);
    return null;
  }
}

async function main() {
  console.log('========================================');
  console.log('🚀 테스트 매니저 계정 3개 생성 시작');
  console.log('========================================');

  const results = [];
  
  for (const manager of testManagers) {
    const result = await createManager(manager);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500)); // 0.5초 대기
  }

  console.log('\n========================================');
  console.log('📊 생성 결과 요약');
  console.log('========================================');
  
  const successCount = results.filter(r => r !== null).length;
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${testManagers.length - successCount}개`);

  console.log('\n📋 생성된 계정 목록:');
  console.log('----------------------------------------');
  testManagers.forEach((manager, index) => {
    if (results[index]) {
      console.log(`${index + 1}. ${manager.name}`);
      console.log(`   아이디: ${manager.phone}`);
      console.log(`   비밀번호: ${manager.password}`);
      console.log(`   이메일: ${manager.email}`);
      console.log(`   역할: MANAGER`);
      console.log(`   로그인: https://jangpyosa.com/admin/sales`);
      console.log('');
    }
  });

  console.log('========================================');
}

main().catch(console.error);
