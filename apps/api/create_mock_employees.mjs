const API_BASE = 'http://localhost:4000';

// 민간기업 계정 (주식회사 페마연)
const LOGIN_CREDENTIALS = {
  identifier: '010-5555-6666',
  password: 'test1234'
};

// 다양한 상황의 목업 직원 10명
const MOCK_EMPLOYEES = [
  {
    name: "김민수",
    registrationNumber: "850315",
    disabilityType: "지체",
    disabilityGrade: "2급",
    severity: "SEVERE",
    gender: "M",
    birthDate: "1985-03-15",
    hireDate: "2020-01-01",
    workHoursPerWeek: 60,
    monthlySalary: 2606200,
    hasEmploymentInsurance: true,
    meetsMinimumWage: true,
    workType: "OFFICE",
    memo: "중증 60시간 - 2배 인정, 사무실 근무"
  },
  {
    name: "박영희",
    registrationNumber: "900520",
    disabilityType: "시각",
    disabilityGrade: "1급",
    severity: "SEVERE",
    gender: "F",
    birthDate: "1990-05-20",
    hireDate: "2021-03-01",
    workHoursPerWeek: 70,
    monthlySalary: 3040900,
    hasEmploymentInsurance: true,
    meetsMinimumWage: true,
    workType: "REMOTE",
    memo: "중증 70시간 - 2배 인정 + 여성장려금, 재택 근무"
  },
  {
    name: "이철수",
    registrationNumber: "880710",
    disabilityType: "청각",
    disabilityGrade: "3급",
    severity: "SEVERE",
    gender: "M",
    birthDate: "1988-07-10",
    hireDate: "2022-06-15",
    workHoursPerWeek: 65,
    monthlySalary: 2823550,
    hasEmploymentInsurance: true,
    meetsMinimumWage: true,
    workType: "HYBRID",
    memo: "중증 65시간 - 2배 인정, 혼합 근무"
  },
  {
    name: "정미라",
    registrationNumber: "920815",
    disabilityType: "정신",
    disabilityGrade: "2급",
    severity: "SEVERE",
    gender: "F",
    birthDate: "1992-08-15",
    hireDate: "2023-01-10",
    workHoursPerWeek: 60,
    monthlySalary: 2606200,
    hasEmploymentInsurance: true,
    meetsMinimumWage: true,
    workType: "OFFICE",
    memo: "중증 60시간 - 2배 인정 + 여성장려금, 사무실 근무"
  },
  {
    name: "최동욱",
    registrationNumber: "870920",
    disabilityType: "지체",
    disabilityGrade: "4급",
    severity: "MILD",
    gender: "M",
    birthDate: "1987-09-20",
    hireDate: "2021-09-01",
    workHoursPerWeek: 60,
    monthlySalary: 2606200,
    hasEmploymentInsurance: true,
    meetsMinimumWage: true,
    workType: "OFFICE",
    memo: "경증 60시간 - 1배 인정, 사무실 근무"
  },
  {
    name: "한수진",
    registrationNumber: "941105",
    disabilityType: "시각",
    disabilityGrade: "5급",
    severity: "MILD",
    gender: "F",
    birthDate: "1994-11-05",
    hireDate: "2023-05-01",
    workHoursPerWeek: 60,
    monthlySalary: 2606200,
    hasEmploymentInsurance: true,
    meetsMinimumWage: true,
    workType: "REMOTE",
    memo: "경증 60시간 - 1배 인정 + 여성장려금, 재택 근무"
  },
  {
    name: "강태민",
    registrationNumber: "860225",
    disabilityType: "청각",
    disabilityGrade: "6급",
    severity: "MILD",
    gender: "M",
    birthDate: "1986-02-25",
    hireDate: "2020-12-01",
    workHoursPerWeek: 60,
    monthlySalary: 2606200,
    hasEmploymentInsurance: true,
    meetsMinimumWage: true,
    workType: "HYBRID",
    memo: "경증 60시간 - 1배 인정, 혼합 근무"
  },
  {
    name: "윤서영",
    registrationNumber: "910330",
    disabilityType: "지적",
    disabilityGrade: "2급",
    severity: "SEVERE",
    gender: "F",
    birthDate: "1991-03-30",
    hireDate: "2022-03-01",
    workHoursPerWeek: 75,
    monthlySalary: 3258250,
    hasEmploymentInsurance: true,
    meetsMinimumWage: true,
    workType: "OFFICE",
    memo: "중증 75시간 - 2배 인정 + 여성장려금 + 고시간, 사무실 근무"
  },
  {
    name: "임재현",
    registrationNumber: "890615",
    disabilityType: "뇌병변",
    disabilityGrade: "1급",
    severity: "SEVERE",
    gender: "M",
    birthDate: "1989-06-15",
    hireDate: "2021-07-01",
    workHoursPerWeek: 80,
    monthlySalary: 3475600,
    hasEmploymentInsurance: true,
    meetsMinimumWage: true,
    workType: "OFFICE",
    memo: "중증 80시간(최대) - 2배 인정 + 고시간, 사무실 근무"
  },
  {
    name: "서민지",
    registrationNumber: "930412",
    disabilityType: "언어",
    disabilityGrade: "4급",
    severity: "MILD",
    gender: "F",
    birthDate: "1993-04-12",
    hireDate: "2023-09-01",
    workHoursPerWeek: 60,
    monthlySalary: 2606200,
    hasEmploymentInsurance: true,
    meetsMinimumWage: true,
    workType: "REMOTE",
    memo: "경증 60시간 - 1배 인정 + 여성장려금, 재택 근무"
  }
];

