// Update hire dates through API endpoint
const API_BASE = 'http://localhost:4000';

async function updateHireDates() {
  try {
    console.log('\n🔧 Updating hire dates for better incentive distribution...\n');

    //  1. Login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '01055556666',
        password: 'test1234',
      }),
    });

    if (!loginRes.ok) {
      console.error('❌ Login failed');
      return;
    }

    const { token } = await loginRes.json();
    console.log('✅ Logged in');

    // 2. Get all employees
    const empRes = await fetch(`${API_BASE}/employees`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const employees = await empRes.json();
    console.log(`📊 Total employees: ${employees.length}\n`);

    // 3. Find employees with old hire dates
    const oldEmployees = employees.filter(emp => {
      const hireDate = new Date(emp.hireDate);
      return hireDate < new Date('2024-01-01');
    });

    console.log(`🔍 Found ${oldEmployees.length} employees with old hire dates:\n`);

    // 4. Update each employee
    let updateCount = 0;
    for (const emp of oldEmployees.slice(0, 6)) {  // Update first 6
      const newHireDate = new Date('2024-12-01').toISOString();
      
      const updateRes = await fetch(`${API_BASE}/employees/${emp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...emp,
          hireDate: newHireDate,
        }),
      });

      if (updateRes.ok) {
        console.log(`✅ ${emp.name}: 입사일 변경 → 2024-12-01`);
        updateCount++;
      } else {
        console.log(`❌ ${emp.name}: 업데이트 실패`);
      }
    }

    console.log(`\n✅ ${updateCount}명의 입사일 업데이트 완료`);
    console.log(`\n📊 예상 결과 (3월 기준 800명):`);
    console.log(`  - 기준인원: 25명`);
    console.log(`  - 장애인 근로자: 35명`);
    console.log(`  - 기준 초과: 10명 (rank 26~35)`);
    console.log(`  - 제외 인원: 0명 (모두 2024년 이후 입사)`);
    console.log(`  - 장려금 대상: 10명`);
    console.log(`  - 예상 장려금: 약 400만원`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateHireDates();
