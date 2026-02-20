// Register 3 employees to different companies
const API_BASE = 'http://localhost:4000';

const employees = [
  {
    company: 'buyer01',
    companyName: '민간기업1',
    employee: {
      name: '홍길동', // 김민수 → 홍길동 개명
      phone: '01010010001',
      registrationNumber: '850315',
      disabilityType: '지체장애',
      disabilityGrade: '2급',
      severity: 'SEVERE',
      gender: 'M',
      birthDate: '1985-03-15',
      hireDate: '2024-06-01',
      workHoursPerWeek: 60,
      monthlySalary: 619200, // 60시간 × 10,320원
      hasEmploymentInsurance: true,
      meetsMinimumWage: true,
      workType: 'OFFICE',
      memo: '김민수에서 홍길동으로 개명'
    }
  },
  {
    company: 'buyer03',
    companyName: '공공기관1',
    employee: {
      name: '박영희',
      phone: '01010010002',
      registrationNumber: '900720',
      disabilityType: '시각장애',
      disabilityGrade: '1급',
      severity: 'SEVERE',
      gender: 'F',
      birthDate: '1990-07-20',
      hireDate: '2024-07-01',
      workHoursPerWeek: 70,
      monthlySalary: 722400, // 70시간 × 10,320원
      hasEmploymentInsurance: true,
      meetsMinimumWage: true,
      workType: 'REMOTE',
      memo: '공공기관 소속'
    }
  },
  {
    company: 'buyer05',
    companyName: '교육청1',
    employee: {
      name: '이철수',
      phone: '01010010003',
      registrationNumber: '881130',
      disabilityType: '청각장애',
      disabilityGrade: '2급',
      severity: 'SEVERE',
      gender: 'M',
      birthDate: '1988-11-30',
      hireDate: '2024-08-01',
      workHoursPerWeek: 65,
      monthlySalary: 670800, // 65시간 × 10,320원
      hasEmploymentInsurance: true,
      meetsMinimumWage: true,
      workType: 'OFFICE',
      memo: '교육청 소속'
    }
  }
];

async function registerEmployees() {
  try {
    console.log('\n🎯 3명의 직원을 각 회사에 등록합니다...\n');

    for (const { company, companyName, employee } of employees) {
      console.log(`📌 ${companyName} (${company})에 ${employee.name} 등록 중...\n`);

      // 1. 회사 로그인
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: company,
          password: 'test1234',
        }),
      });

      if (!loginRes.ok) {
        console.error(`  ❌ ${company} 로그인 실패`);
        continue;
      }

      const loginData = await loginRes.json();
      const token = loginData.accessToken;

      // 2. 직원 등록
      const registerRes = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(employee),
      });

      if (registerRes.ok) {
        console.log(`  ✅ ${employee.name} 등록 성공`);
        console.log(`     - 핸드폰: ${employee.phone}`);
        console.log(`     - 장애: ${employee.disabilityType} ${employee.disabilityGrade}`);
        console.log(`     - 근무시간: 월 ${employee.workHoursPerWeek}시간`);
        console.log(`     - 월급여: ${employee.monthlySalary.toLocaleString()}원\n`);
      } else {
        const error = await registerRes.text();
        console.log(`  ❌ ${employee.name} 등록 실패: ${error}\n`);
      }
    }

    console.log('🎉 모든 직원 등록 완료!\n');
    console.log('📊 등록 결과:');
    console.log('  - 민간기업1 (buyer01): 홍길동 (구 김민수)');
    console.log('  - 공공기관1 (buyer03): 박영희');
    console.log('  - 교육청1 (buyer05): 이철수');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

registerEmployees();
