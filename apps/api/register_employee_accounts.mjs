const API_BASE = 'http://localhost:4000';

// 기업 계정 정보 (buyer01 - 민간1)
const COMPANY_INFO = {
  username: 'buyer01',
  password: 'test1234',
  bizNo: '1111122222' // 민간기업1
};

// 목업 직원 10명 - 회원가입용
const EMPLOYEE_ACCOUNTS = [
  {
    name: "김민수",
    phone: "010-1001-0001",
    password: "employee123",
    registrationNumber: "850315",
    companyBizNo: COMPANY_INFO.bizNo
  },
  {
    name: "박영희",
    phone: "010-1001-0002",
    password: "employee123",
    registrationNumber: "900520",
    companyBizNo: COMPANY_INFO.bizNo
  },
  {
    name: "이철수",
    phone: "010-1001-0003",
    password: "employee123",
    registrationNumber: "880710",
    companyBizNo: COMPANY_INFO.bizNo
  },
  {
    name: "정미라",
    phone: "010-1001-0004",
    password: "employee123",
    registrationNumber: "920815",
    companyBizNo: COMPANY_INFO.bizNo
  },
  {
    name: "최동욱",
    phone: "010-1001-0005",
    password: "employee123",
    registrationNumber: "870920",
    companyBizNo: COMPANY_INFO.bizNo
  },
  {
    name: "한수진",
    phone: "010-1001-0006",
    password: "employee123",
    registrationNumber: "941105",
    companyBizNo: COMPANY_INFO.bizNo
  },
  {
    name: "강태민",
    phone: "010-1001-0007",
    password: "employee123",
    registrationNumber: "860225",
    companyBizNo: COMPANY_INFO.bizNo
  },
  {
    name: "윤서영",
    phone: "010-1001-0008",
    password: "employee123",
    registrationNumber: "910330",
    companyBizNo: COMPANY_INFO.bizNo
  },
  {
    name: "임재현",
    phone: "010-1001-0009",
    password: "employee123",
    registrationNumber: "890615",
    companyBizNo: COMPANY_INFO.bizNo
  },
  {
    name: "서민지",
    phone: "010-1001-0010",
    password: "employee123",
    registrationNumber: "930412",
    companyBizNo: COMPANY_INFO.bizNo
  }
];

async function main() {
  try {
    console.log('🔐 직원 계정 생성 시작...');
    console.log(`   기업: ${COMPANY_INFO.bizNo} (buyer01 - 민간1)`);
    console.log('');

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < EMPLOYEE_ACCOUNTS.length; i++) {
      const employee = EMPLOYEE_ACCOUNTS[i];
      
      try {
        const res = await fetch(`${API_BASE}/auth/signup/employee`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...employee,
            privacyAgreed: true
          })
        });

        const data = await res.json();

        if (!res.ok) {
          console.log(`❌ ${i + 1}. ${employee.name} (${employee.phone}) - 실패: ${data.message || data.error}`);
          failCount++;
        } else {
          console.log(`✅ ${i + 1}. ${employee.name} (${employee.phone}) - 성공`);
          successCount++;
        }
      } catch (error) {
        console.log(`❌ ${i + 1}. ${employee.name} (${employee.phone}) - 오류: ${error.message}`);
        failCount++;
      }
    }

    console.log('');
    console.log('═══════════════════════════════════════');
    console.log(`📊 최종 결과: 성공 ${successCount}명 / 실패 ${failCount}명`);
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('📱 생성된 계정 정보:');
    console.log('   - 핸드폰 번호: 010-1001-0001 ~ 010-1001-0010');
    console.log('   - 비밀번호: employee123 (공통)');
    console.log('   - 역할: EMPLOYEE');
    console.log('');
    console.log('🔑 로그인 테스트:');
    console.log('   1. /employee/login 접속');
    console.log('   2. 핸드폰: 010-1001-0001 (또는 0002~0010)');
    console.log('   3. 비밀번호: employee123');
    console.log('   4. /employee/attendance로 자동 이동');
    console.log('');
    console.log('💡 3중 매칭 검증:');
    console.log('   ✓ 사업자등록번호 → 기업 확인');
    console.log('   ✓ 이름 → 직원 매칭');
    console.log('   ✓ 주민번호 앞자리 → 직원 인증');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

main();
