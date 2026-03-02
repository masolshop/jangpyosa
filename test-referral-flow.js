#!/usr/bin/env node

const API_BASE = 'https://jangpyosa.com/api';

// 테스트 데이터
const testManager = {
  name: '김영업',
  phone: '010-9999-8888',
  email: 'test-manager@example.com',
  password: 'test1234!',
  branchId: '',  // 지사 없이 가입 (나중에 할당)
  privacyAgreed: true,
  termsAgreed: true
};

const testBuyer = {
  name: '박기업',
  managerName: '박대표',
  phone: '010-8888-7777',
  managerPhone: '010-1111-2222',
  email: 'test-buyer@example.com',
  password: 'test1234!',
  companyName: '테스트추천기업',
  bizNo: '9876543210',
  buyerType: 'PRIVATE_COMPANY',
  referrerPhone: '010-9999-8888', // 매니저 핸드폰
  privacyAgreed: true,
  termsAgreed: true
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function step1_createManager() {
  console.log('\n=== Step 1: 매니저 생성 ===');
  console.log('매니저 정보:', testManager);
  
  try {
    // branchId가 빈 문자열이면 제거
    const payload = { ...testManager };
    if (!payload.branchId) {
      delete payload.branchId;
    }
    
    const response = await fetch(`${API_BASE}/auth/signup/agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (data.error?.includes('이미 등록된')) {
        console.log('✅ 매니저 이미 존재 (OK)');
        return testManager.phone;
      }
      console.error('상세 오류:', JSON.stringify(data, null, 2));
      throw new Error(data.error || '매니저 생성 실패');
    }
    
    console.log('✅ 매니저 생성 성공:', data);
    return testManager.phone;
  } catch (error) {
    console.error('❌ 매니저 생성 실패:', error.message);
    throw error;
  }
}

async function step2_createBuyerWithReferral(referrerPhone) {
  console.log('\n=== Step 2: 추천받은 기업 가입 ===');
  console.log('기업 정보:', testBuyer);
  console.log('추천인 핸드폰:', referrerPhone);
  
  try {
    const response = await fetch(`${API_BASE}/auth/signup/buyer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...testBuyer,
        referrerPhone: referrerPhone
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (data.error?.includes('이미 등록된')) {
        console.log('✅ 기업 이미 존재 (OK)');
        return data;
      }
      throw new Error(data.error || '기업 가입 실패');
    }
    
    console.log('✅ 기업 가입 성공:', data);
    console.log('✅ 추천인 연결 완료!');
    return data;
  } catch (error) {
    console.error('❌ 기업 가입 실패:', error.message);
    throw error;
  }
}

async function step3_loginManager() {
  console.log('\n=== Step 3: 매니저 로그인 ===');
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: testManager.phone,
        password: testManager.password
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || '로그인 실패');
    }
    
    console.log('✅ 매니저 로그인 성공');
    console.log('토큰:', data.token?.substring(0, 20) + '...');
    return data.token;
  } catch (error) {
    console.error('❌ 매니저 로그인 실패:', error.message);
    throw error;
  }
}

async function step4_checkManagerStats(token) {
  console.log('\n=== Step 4: 매니저 추천 통계 확인 ===');
  
  try {
    // 방법 1: /api/agent/stats
    console.log('\n[방법 1] GET /api/agent/stats');
    const response1 = await fetch(`${API_BASE}/agent/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response1.ok) {
      const stats1 = await response1.json();
      console.log('✅ 매니저 추천 통계:', JSON.stringify(stats1, null, 2));
    } else {
      const error1 = await response1.json();
      console.log('⚠️  /api/agent/stats 오류:', error1.error);
    }
    
    await sleep(500);
    
    // 방법 2: /api/agent/referrals
    console.log('\n[방법 2] GET /api/agent/referrals');
    const response2 = await fetch(`${API_BASE}/agent/referrals`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response2.ok) {
      const referrals = await response2.json();
      console.log('✅ 매니저 추천 기업 목록:');
      console.log(`   총 ${referrals.pagination?.total || 0}개 기업`);
      referrals.referrals?.forEach((r, i) => {
        console.log(`   ${i+1}. ${r.company?.name || r.name} (${r.company?.buyerType})`);
      });
    } else {
      const error2 = await response2.json();
      console.log('⚠️  /api/agent/referrals 오류:', error2.error);
    }
    
  } catch (error) {
    console.error('❌ 통계 확인 실패:', error.message);
  }
}

async function step5_checkBranchStats(token) {
  console.log('\n=== Step 5: 지사 추천 통계 확인 ===');
  
  try {
    // 먼저 매니저가 속한 지사 정보 확인
    const meResponse = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!meResponse.ok) {
      console.log('⚠️  사용자 정보 조회 실패');
      return;
    }
    
    const meData = await meResponse.json();
    const branchId = meData.branchId;
    
    if (!branchId) {
      console.log('⚠️  매니저가 지사에 소속되어 있지 않습니다');
      return;
    }
    
    console.log(`지사 ID: ${branchId}`);
    
    // 지사 통계 조회
    const response = await fetch(`${API_BASE}/branch/${branchId}/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const branchStats = await response.json();
      console.log('✅ 지사 전체 통계:', JSON.stringify(branchStats, null, 2));
    } else {
      const error = await response.json();
      console.log('⚠️  지사 통계 오류:', error.error);
    }
    
  } catch (error) {
    console.error('❌ 지사 통계 확인 실패:', error.message);
  }
}

async function step6_checkHeadquartersStats(token) {
  console.log('\n=== Step 6: 본부 추천 통계 확인 ===');
  
  try {
    const response = await fetch(`${API_BASE}/headquarters/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const hqStats = await response.json();
      console.log('✅ 본부 전체 통계:', JSON.stringify(hqStats, null, 2));
    } else {
      const error = await response.json();
      console.log('⚠️  본부 통계 오류:', error.error);
      console.log('   (SUPER_ADMIN 권한이 필요할 수 있습니다)');
    }
    
  } catch (error) {
    console.error('❌ 본부 통계 확인 실패:', error.message);
  }
}

async function main() {
  console.log('🚀 추천 시스템 통합 테스트 시작\n');
  console.log('API Base:', API_BASE);
  
  try {
    // Step 1: 매니저 생성
    const managerPhone = await step1_createManager();
    await sleep(1000);
    
    // Step 2: 기업 가입 (매니저 추천)
    await step2_createBuyerWithReferral(managerPhone);
    await sleep(1000);
    
    // Step 3: 매니저 로그인
    const managerToken = await step3_loginManager();
    await sleep(1000);
    
    // Step 4: 매니저 대시보드 통계 확인
    await step4_checkManagerStats(managerToken);
    await sleep(1000);
    
    // Step 5: 지사 대시보드 통계 확인
    await step5_checkBranchStats(managerToken);
    await sleep(1000);
    
    // Step 6: 본부 대시보드 통계 확인
    await step6_checkHeadquartersStats(managerToken);
    
    console.log('\n\n✅ 테스트 완료!');
    console.log('\n📊 확인 사항:');
    console.log('1. 매니저 추천 통계에 기업이 집계되었는가?');
    console.log('2. 기업 유형(민간/공공/정부)이 정확히 분류되었는가?');
    console.log('3. 지사 통계에 매니저 추천이 반영되었는가?');
    console.log('4. 본부 통계에 전체 추천이 반영되었는가?');
    
  } catch (error) {
    console.error('\n❌ 테스트 실패:', error.message);
    process.exit(1);
  }
}

main();
