// Update work hours from 59 to 60 for all employees
const API_BASE = 'http://localhost:4000';

async function updateWorkHours() {
  try {
    console.log('\n🔧 Updating work hours from 59 to 60...\n');

    // Update for buyer03 (공공기관1)
    console.log('📌 Updating 공공기관1 employees...\n');

    const login03Res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'buyer03',
        password: 'test1234',
      }),
    });

    if (!login03Res.ok) {
      console.error('❌ buyer03 login failed');
      return;
    }

    const login03Data = await login03Res.json();
    const token03 = login03Data.accessToken;

    // Get all employees
    const emp03Res = await fetch(`${API_BASE}/employees`, {
      headers: { Authorization: `Bearer ${token03}` },
    });

    const emp03Data = await emp03Res.json();
    const employees03 = Array.isArray(emp03Data) ? emp03Data : emp03Data.employees || [];
    const employees59 = employees03.filter(emp => emp.workHoursPerWeek === 59);

    console.log(`Found ${employees59.length} employees with 59 hours\n`);

    let updateCount03 = 0;
    for (const emp of employees59) {
      const updateRes = await fetch(`${API_BASE}/employees/${emp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token03}`,
        },
        body: JSON.stringify({
          ...emp,
          workHoursPerWeek: 60,
          monthlySalary: 619200, // 60시간 × 10,320원
        }),
      });

      if (updateRes.ok) {
        console.log(`  ✅ ${emp.name}: 59시간 → 60시간`);
        updateCount03++;
      } else {
        console.log(`  ❌ ${emp.name}: 업데이트 실패`);
      }
    }

    console.log(`\n공공기관1: ${updateCount03}명 업데이트 완료\n`);

    // Update for buyer05 (교육청1)
    console.log('📌 Updating 교육청1 employees...\n');

    const login05Res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'buyer05',
        password: 'test1234',
      }),
    });

    if (!login05Res.ok) {
      console.error('❌ buyer05 login failed');
      return;
    }

    const login05Data = await login05Res.json();
    const token05 = login05Data.accessToken;

    // Get all employees
    const emp05Res = await fetch(`${API_BASE}/employees`, {
      headers: { Authorization: `Bearer ${token05}` },
    });

    const emp05Data = await emp05Res.json();
    const employees05 = Array.isArray(emp05Data) ? emp05Data : emp05Data.employees || [];
    const employees59_05 = employees05.filter(emp => emp.workHoursPerWeek === 59);

    console.log(`Found ${employees59_05.length} employees with 59 hours\n`);

    let updateCount05 = 0;
    for (const emp of employees59_05) {
      const updateRes = await fetch(`${API_BASE}/employees/${emp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token05}`,
        },
        body: JSON.stringify({
          ...emp,
          workHoursPerWeek: 60,
          monthlySalary: 619200, // 60시간 × 10,320원
        }),
      });

      if (updateRes.ok) {
        console.log(`  ✅ ${emp.name}: 59시간 → 60시간`);
        updateCount05++;
      } else {
        console.log(`  ❌ ${emp.name}: 업데이트 실패`);
      }
    }

    console.log(`\n교육청1: ${updateCount05}명 업데이트 완료\n`);

    // Update for buyer01 (민간기업1)
    console.log('📌 Updating 민간기업1 employees...\n');

    const login01Res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'buyer01',
        password: 'test1234',
      }),
    });

    if (!login01Res.ok) {
      console.error('❌ buyer01 login failed');
      return;
    }

    const login01Data = await login01Res.json();
    const token01 = login01Data.accessToken;

    // Get all employees
    const emp01Res = await fetch(`${API_BASE}/employees`, {
      headers: { Authorization: `Bearer ${token01}` },
    });

    const emp01Data = await emp01Res.json();
    const employees01 = Array.isArray(emp01Data) ? emp01Data : emp01Data.employees || [];
    const employees59_01 = employees01.filter(emp => emp.workHoursPerWeek === 59);

    console.log(`Found ${employees59_01.length} employees with 59 hours\n`);

    let updateCount01 = 0;
    for (const emp of employees59_01) {
      const updateRes = await fetch(`${API_BASE}/employees/${emp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token01}`,
        },
        body: JSON.stringify({
          ...emp,
          workHoursPerWeek: 60,
          monthlySalary: 619200, // 60시간 × 10,320원
        }),
      });

      if (updateRes.ok) {
        console.log(`  ✅ ${emp.name}: 59시간 → 60시간`);
        updateCount01++;
      } else {
        console.log(`  ❌ ${emp.name}: 업데이트 실패`);
      }
    }

    console.log(`\n민간기업1: ${updateCount01}명 업데이트 완료\n`);

    console.log('🎉 모든 근무시간 업데이트 완료!');
    console.log(`\n📊 총 ${updateCount03 + updateCount05 + updateCount01}명 업데이트`);
    console.log('  - 공공기관1: ' + updateCount03 + '명');
    console.log('  - 교육청1: ' + updateCount05 + '명');
    console.log('  - 민간기업1: ' + updateCount01 + '명');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateWorkHours();