async function main() {
  try {
    console.log('🔐 1단계: 민간기업 계정 로그인...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(LOGIN_CREDENTIALS)
    });

    if (!loginRes.ok) {
      const error = await loginRes.json();
      throw new Error(`로그인 실패: ${JSON.stringify(error)}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    const companyName = loginData.user.company?.name || '알 수 없음';
    
    console.log(`✅ 로그인 성공: ${companyName}`);
    console.log(`   역할: ${loginData.user.role}`);
    console.log('');

    console.log('👥 2단계: 목업 직원 10명 생성 중...');
    console.log('');

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < MOCK_EMPLOYEES.length; i++) {
      const employee = MOCK_EMPLOYEES[i];
      
      try {
        const res = await fetch(`${API_BASE}/employees`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(employee)
        });

        if (!res.ok) {
          const error = await res.json();
          console.log(`❌ ${i + 1}. ${employee.name} - 실패: ${error.message || error.error}`);
          failCount++;
        } else {
          const data = await res.json();
          console.log(`✅ ${i + 1}. ${employee.name} (${employee.severity === 'SEVERE' ? '중증' : '경증'}, ${employee.gender === 'F' ? '여' : '남'}, 주${employee.workHoursPerWeek}시간) - ${employee.memo}`);
          successCount++;
        }
      } catch (error) {
        console.log(`❌ ${i + 1}. ${employee.name} - 오류: ${error.message}`);
        failCount++;
      }
    }

    console.log('');
    console.log('═══════════════════════════════════════');
    console.log(`📊 최종 결과: 성공 ${successCount}명 / 실패 ${failCount}명`);
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('📈 생성된 직원 구성:');
    console.log('   - 중증 장애인: 6명 (2배 인정)');
    console.log('   - 경증 장애인: 4명 (1배 인정)');
    console.log('   - 여성 장애인: 5명 (여성장려금 추가)');
    console.log('   - 60시간 이상: 10명 전원');
    console.log('   - 70시간 이상: 2명');
    console.log('   - 80시간(최대): 1명');
    console.log('');
    console.log('💡 장려금/보조금 산식 포인트:');
    console.log('   1. 중증 60시간 이상 → 2배 인정 (부담금 감면)');
    console.log('   2. 여성 장애인 → 여성장애인 고용장려금');
    console.log('   3. 다양한 근로시간 → 월 급여 차등 (최저시급 기준)');
    console.log('   4. 고용보험 가입 → 장려금 수급 요건 충족');
    console.log('   5. 최저임금 이상 → 정규직 인정');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

main();
