const API_BASE = 'http://localhost:4000';

// 민간기업 계정
const LOGIN_CREDENTIALS = {
  identifier: '010-5555-6666',
  password: 'test1234'
};

async function main() {
  try {
    // 1. 로그인
    console.log("🔐 로그인 중...");
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(LOGIN_CREDENTIALS)
    });

    if (!loginRes.ok) {
      throw new Error(`로그인 실패: ${await loginRes.text()}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    console.log("✅ 로그인 성공\n");

    // 2. 다양한 시나리오로 월별 데이터 설정
    const monthlyEmployeeCounts = {
      1: 1000,  // 장애인 35명 → 장려금 4명
      2: 1000,  // 장애인 35명 → 장려금 4명
      3: 800,   // 의무 25명, 장애인 35명 → 장려금 많이 발생
      4: 1200,  // 의무 37명, 장애인 35명 → 부담금 2명 발생!
      5: 1000,  // 장애인 35명 → 장려금 4명
      6: 1300,  // 의무 40명, 장애인 35명 → 부담금 5명 발생!
      7: 1000,  // 장애인 35명 → 장려금 4명
      8: 1100,  // 의무 34명, 장애인 35명 → 장려금 1명
      9: 1000,  // 장애인 35명 → 장려금 4명
      10: 900,  // 의무 28명, 장애인 35명 → 장려금 7명
      11: 1000, // 장애인 35명 → 장려금 4명
      12: 1000  // 장애인 35명 → 장려금 4명
    };

    console.log("📊 월별 상시근로자 수 설정:\n");
    for (const [month, count] of Object.entries(monthlyEmployeeCounts)) {
      const obligated = Math.floor(count * 0.031);
      const shortfall = Math.max(0, obligated - 35);
      const surplus = Math.max(0, 35 - obligated);
      
      if (shortfall > 0) {
        console.log(`   ${month}월: ${count}명 → 의무 ${obligated}명, 부담금 ${shortfall}명 발생 ⚠️`);
      } else {
        console.log(`   ${month}월: ${count}명 → 의무 ${obligated}명, 장려금 대상 ${35 - Math.ceil(count * 0.031)}명 ✅`);
      }
    }

    // 3. 저장
    console.log("\n💾 데이터 저장 중...");
    const saveRes = await fetch(`${API_BASE}/employees/monthly`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        year: 2026,
        monthlyEmployeeCounts
      })
    });

    if (!saveRes.ok) {
      throw new Error(`저장 실패: ${await saveRes.text()}`);
    }

    console.log("✅ 저장 완료!\n");
    
    console.log("🎉 최적 조건 완성!");
    console.log("   - 4월, 6월: 부담금 발생 (상시근로자 많음)");
    console.log("   - 나머지 월: 장려금 발생 (의무고용 충족)");
    console.log("   - 3월, 10월: 장려금 많이 발생 (상시근로자 적음)");

  } catch (error) {
    console.error("❌ 오류 발생:", error.message);
    process.exit(1);
  }
}

main();
