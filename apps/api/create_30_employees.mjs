const API_BASE = 'http://localhost:4000';

// 민간기업 계정
const LOGIN_CREDENTIALS = {
  identifier: '010-5555-6666',
  password: 'test1234'
};

// 30명의 목업 직원 생성
function generateEmployees() {
  const employees = [];
  const firstNames = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임"];
  const lastNames = ["민수", "영희", "철수", "미라", "동욱", "수진", "태민", "서영", "재현", "민지"];
  
  for (let i = 0; i < 30; i++) {
    const isSevere = i < 20; // 20명 중증, 10명 경증
    const isFemale = i % 3 === 0; // 1/3은 여성
    const workHours = i < 25 ? 60 : 70; // 대부분 60시간, 일부 70시간
    
    const year = 1980 + (i % 15);
    const month = String(1 + (i % 12)).padStart(2, '0');
    const day = String(1 + (i % 28)).padStart(2, '0');
    const registrationNumber = `${year.toString().slice(2)}${month}${day}`;
    const birthDate = `${year}-${month}-${day}`;
    
    const hireYear = 2018 + (i % 7);
    const hireMonth = String(1 + (i % 12)).padStart(2, '0');
    const hireDate = `${hireYear}-${hireMonth}-01`;
    
    const disabilityTypes = ["지체", "시각", "청각", "정신", "지적", "뇌병변", "언어"];
    const workTypes = ["OFFICE", "REMOTE", "HYBRID"];
    
    const monthlySalary = isSevere && workHours >= 60 ? 2606200 : 2606200;
    
    employees.push({
      name: `${firstNames[i % 10]}${lastNames[(i + Math.floor(i/10)) % 10]}${i+11}`,
      registrationNumber: registrationNumber,
      disabilityType: disabilityTypes[i % 7],
      disabilityGrade: isSevere ? `${1 + (i % 3)}급` : `${4 + (i % 3)}급`,
      severity: isSevere ? "SEVERE" : "MILD",
      gender: isFemale ? "F" : "M",
      birthDate: birthDate,
      hireDate: hireDate,
      workHoursPerWeek: workHours,
      monthlySalary: monthlySalary,
      hasEmploymentInsurance: true,
      meetsMinimumWage: true,
      workType: workTypes[i % 3],
      memo: `${isSevere ? '중증' : '경증'} ${workHours}시간 - ${isSevere ? '2배' : '1배'} 인정${isFemale ? ' + 여성장려금' : ''}`
    });
  }
  
  return employees;
}

async function main() {
  try {
    // 1단계: 민간기업 계정 로그인
    console.log("🔐 1단계: 민간기업 계정 로그인...");
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(LOGIN_CREDENTIALS)
    });

    if (!loginRes.ok) {
      const error = await loginRes.text();
      throw new Error(`로그인 실패: ${error}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    console.log("✅ 로그인 성공");

    // 2단계: 30명의 직원 등록
    console.log("\n📝 2단계: 30명의 장애인 직원 등록...");
    const employees = generateEmployees();
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      try {
        const res = await fetch(`${API_BASE}/employees`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(emp)
        });

        if (!res.ok) {
          const error = await res.text();
          console.log(`❌ ${i + 1}. ${emp.name} 등록 실패: ${error}`);
          failCount++;
        } else {
          console.log(`✅ ${i + 1}. ${emp.name} 등록 성공 (${emp.severity}, ${emp.gender}, ${emp.workHoursPerWeek}h)`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ ${i + 1}. ${emp.name} 등록 중 오류:`, err.message);
        failCount++;
      }
    }

    console.log(`\n📊 등록 완료: 성공 ${successCount}명, 실패 ${failCount}명`);
    
  } catch (error) {
    console.error("❌ 스크립트 실행 중 오류:", error.message);
    process.exit(1);
  }
}

main();
