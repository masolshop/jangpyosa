// Login and get March details
const API_BASE = 'http://localhost:4000';

async function getMarchDetails() {
  try {
    // 1. Login
    console.log('🔐 Logging in...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'buyer01',
        password: 'test1234',
      }),
    });

    const loginData = await loginRes.json();
    if (!loginData.token) {
      console.error('❌ Login failed');
      return;
    }

    const token = loginData.token;
    console.log('✅ Login successful\n');

    // 2. Get monthly data
    console.log('📊 Fetching monthly data...');
    const monthlyRes = await fetch(`${API_BASE}/employees/monthly?year=2026`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const monthlyData = await monthlyRes.json();
    
    // 3. Find March data
    const march = monthlyData.monthlyData.find(m => m.month === 3);
    
    if (!march) {
      console.error('❌ March data not found');
      return;
    }

    console.log(`\n📌 March 2026 Calculation Summary:`);
    console.log(`  - Total employees: ${march.totalEmployeeCount}`);
    console.log(`  - Disabled employees: ${march.disabledCount}`);
    console.log(`  - Baseline count (올림): ${march.incentiveBaselineCount}`);
    console.log(`  - Excluded count: ${march.incentiveExcludedCount}`);
    console.log(`  - Eligible count: ${march.incentiveEligibleCount}`);
    console.log(`  - Total incentive: ${march.incentive?.toLocaleString()} 원\n`);

    // 4. Analyze details
    console.log(`📋 Employee Details (total: ${march.details.length}):\n`);

    let withinBaseline = 0;
    let excludedInsurance = 0;
    let excludedWage = 0;
    let excludedPeriod = 0;
    let eligible = 0;

    march.details.forEach((emp, index) => {
      const reasons = [];
      
      if (emp.isWithinBaseline) {
        withinBaseline++;
        reasons.push('기준인원 이내');
      } else if (!emp.hasEmploymentInsurance) {
        excludedInsurance++;
        reasons.push('🚫 고용보험 미가입');
      } else if (!emp.meetsMinimumWage) {
        excludedWage++;
        reasons.push('🚫 최저임금 미만');
      } else if (emp.monthsWorked > (emp.severity === 'SEVERE' ? 24 : 12)) {
        excludedPeriod++;
        reasons.push(`🚫 지원기간 초과 (${emp.monthsWorked}개월)`);
      } else {
        eligible++;
        reasons.push('✅ 지급 대상');
      }

      console.log(
        `${(index + 1).toString().padStart(2)}. ${emp.employeeName?.padEnd(10)} | ` +
        `${emp.severity?.padEnd(7)} | ` +
        `rank: ${emp.rank?.toString().padStart(2)} | ` +
        `근무: ${emp.monthsWorked?.toString().padStart(2)}개월 | ` +
        `보험: ${emp.hasEmploymentInsurance ? 'O' : 'X'} | ` +
        `최저: ${emp.meetsMinimumWage ? 'O' : 'X'} | ` +
        `${reasons.join(', ')}`
      );
    });

    console.log(`\n📊 Category Summary:`);
    console.log(`  - Within baseline (기준인원 이내): ${withinBaseline}`);
    console.log(`  - Excluded - Insurance (고용보험 미가입): ${excludedInsurance}`);
    console.log(`  - Excluded - Wage (최저임금 미만): ${excludedWage}`);
    console.log(`  - Excluded - Period (지원기간 초과): ${excludedPeriod}`);
    console.log(`  - Eligible (지급 대상): ${eligible}`);

    console.log(`\n✅ Formula verification:`);
    console.log(`  ${march.disabledCount} (total) - ${march.incentiveBaselineCount} (baseline) - ${march.incentiveExcludedCount} (excluded) = ${march.incentiveEligibleCount} (eligible)`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getMarchDetails();
