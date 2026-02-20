// Set monthly employee counts directly
const API_BASE = 'http://localhost:4000';

async function setMonthlyData() {
  try {
    console.log('\n📝 Setting monthly employee counts...\n');

    // 1. Login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'buyer01',
        password: 'test1234',
      }),
    });

    if (!loginRes.ok) {
      const error = await loginRes.text();
      console.error('❌ Login failed:', error);
      return;
    }

    const loginData = await loginRes.json();
    
    if (!loginData.accessToken) {
      console.error('❌ No token in response');
      return;
    }
    
    const token = loginData.accessToken;
    console.log('✅ Logged in\n');

    // 2. Set monthly counts
    const monthlyEmployeeCounts = {
      1: 3000,   // 3000명 → 93명 기준, 35명 장애인 → 0명 장려금
      2: 1500,   // 1500명 → 47명 기준, 35명 장애인 → 0명 장려금
      3: 2000,   // 2000명 → 62명 기준, 35명 장애인 → 0명 장려금
      4: 1800,   // 1800명 → 56명 기준, 35명 장애인 → 0명 장려금
      5: 1000,   // 1000명 → 31명 기준, 35명 장애인 → 4명 장려금
      6: 1300,   // 1300명 → 41명 기준, 35명 장애인 → 5명 부담금
      7: 1000,
      8: 1100,
      9: 1000,
      10: 900,   // 900명 → 28명 기준, 35명 장애인 → 7명 장려금
      11: 1000,
      12: 1000,
    };

    console.log('📊 Monthly employee counts to set:');
    Object.entries(monthlyEmployeeCounts).forEach(([month, count]) => {
      console.log(`  ${month}월: ${count}명`);
    });
    console.log('');

    const saveRes = await fetch(`${API_BASE}/employees/monthly`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        year: 2026,
        monthlyEmployeeCounts,
      }),
    });

    if (!saveRes.ok) {
      const error = await saveRes.text();
      console.error('❌ Save failed:', error);
      return;
    }

    const result = await saveRes.json();
    console.log('✅ ' + result.message);

    // 3. Fetch and display results
    console.log('\n📊 Fetching updated data...\n');

    const dataRes = await fetch(`${API_BASE}/employees/monthly?year=2026`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await dataRes.json();

    console.log('월별 장려금/부담금 결과:\n');
    data.monthlyData.forEach((m) => {
      const incentiveDisplay = m.incentive > 0 
        ? `+${(m.incentive / 10000).toFixed(0)}만원`
        : '0원';
      const levyDisplay = m.levy > 0 
        ? `-${(m.levy / 10000).toFixed(0)}만원`
        : '0원';
      const netDisplay = m.netAmount > 0
        ? `+${(m.netAmount / 10000).toFixed(0)}만원`
        : m.netAmount < 0
        ? `${(m.netAmount / 10000).toFixed(0)}만원`
        : '0원';

      console.log(
        `${m.month}월: 상시 ${m.totalEmployeeCount}명, ` +
        `기준 ${m.incentiveBaselineCount}명, ` +
        `장애인 ${m.disabledCount}명 → ` +
        `장려금 ${incentiveDisplay}, ` +
        `부담금 ${levyDisplay}, ` +
        `순액 ${netDisplay}`
      );
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setMonthlyData();
