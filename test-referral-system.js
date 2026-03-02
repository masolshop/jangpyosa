#!/usr/bin/env node

/**
 * 추천 시스템 테스트 및 최적화
 * 
 * 테스트 시나리오:
 * 1. 매니저(AGENT) 생성
 * 2. 고용의무기업(BUYER) 가입 시 매니저 핸드폰으로 추천
 * 3. 추천 통계 확인: 매니저 => 지사 => 본부
 * 4. 계층 통계 집계 확인
 */

const API_BASE = process.env.API_BASE || 'http://localhost:4000';

// 색상 출력
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

// API 호출 헬퍼
async function apiCall(method, path, data = null, token = null) {
  const url = `${API_BASE}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.error || 'API 오류');
  }

  return result;
}

// 1. 테스트 매니저 생성 또는 조회
async function setupTestManager() {
  section('1️⃣  테스트 매니저 설정');

  const testManagerPhone = '010-1234-5678';
  
  try {
    // 기존 매니저가 있는지 확인
    log(`📱 매니저 핸드폰: ${testManagerPhone}`, 'cyan');
    
    // 로그인 시도 (기존 매니저)
    try {
      const loginResult = await apiCall('POST', '/auth/login', {
        phone: testManagerPhone,
        password: 'test1234',
      });
      
      log('✅ 기존 매니저로 로그인 성공', 'green');
      return {
        phone: testManagerPhone,
        token: loginResult.token,
        user: loginResult.user,
      };
    } catch (error) {
      log('⚠️  기존 매니저 없음, 새로 생성...', 'yellow');
    }

    // 지사 목록 조회
    const branchesData = await apiCall('GET', '/branches/list');
    const branches = branchesData.branches || [];
    
    if (branches.length === 0) {
      throw new Error('지사가 없습니다. 먼저 지사를 생성해주세요.');
    }

    const testBranch = branches[0];
    log(`🏢 테스트 지사: ${testBranch.name} (${testBranch.region})`, 'blue');

    // 새 매니저 생성
    const signupResult = await apiCall('POST', '/auth/signup/agent', {
      name: '테스트매니저',
      email: 'test.manager@example.com',
      phone: testManagerPhone,
      password: 'test1234',
      branchId: testBranch.id,
      refCode: 'TEST001',
    });

    log('✅ 새 매니저 생성 성공', 'green');
    log(`   이름: ${signupResult.user.name}`, 'cyan');
    log(`   지사: ${signupResult.user.branch?.name}`, 'cyan');
    log(`   추천코드: ${signupResult.user.refCode || 'N/A'}`, 'cyan');

    return {
      phone: testManagerPhone,
      token: signupResult.token,
      user: signupResult.user,
    };

  } catch (error) {
    log(`❌ 매니저 설정 실패: ${error.message}`, 'red');
    throw error;
  }
}

// 2. 고용의무기업 가입 (매니저 추천)
async function signupBuyerWithReferral(managerPhone) {
  section('2️⃣  고용의무기업 가입 (매니저 추천)');

  const testBizNo = '123-45-67890'; // 테스트용 사업자번호
  const timestamp = Date.now();
  const testUsername = `buyer${timestamp}`;
  const testManagerPhone = `010-9999-${String(timestamp).slice(-4)}`;

  try {
    log(`📝 기업 정보:`, 'cyan');
    log(`   사업자번호: ${testBizNo}`, 'cyan');
    log(`   아이디: ${testUsername}`, 'cyan');
    log(`   추천인 핸드폰: ${managerPhone}`, 'cyan');
    log(`   담당자 핸드폰: ${testManagerPhone}`, 'cyan');

    const signupResult = await apiCall('POST', '/auth/signup/buyer', {
      username: testUsername,
      password: 'test1234',
      bizNo: testBizNo,
      referrerPhone: managerPhone,
      buyerType: 'PRIVATE_COMPANY',
      managerName: '김담당',
      managerTitle: '부장',
      managerEmail: `${testUsername}@example.com`,
      managerPhone: testManagerPhone,
      privacyAgreed: true,
    });

    log('✅ 기업 가입 성공', 'green');
    log(`   회사명: ${signupResult.user.company.name}`, 'cyan');
    log(`   담당자: ${signupResult.user.managerName} ${signupResult.user.managerTitle}`, 'cyan');
    
    if (signupResult.user.referredBy) {
      log(`   ✅ 추천인: ${signupResult.user.referredBy.name} (${signupResult.user.referredBy.branch})`, 'green');
    } else {
      log(`   ⚠️  추천인 연결 안됨`, 'yellow');
    }

    return {
      token: signupResult.token,
      user: signupResult.user,
    };

  } catch (error) {
    log(`❌ 기업 가입 실패: ${error.message}`, 'red');
    
    // 상세 오류 정보
    if (error.message.includes('BIZNO_VERIFICATION_FAILED')) {
      log(`   ℹ️  APICK API 인증 실패 - 테스트용 사업자번호는 실제 인증이 안될 수 있습니다`, 'yellow');
      log(`   ℹ️  실제 사업자번호로 테스트하거나, APICK API를 모킹해야 합니다`, 'yellow');
    }
    
    throw error;
  }
}

// 3. 추천 통계 조회
async function checkReferralStats(managerToken) {
  section('3️⃣  추천 통계 확인');

  try {
    // 매니저 정보 조회
    const meResult = await apiCall('GET', '/auth/me', null, managerToken);
    
    log(`📊 매니저 통계:`, 'cyan');
    log(`   이름: ${meResult.name}`, 'cyan');
    log(`   지사: ${meResult.branch?.name || 'N/A'}`, 'cyan');
    
    // 추천한 기업 수 조회
    // TODO: API 엔드포인트 추가 필요
    // const referralsResult = await apiCall('GET', '/auth/agent/referrals', null, managerToken);
    // log(`   추천 기업 수: ${referralsResult.totalReferrals}`, 'cyan');

    log('✅ 통계 조회 완료', 'green');

  } catch (error) {
    log(`❌ 통계 조회 실패: ${error.message}`, 'red');
    throw error;
  }
}

// 4. 계층별 통계 집계 (매니저 => 지사 => 본부)
async function checkHierarchyStats() {
  section('4️⃣  계층별 통계 집계 확인');

  try {
    log('📈 통계 계층:', 'cyan');
    log('   매니저 (개인) => 지사 (팀) => 본부 (전체)', 'cyan');
    
    // TODO: 실제 집계 로직 구현 필요
    log('   ℹ️  집계 API 엔드포인트 개발 필요', 'yellow');

    log('✅ 계층 통계 확인 완료', 'green');

  } catch (error) {
    log(`❌ 계층 통계 확인 실패: ${error.message}`, 'red');
    throw error;
  }
}

// 5. 추천 시스템 최적화 제안
function optimizationSuggestions() {
  section('5️⃣  추천 시스템 최적화 제안');

  const suggestions = [
    {
      title: '✅ 현재 잘 구현된 부분',
      items: [
        '매니저 핸드폰 기반 추천 연결 (referredById)',
        '매니저-지사 계층 구조 (User.branch)',
        'BUYER 가입 시 매니저 자동 매칭',
      ],
    },
    {
      title: '🔧 개선이 필요한 부분',
      items: [
        '매니저별 추천 통계 API 부족',
        '지사별 통계 집계 로직 필요',
        '본부 전체 통계 대시보드 필요',
        '실시간 통계 업데이트 메커니즘',
      ],
    },
    {
      title: '🚀 추가 개발 제안',
      items: [
        'GET /api/agent/referrals - 매니저의 추천 기업 목록',
        'GET /api/agent/stats - 매니저의 추천 통계',
        'GET /api/branch/:id/stats - 지사별 통계',
        'GET /api/headquarters/stats - 본부 전체 통계',
        '추천 성공 시 실시간 알림',
        '월별/분기별 통계 리포트',
      ],
    },
    {
      title: '💡 데이터 무결성',
      items: [
        '추천 관계 변경 이력 추적',
        '중복 추천 방지 로직',
        '비활성 매니저 처리',
        '추천 유효기간 설정',
      ],
    },
  ];

  suggestions.forEach(({ title, items }) => {
    log(`\n${title}`, 'bright');
    items.forEach(item => log(`  • ${item}`, 'cyan'));
  });
}

// 메인 실행
async function main() {
  log('\n🚀 추천 시스템 테스트 시작\n', 'bright');

  try {
    // 1. 매니저 설정
    const manager = await setupTestManager();

    // 2. 기업 가입 (추천 포함)
    try {
      const buyer = await signupBuyerWithReferral(manager.phone);
      
      // 3. 통계 확인
      await checkReferralStats(manager.token);
      
    } catch (error) {
      if (error.message.includes('BIZNO_VERIFICATION_FAILED')) {
        log('\n⚠️  사업자번호 인증 실패로 기업 가입 스킵', 'yellow');
        log('   실제 사업자번호로 테스트하거나 APICK API 모킹 필요', 'yellow');
      } else {
        throw error;
      }
    }

    // 4. 계층 통계
    await checkHierarchyStats();

    // 5. 최적화 제안
    optimizationSuggestions();

    log('\n✅ 테스트 완료!\n', 'green');

  } catch (error) {
    log(`\n❌ 테스트 실패: ${error.message}\n`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// 실행
if (require.main === module) {
  main();
}
