// Create mock employees for buyer03 (공공기관1) and buyer05 (교육청1)
const API_BASE = 'http://localhost:4000';

// Mock employee data
const buyer03Employees = [
  // 30명의 장애인 직원 생성
  // 중증 15명 (60시간 미만 → 1명 인정)
  { name: '김공무원01', registrationNumber: '800101', disabilityType: '지체장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'M', birthDate: '1980-01-01', hireDate: '2024-06-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '이서연02', registrationNumber: '850215', disabilityType: '시각장애', disabilityGrade: '1급', severity: 'SEVERE', gender: 'F', birthDate: '1985-02-15', hireDate: '2024-07-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'REMOTE' },
  { name: '박민수03', registrationNumber: '780320', disabilityType: '청각장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'M', birthDate: '1978-03-20', hireDate: '2024-08-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '정수진04', registrationNumber: '820505', disabilityType: '지적장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'F', birthDate: '1982-05-05', hireDate: '2024-09-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '최동욱05', registrationNumber: '900712', disabilityType: '지체장애', disabilityGrade: '1급', severity: 'SEVERE', gender: 'M', birthDate: '1990-07-12', hireDate: '2024-10-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '한미라06', registrationNumber: '880825', disabilityType: '뇌병변장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'F', birthDate: '1988-08-25', hireDate: '2024-11-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '강태민07', registrationNumber: '920930', disabilityType: '신장장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'M', birthDate: '1992-09-30', hireDate: '2024-12-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '윤서영08', registrationNumber: '861105', disabilityType: '심장장애', disabilityGrade: '1급', severity: 'SEVERE', gender: 'F', birthDate: '1986-11-05', hireDate: '2025-01-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '임재현09', registrationNumber: '790210', disabilityType: '호흡기장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'M', birthDate: '1979-02-10', hireDate: '2025-02-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '서민지10', registrationNumber: '940415', disabilityType: '간장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'F', birthDate: '1994-04-15', hireDate: '2025-03-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '조영호11', registrationNumber: '830520', disabilityType: '안면장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'M', birthDate: '1983-05-20', hireDate: '2025-04-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '장수연12', registrationNumber: '910625', disabilityType: '장루요루장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'F', birthDate: '1991-06-25', hireDate: '2025-05-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '오민수13', registrationNumber: '870730', disabilityType: '뇌전증장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'M', birthDate: '1987-07-30', hireDate: '2025-06-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '신혜진14', registrationNumber: '950905', disabilityType: '지체장애', disabilityGrade: '1급', severity: 'SEVERE', gender: 'F', birthDate: '1995-09-05', hireDate: '2025-07-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '권동욱15', registrationNumber: '840110', disabilityType: '시각장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'M', birthDate: '1984-01-10', hireDate: '2025-08-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  
  // 경증 15명 (60시간 → 1명 인정)
  { name: '배수진16', registrationNumber: '890315', disabilityType: '지체장애', disabilityGrade: '5급', severity: 'MILD', gender: 'F', birthDate: '1989-03-15', hireDate: '2025-01-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '홍철수17', registrationNumber: '920420', disabilityType: '청각장애', disabilityGrade: '4급', severity: 'MILD', gender: 'M', birthDate: '1992-04-20', hireDate: '2025-02-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '남정아18', registrationNumber: '860525', disabilityType: '언어장애', disabilityGrade: '4급', severity: 'MILD', gender: 'F', birthDate: '1986-05-25', hireDate: '2025-03-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '송민호19', registrationNumber: '940630', disabilityType: '지체장애', disabilityGrade: '5급', severity: 'MILD', gender: 'M', birthDate: '1994-06-30', hireDate: '2025-04-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '고은영20', registrationNumber: '880805', disabilityType: '지적장애', disabilityGrade: '3급', severity: 'MILD', gender: 'F', birthDate: '1988-08-05', hireDate: '2025-05-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '문태양21', registrationNumber: '910910', disabilityType: '자폐성장애', disabilityGrade: '3급', severity: 'MILD', gender: 'M', birthDate: '1991-09-10', hireDate: '2025-06-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '노지혜22', registrationNumber: '871015', disabilityType: '지체장애', disabilityGrade: '4급', severity: 'MILD', gender: 'F', birthDate: '1987-10-15', hireDate: '2025-07-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '도준혁23', registrationNumber: '931120', disabilityType: '시각장애', disabilityGrade: '5급', severity: 'MILD', gender: 'M', birthDate: '1993-11-20', hireDate: '2025-08-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '류미선24', registrationNumber: '851225', disabilityType: '청각장애', disabilityGrade: '5급', severity: 'MILD', gender: 'F', birthDate: '1985-12-25', hireDate: '2025-09-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '마상준25', registrationNumber: '900130', disabilityType: '신장장애', disabilityGrade: '4급', severity: 'MILD', gender: 'M', birthDate: '1990-01-30', hireDate: '2025-10-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '사윤아26', registrationNumber: '920305', disabilityType: '심장장애', disabilityGrade: '4급', severity: 'MILD', gender: 'F', birthDate: '1992-03-05', hireDate: '2025-11-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '아민재27', registrationNumber: '880410', disabilityType: '호흡기장애', disabilityGrade: '5급', severity: 'MILD', gender: 'M', birthDate: '1988-04-10', hireDate: '2025-12-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '자혜리28', registrationNumber: '940515', disabilityType: '간장애', disabilityGrade: '4급', severity: 'MILD', gender: 'F', birthDate: '1994-05-15', hireDate: '2026-01-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '차진우29', registrationNumber: '860620', disabilityType: '안면장애', disabilityGrade: '4급', severity: 'MILD', gender: 'M', birthDate: '1986-06-20', hireDate: '2026-01-15', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '카민지30', registrationNumber: '910725', disabilityType: '장루요루장애', disabilityGrade: '5급', severity: 'MILD', gender: 'F', birthDate: '1991-07-25', hireDate: '2026-02-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
];

const buyer05Employees = [
  // 28명의 장애인 직원 생성
  // 중증 14명 (60시간 미만 → 1명 인정)
  { name: '김교사01', registrationNumber: '750101', disabilityType: '지체장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'M', birthDate: '1975-01-01', hireDate: '2024-06-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '이선생02', registrationNumber: '800215', disabilityType: '시각장애', disabilityGrade: '1급', severity: 'SEVERE', gender: 'F', birthDate: '1980-02-15', hireDate: '2024-07-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'REMOTE' },
  { name: '박교육03', registrationNumber: '730320', disabilityType: '청각장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'M', birthDate: '1973-03-20', hireDate: '2024-08-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '정교감04', registrationNumber: '770505', disabilityType: '지적장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'F', birthDate: '1977-05-05', hireDate: '2024-09-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '최교장05', registrationNumber: '850712', disabilityType: '지체장애', disabilityGrade: '1급', severity: 'SEVERE', gender: 'M', birthDate: '1985-07-12', hireDate: '2024-10-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '한수석06', registrationNumber: '830825', disabilityType: '뇌병변장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'F', birthDate: '1983-08-25', hireDate: '2024-11-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '강주무07', registrationNumber: '870930', disabilityType: '신장장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'M', birthDate: '1987-09-30', hireDate: '2024-12-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '윤사무08', registrationNumber: '811105', disabilityType: '심장장애', disabilityGrade: '1급', severity: 'SEVERE', gender: 'F', birthDate: '1981-11-05', hireDate: '2025-01-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '임행정09', registrationNumber: '740210', disabilityType: '호흡기장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'M', birthDate: '1974-02-10', hireDate: '2025-02-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '서기획10', registrationNumber: '890415', disabilityType: '간장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'F', birthDate: '1989-04-15', hireDate: '2025-03-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '조재정11', registrationNumber: '780520', disabilityType: '안면장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'M', birthDate: '1978-05-20', hireDate: '2025-04-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '장총무12', registrationNumber: '860625', disabilityType: '장루요루장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'F', birthDate: '1986-06-25', hireDate: '2025-05-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '오서기13', registrationNumber: '820730', disabilityType: '뇌전증장애', disabilityGrade: '2급', severity: 'SEVERE', gender: 'M', birthDate: '1982-07-30', hireDate: '2025-06-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '신관리14', registrationNumber: '900905', disabilityType: '지체장애', disabilityGrade: '1급', severity: 'SEVERE', gender: 'F', birthDate: '1990-09-05', hireDate: '2025-07-01', workHoursPerWeek: 59, monthlySalary: 609000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  
  // 경증 14명 (60시간 → 1명 인정)
  { name: '권직원15', registrationNumber: '840315', disabilityType: '지체장애', disabilityGrade: '5급', severity: 'MILD', gender: 'M', birthDate: '1984-03-15', hireDate: '2025-01-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '배보조16', registrationNumber: '910420', disabilityType: '청각장애', disabilityGrade: '4급', severity: 'MILD', gender: 'F', birthDate: '1991-04-20', hireDate: '2025-02-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '홍실무17', registrationNumber: '810525', disabilityType: '언어장애', disabilityGrade: '4급', severity: 'MILD', gender: 'M', birthDate: '1981-05-25', hireDate: '2025-03-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '남사원18', registrationNumber: '890630', disabilityType: '지체장애', disabilityGrade: '5급', severity: 'MILD', gender: 'F', birthDate: '1989-06-30', hireDate: '2025-04-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '송담당19', registrationNumber: '830805', disabilityType: '지적장애', disabilityGrade: '3급', severity: 'MILD', gender: 'M', birthDate: '1983-08-05', hireDate: '2025-05-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '고계장20', registrationNumber: '860910', disabilityType: '자폐성장애', disabilityGrade: '3급', severity: 'MILD', gender: 'F', birthDate: '1986-09-10', hireDate: '2025-06-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '문과장21', registrationNumber: '821015', disabilityType: '지체장애', disabilityGrade: '4급', severity: 'MILD', gender: 'M', birthDate: '1982-10-15', hireDate: '2025-07-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '노부장22', registrationNumber: '881120', disabilityType: '시각장애', disabilityGrade: '5급', severity: 'MILD', gender: 'F', birthDate: '1988-11-20', hireDate: '2025-08-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '도차장23', registrationNumber: '801225', disabilityType: '청각장애', disabilityGrade: '5급', severity: 'MILD', gender: 'M', birthDate: '1980-12-25', hireDate: '2025-09-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '류국장24', registrationNumber: '850130', disabilityType: '신장장애', disabilityGrade: '4급', severity: 'MILD', gender: 'F', birthDate: '1985-01-30', hireDate: '2025-10-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '마팀장25', registrationNumber: '870305', disabilityType: '심장장애', disabilityGrade: '4급', severity: 'MILD', gender: 'M', birthDate: '1987-03-05', hireDate: '2025-11-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '사실장26', registrationNumber: '830410', disabilityType: '호흡기장애', disabilityGrade: '5급', severity: 'MILD', gender: 'F', birthDate: '1983-04-10', hireDate: '2025-12-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '아본부27', registrationNumber: '890515', disabilityType: '간장애', disabilityGrade: '4급', severity: 'MILD', gender: 'M', birthDate: '1989-05-15', hireDate: '2026-01-01', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
  { name: '자센터28', registrationNumber: '810620', disabilityType: '안면장애', disabilityGrade: '4급', severity: 'MILD', gender: 'F', birthDate: '1981-06-20', hireDate: '2026-01-15', workHoursPerWeek: 60, monthlySalary: 619000, hasEmploymentInsurance: true, meetsMinimumWage: true, workType: 'OFFICE' },
];

async function createEmployeesForBuyers() {
  try {
    console.log('\n🎯 Creating mock employees for buyer03 and buyer05...\n');

    // 1. Login as buyer03 (공공기관1)
    console.log('📌 Creating employees for 공공기관1 (buyer03)...\n');
    
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
    console.log('✅ buyer03 logged in');

    // Register employees for buyer03
    let successCount03 = 0;
    let failCount03 = 0;

    for (const emp of buyer03Employees) {
      try {
        const res = await fetch(`${API_BASE}/employees`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token03}`,
          },
          body: JSON.stringify(emp),
        });

        if (res.ok) {
          console.log(`  ✅ ${emp.name} - ${emp.severity} ${emp.workHoursPerWeek}시간`);
          successCount03++;
        } else {
          const error = await res.text();
          console.log(`  ❌ ${emp.name} - ${error}`);
          failCount03++;
        }
      } catch (e) {
        console.log(`  ❌ ${emp.name} - ${e.message}`);
        failCount03++;
      }
    }

    console.log(`\n공공기관1 등록 완료: 성공 ${successCount03}명, 실패 ${failCount03}명\n`);

    // 2. Login as buyer05 (교육청1)
    console.log('📌 Creating employees for 교육청1 (buyer05)...\n');
    
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
    console.log('✅ buyer05 logged in');

    // Register employees for buyer05
    let successCount05 = 0;
    let failCount05 = 0;

    for (const emp of buyer05Employees) {
      try {
        const res = await fetch(`${API_BASE}/employees`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token05}`,
          },
          body: JSON.stringify(emp),
        });

        if (res.ok) {
          console.log(`  ✅ ${emp.name} - ${emp.severity} ${emp.workHoursPerWeek}시간`);
          successCount05++;
        } else {
          const error = await res.text();
          console.log(`  ❌ ${emp.name} - ${error}`);
          failCount05++;
        }
      } catch (e) {
        console.log(`  ❌ ${emp.name} - ${e.message}`);
        failCount05++;
      }
    }

    console.log(`\n교육청1 등록 완료: 성공 ${successCount05}명, 실패 ${failCount05}명\n`);

    // 3. Set optimal monthly data for buyer03
    console.log('📊 Setting optimal monthly data for 공공기관1...\n');

    const monthly03Data = {
      1: 800,   // 800명 → 31명 기준, 30명 장애인 → 1명 부담금
      2: 1000,  // 1000명 → 38명 기준, 30명 장애인 → 8명 부담금
      3: 600,   // 600명 → 23명 기준, 30명 장애인 → 7명 장려금
      4: 1200,  // 1200명 → 46명 기준, 30명 장애인 → 16명 부담금
      5: 700,   // 700명 → 27명 기준, 30명 장애인 → 3명 장려금
      6: 900,   // 900명 → 35명 기준, 30명 장애인 → 5명 부담금
      7: 750,   // 750명 → 29명 기준, 30명 장애인 → 1명 장려금
      8: 800,   // 800명 → 31명 기준, 30명 장애인 → 1명 부담금
      9: 650,   // 650명 → 25명 기준, 30명 장애인 → 5명 장려금
      10: 1100, // 1100명 → 42명 기준, 30명 장애인 → 12명 부담금
      11: 780,  // 780명 → 30명 기준, 30명 장애인 → 균형
      12: 820,  // 820명 → 32명 기준, 30명 장애인 → 2명 부담금
    };

    const save03Res = await fetch(`${API_BASE}/employees/monthly`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token03}`,
      },
      body: JSON.stringify({
        year: 2026,
        monthlyEmployeeCounts: monthly03Data,
      }),
    });

    if (save03Res.ok) {
      console.log('✅ 공공기관1 월별 데이터 저장 완료');
    }

    // 4. Set optimal monthly data for buyer05
    console.log('\n📊 Setting optimal monthly data for 교육청1...\n');

    const monthly05Data = {
      1: 750,   // 750명 → 29명 기준, 28명 장애인 → 1명 부담금
      2: 600,   // 600명 → 23명 기준, 28명 장애인 → 5명 장려금
      3: 900,   // 900명 → 35명 기준, 28명 장애인 → 7명 부담금
      4: 700,   // 700명 → 27명 기준, 28명 장애인 → 1명 장려금
      5: 1000,  // 1000명 → 38명 기준, 28명 장애인 → 10명 부담금
      6: 650,   // 650명 → 25명 기준, 28명 장애인 → 3명 장려금
      7: 850,   // 850명 → 33명 기준, 28명 장애인 → 5명 부담금
      8: 730,   // 730명 → 28명 기준, 28명 장애인 → 균형
      9: 680,   // 680명 → 26명 기준, 28명 장애인 → 2명 장려금
      10: 950,  // 950명 → 37명 기준, 28명 장애인 → 9명 부담금
      11: 720,  // 720명 → 28명 기준, 28명 장애인 → 균형
      12: 800,  // 800명 → 31명 기준, 28명 장애인 → 3명 부담금
    };

    const save05Res = await fetch(`${API_BASE}/employees/monthly`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token05}`,
      },
      body: JSON.stringify({
        year: 2026,
        monthlyEmployeeCounts: monthly05Data,
      }),
    });

    if (save05Res.ok) {
      console.log('✅ 교육청1 월별 데이터 저장 완료');
    }

    console.log('\n🎉 모든 목업 데이터 생성 완료!\n');
    console.log('📊 최종 결과:');
    console.log('  - 공공기관1 (buyer03): 30명 장애인 직원, 3.8% 기준');
    console.log('  - 교육청1 (buyer05): 28명 장애인 직원, 3.8% 기준');
    console.log('\n각 기관 모두 장려금과 부담금이 월별로 번갈아 발생하도록 설정됨');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createEmployeesForBuyers();
