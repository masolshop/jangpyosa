#!/usr/bin/env node

const API_BASE = 'https://jangpyosa.com/api';

// 새로 가입할 기업 (완전한 필드)
const testBuyer = {
  // 사용자 정보
  username: 'referral-test-user',
  name: '추천테스트담당자',
  phone: '010-7777-6666',
  password: 'Test1234!',
  email: 'referral-full@example.com',
  
  // 담당자 정보
  managerName: '추천테스트대표',
  managerTitle: '대표이사',
  managerPhone: '010-7777-6667',
  managerEmail: 'ceo@referral-test.com',
  
  // 회사 정보
  companyName: '추천연동테스트(주)',
  bizNo: '9998887776',
  buyerType: 'PRIVATE_COMPANY',
  
  // 추천인 (실제 존재하는 AGENT의 핸드폰)
  referrerPhone: '010-1234-5678',
  
  // 약관 동의
  privacyAgreed: true,
  termsAgreed: true
};

async function testReferralSignup() {
  console.log('🚀 추천 시스템 테스트\n');
  console.log('API:', API_BASE);
  console.log('추천인 핸드폰:', testBuyer.referrerPhone);
  console.log('가입 기업명:', testBuyer.companyName);
  console.log('\n');
  
  try {
    const response = await fetch(`${API_BASE}/auth/signup/buyer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testBuyer)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (data.error?.includes('이미 등록된')) {
        console.log('✅ 기업 이미 존재 (테스트용 데이터 재사용 가능)\n');
      } else {
        console.error('❌ 가입 실패:', data.error);
        if (data.details) {
          console.error('상세:', JSON.stringify(data.details, null, 2));
        }
        return;
      }
    } else {
      console.log('✅ 기업 가입 성공!\n');
      console.log('User ID:', data.user?.id);
      console.log('Company ID:', data.company?.id);
      if (data.user?.referredById) {
        console.log('✅ 추천인 연결 성공! referredById:', data.user.referredById);
      } else {
        console.log('⚠️  추천인 미연결 (referredById가 null)');
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 추천 통계 확인 방법\n');
    console.log('1. DB에서 직접 확인:');
    console.log(`
SELECT 
  u_agent.name AS "매니저명",
  u_agent.phone AS "매니저 핸드폰",
  COUNT(u_buyer.id) AS "추천 기업 수",
  STRING_AGG(c.name, ', ') AS "추천 기업 목록"
FROM "User" u_agent
LEFT JOIN "User" u_buyer ON u_buyer."referredById" = u_agent.id AND u_buyer.role = 'BUYER'
LEFT JOIN "Company" c ON u_buyer."companyId" = c.id
WHERE u_agent.role = 'AGENT' AND u_agent.phone = '${testBuyer.referrerPhone}'
GROUP BY u_agent.id, u_agent.name, u_agent.phone;
    `);
    
    console.log('2. 매니저 대시보드에서 확인:');
    console.log('   - 매니저 로그인: /admin/sales (핸드폰: ${testBuyer.referrerPhone})');
    console.log('   - 대시보드 접속: /admin/sales/dashboard');
    console.log('   - "추천 실적 현황" 섹션 확인');
    console.log('');
    console.log('3. API로 확인:');
    console.log('   GET /api/agent/stats');
    console.log('   GET /api/agent/referrals');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

testReferralSignup();
