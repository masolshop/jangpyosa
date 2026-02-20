// Update hire dates using raw SQL
const sqlite3 = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../.wrangler/state/v3/d1/miniflare-D1DatabaseObject/c2d4c5de9a72e05cdb92e7b8bb04caf07a1ede8b651ce3c5f1fae8e07c21698f.sqlite');
const db = sqlite3(dbPath);

console.log('\n🔧 Updating hire dates for better incentive distribution...\n');

const employeesToUpdate = [
  { name: '이철수', hireDate: '2024-06-01' },
  { name: '정미라', hireDate: '2024-10-01' },
];

const addedEmployeesPattern = [
  '장민지29',
  '이철수22',
  '박미라23',
  '조재현37',
];

try {
  // Update initial 10 employees
  employeesToUpdate.forEach(emp => {
    const result = db.prepare(`
      UPDATE Employee 
      SET hireDate = ? 
      WHERE name = ?
    `).run(emp.hireDate, emp.name);
    
    console.log(`✅ ${emp.name}: 입사일 변경 → ${emp.hireDate} (${result.changes} rows)`);
  });

  // Update added employees
  addedEmployeesPattern.forEach(name => {
    const result = db.prepare(`
      UPDATE Employee 
      SET hireDate = '2024-12-01' 
      WHERE name = ?
    `).run(name);
    
    if (result.changes > 0) {
      console.log(`✅ ${name}: 입사일 변경 → 2024-12-01`);
    }
  });

  console.log(`\n✅ 입사일 업데이트 완료`);
  console.log(`\n📊 예상 결과 (3월 기준 800명):`);
  console.log(`  - 기준인원: 25명`);
  console.log(`  - 장애인 근로자: 35명`);
  console.log(`  - 기준 초과: 10명 (rank 26~35)`);
  console.log(`  - 제외 인원: 0명 (모두 2024년 이후 입사)`);
  console.log(`  - 장려금 대상: 10명`);
  console.log(`  - 예상 장려금: 약 400만원`);

} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  db.close();
}
