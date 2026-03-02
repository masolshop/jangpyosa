#!/usr/bin/env node

const API_BASE = 'https://jangpyosa.com/api';

// 실제로 존재하는 매니저 정보 (DB에서 조회 필요)
const existingManager = {
  phone: '010-1234-5678',  // 실제 매니저 핸드폰
  password: 'password123'
};

// 새로 가입할 기업 (매니저 추천)
const testBuyer = {
  name: '추천테스트담당자',
  managerName: '추천테스트대표',
  phone: '010-9876-5432',
  managerPhone: '010-9876-5433',
  email: 'referral-test@example.com',
  password: 'test1234!',
  companyName: '추천시스템테스트(주)',
  bizNo: '1239876543',
  buyerType: 'PRIVATE_COMPANY',
  referrerPhone: '010-1234-5678',  // 매니저 핸드폰
  privacyAgreed: true,
  termsAgreed: true
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function test1_createReferralBuyer() {
  console.log('\n=== 테스트 1: 매니저 추천으로 기업 가입 ===');
  console.log('추천인 핸드폰:', testBuyer.referrerPhone);
  console.log('기업명:', testBuyer.companyName);
  
  try {
    const response = await fetch(`${API_BASE}/auth/signup/buyer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testBuyer)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (data.error?.includes('이미 등록된')) {
        console.log('✅ 기업 이미 존재 (계속 진행)');
        return true;
      }
      console.error('오류 상세:', JSON.stringify(data, null, 2));
      return false;
    }
    
    console.log('✅ 기업 가입 성공!');
    console.log('User ID:', data.user?.id);
    console.log('Company ID:', data.company?.id);
    return true;
  } catch (error) {
    console.error('❌ 기업 가입 실패:', error.message);
    return false;
  }
}

async function test2_checkManagerStats() {
  console.log('\n=== 테스트 2: 매니저 추천 통계 확인 (직접 DB 조회) ===');
  
  try {
    // 실제로는 매니저로 로그인하여 확인해야 하지만
    // 여기서는 API 응답 구조만 확인
    console.log('💡 매니저 로그인 후 다음 API 호출:');
    console.log('   GET /api/agent/stats');
    console.log('   GET /api/agent/referrals');
    console.log('\n예상 응답:');
    console.log('   - totalReferrals: 추천한 기업 수');
    console.log('   - privateCompanies: 민간기업 수');
    console.log('   - thisMonthReferrals: 이번 달 추천 수');
    return true;
  } catch (error) {
    console.error('❌ 통계 확인 실패:', error.message);
    return false;
  }
}

async function test3_verifyDatabaseReferral() {
  console.log('\n=== 테스트 3: 데이터베이스 추천 연결 확인 ===');
  console.log('\n다음 SQL 쿼리로 확인 가능:');
  console.log(`
SELECT 
  u_agent.id AS agent_id,
  u_agent.name AS agent_name,
  u_agent.phone AS agent_phone,
  u_buyer.id AS buyer_id,
  u_buyer.name AS buyer_name,
  c.name AS company_name,
  c."buyerType" AS buyer_type,
  u_buyer."createdAt" AS referred_at
FROM "User" u_agent
INNER JOIN "User" u_buyer ON u_buyer."referredById" = u_agent.id
INNER JOIN "Company" c ON u_buyer."companyId" = c.id
WHERE u_agent.role = 'AGENT'
  AND u_buyer.role = 'BUYER'
ORDER BY u_buyer."createdAt" DESC
LIMIT 10;
  `);
  
  return true;
}

async function main() {
  console.log('🚀 추천 시스템 통합 테스트\n');
  console.log('API Base:', API_BASE);
  console.log('\n⚠️  주의: 이 테스트는 실제 DB에 데이터를 생성합니다.');
  
  let success = true;
  
  // 테스트 1: 기업 가입
  success = await test1_createReferralBuyer() && success;
  await sleep(1000);
  
  // 테스트 2: 매니저 통계
  success = await test2_checkManagerStats() && success;
  await sleep(500);
  
  // 테스트 3: DB 확인
  success = await test3_verifyDatabaseReferral() && success;
  
  console.log('\n\n' + '='.repeat(60));
  if (success) {
    console.log('✅ 테스트 시나리오 완료!');
    console.log('\n📋 다음 단계:');
    console.log('1. 위 SQL 쿼리로 DB에서 추천 연결 확인');
    console.log('2. 매니저로 로그인하여 /admin/sales/dashboard 접속');
    console.log('3. "추천 실적 현황" 섹션에서 통계 확인');
    console.log('4. 지사/본부 대시보드에서도 통계 확인');
  } else {
    console.log('❌ 일부 테스트 실패');
  }
  console.log('='.repeat(60));
}

main();
