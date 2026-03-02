#!/usr/bin/env node

const API_BASE = 'https://jangpyosa.com/api';

const testBuyer = {
  username: 'referraltest001',
  name: '추천테스트담당자',
  phone: '010-5555-4444',
  password: 'Test1234!',
  email: 'referraltest@test.com',
  managerName: '추천테스트대표',
  managerTitle: '대표이사',
  managerPhone: '010-5555-4445',
  managerEmail: 'ceo@referraltest.com',
  companyName: '추천연동테스트주식회사',
  bizNo: '5554443332',
  buyerType: 'PRIVATE_COMPANY',
  referrerPhone: '010-1234-5678',  // 실제 AGENT 핸드폰
  privacyAgreed: true,
  termsAgreed: true
};

async function main() {
  console.log('🚀 추천 시스템 통합 테스트\n');
  console.log('추천인:', testBuyer.referrerPhone);
  console.log('신규 기업:', testBuyer.companyName, '\n');
  
  try {
    const response = await fetch(`${API_BASE}/auth/signup/buyer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testBuyer)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (data.error?.includes('이미')) {
        console.log('✅ 기업 이미 존재\n');
      } else {
        console.error('❌ 실패:', data.error);
        if (data.details) console.error(JSON.stringify(data.details, null, 2));
        process.exit(1);
      }
    } else {
      console.log('✅ 기업 가입 성공!\n');
      console.log('사용자 ID:', data.user?.id);
      console.log('회사 ID:', data.company?.id);
      console.log('추천인 ID:', data.user?.referredById || '(미연결)');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 추천 통계 확인\n');
    console.log('✅ 다음 SQL 쿼리로 DB 확인:');
    console.log(`
SELECT 
  agent.name AS "매니저",
  agent.phone AS "핸드폰",
  COUNT(buyer.id) AS "추천수",
  STRING_AGG(c.name, ', ') AS "기업목록"
FROM "User" agent
LEFT JOIN "User" buyer ON buyer."referredById" = agent.id
LEFT JOIN "Company" c ON buyer."companyId" = c.id
WHERE agent.role = 'AGENT' AND agent.phone = '${testBuyer.referrerPhone}'
GROUP BY agent.id;
    `);
    
    console.log('✅ 매니저 대시보드에서 확인:');
    console.log('   1. https://jangpyosa.com/admin/sales 접속');
    console.log('   2. 핸드폰: ' + testBuyer.referrerPhone + ' 로 로그인');
    console.log('   3. 대시보드에서 "추천 실적 현황" 확인\n');
    
    console.log('✅ API 직접 호출:');
    console.log('   GET /api/agent/stats (매니저 통계)');
    console.log('   GET /api/agent/referrals (추천 기업 목록)');
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
    process.exit(1);
  }
}

main();
