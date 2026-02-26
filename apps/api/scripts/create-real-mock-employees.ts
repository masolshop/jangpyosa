import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 실제 직원 데이터 (로그인 정보와 일치)
const employeeData = [
  // 🏢 주식회사 페마연 (buyer01) - 5명
  {
    username: 'buyer01',
    employees: [
      { name: '박영희', phone: '01099990001', regNo: '900512', gender: 'F', severity: 'SEVERE', disabilityType: '시각장애', grade: '2급' },
      { name: '이철수', phone: '01099990002', regNo: '851203', gender: 'M', severity: 'SEVERE', disabilityType: '지체장애', grade: '3급' },
      { name: '정미라', phone: '01099990003', regNo: '880725', gender: 'F', severity: 'MILD', disabilityType: '청각장애', grade: '4급' },
      { name: '최동욱', phone: '01099990004', regNo: '920318', gender: 'M', severity: 'SEVERE', disabilityType: '뇌병변장애', grade: '1급' },
      { name: '한수진', phone: '01099990005', regNo: '870609', gender: 'F', severity: 'MILD', disabilityType: '언어장애', grade: '5급' },
    ]
  },
  
  // 🏛️ 공공기관1 (buyer03) - 3명
  {
    username: 'buyer03',
    employees: [
      { name: '김공무원01', phone: '01099990006', regNo: '860420', gender: 'M', severity: 'SEVERE', disabilityType: '지체장애', grade: '2급' },
      { name: '이서연02', phone: '01099990007', regNo: '891115', gender: 'F', severity: 'MILD', disabilityType: '시각장애', grade: '4급' },
      { name: '박민수03', phone: '01099990008', regNo: '930807', gender: 'M', severity: 'MILD', disabilityType: '청각장애', grade: '6급' },
    ]
  },
  
  // 🏫 교육청1 (buyer05) - 3명
  {
    username: 'buyer05',
    employees: [
      { name: '김교사01', phone: '01099990009', regNo: '871022', gender: 'M', severity: 'SEVERE', disabilityType: '지적장애', grade: '3급' },
      { name: '이선생02', phone: '01099990010', regNo: '900531', gender: 'F', severity: 'MILD', disabilityType: '지체장애', grade: '5급' },
      { name: '박교육03', phone: '01099990011', regNo: '880914', gender: 'M', severity: 'MILD', disabilityType: '시각장애', grade: '4급' },
    ]
  },
  
  // 🏭 행복한표준사업장 (supplier01) - 5명
  {
    username: 'supplier01',
    employees: [
      { name: '강현우', phone: '01088880001', regNo: '891226', gender: 'M', severity: 'SEVERE', disabilityType: '지체장애', grade: '2급' },
      { name: '장지은', phone: '01088880002', regNo: '920403', gender: 'F', severity: 'SEVERE', disabilityType: '시각장애', grade: '1급' },
      { name: '박태양', phone: '01088880003', regNo: '870819', gender: 'M', severity: 'MILD', disabilityType: '청각장애', grade: '5급' },
      { name: '임유진', phone: '01088880004', regNo: '911107', gender: 'F', severity: 'MILD', disabilityType: '언어장애', grade: '4급' },
      { name: '박민수', phone: '01088880005', regNo: '860528', gender: 'M', severity: 'SEVERE', disabilityType: '뇌병변장애', grade: '3급' },
    ]
  },
];

async function createRealMockEmployees() {
  try {
    console.log('🚀 실제 목업 직원 데이터 생성 시작...\n');

    // 2026년 최저시급
    const MIN_HOURLY_WAGE = 10320;
    
    let totalCreated = 0;

    for (const companyData of employeeData) {
      // 사용자 조회
      const user = await prisma.user.findUnique({
        where: { username: companyData.username },
        include: {
          company: {
            include: {
              buyerProfile: true,
              supplierProfile: true
            }
          }
        }
      });

      if (!user || !user.company) {
        console.log(`⚠️  사용자 ${companyData.username}: 찾을 수 없음, 건너뜀\n`);
        continue;
      }

      const company = user.company;
      const buyerProfile = company.buyerProfile || company.supplierProfile;

      if (!buyerProfile) {
        console.log(`⚠️  ${company.name}: buyerProfile/supplierProfile 없음, 건너뜀\n`);
        continue;
      }

      console.log(`\n🏢 ${company.name} (${user.username})`);
      console.log(`   📝 등록할 직원 수: ${companyData.employees.length}명\n`);

      // 기존 직원 데이터 삭제
      const deletedCount = await prisma.disabledEmployee.deleteMany({
        where: { buyerId: buyerProfile.id }
      });
      console.log(`   🗑️  기존 직원 ${deletedCount.count}명 삭제\n`);

      // 각 직원 생성
      for (let i = 0; i < companyData.employees.length; i++) {
        const empData = companyData.employees[i];
        
        // 월 근로시간: 중증 60-80시간, 경증 80-120시간
        const monthlyWorkHours = empData.severity === 'SEVERE' 
          ? Math.floor(Math.random() * 21) + 60   // 60-80시간
          : Math.floor(Math.random() * 41) + 80;  // 80-120시간
        
        // 월급 = 월 근로시간 × 최저시급
        const monthlySalary = monthlyWorkHours * MIN_HOURLY_WAGE;

        try {
          const employee = await prisma.disabledEmployee.create({
            data: {
              buyerId: buyerProfile.id,
              name: empData.name,
              phone: empData.phone,
              registrationNumber: empData.regNo,
              gender: empData.gender,
              disabilityType: empData.disabilityType,
              disabilityGrade: empData.grade,
              severity: empData.severity,
              monthlyWorkHours: monthlyWorkHours,
              workHoursPerWeek: Math.round(monthlyWorkHours / 4.33),
              monthlySalary,
              hireDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
              workType: 'OFFICE',
            }
          });

          totalCreated++;
          const severityKr = empData.severity === 'SEVERE' ? '중증' : '경증';
          console.log(`   ✅ ${i + 1}/${companyData.employees.length}: ${empData.name} (${empData.phone}, ${severityKr} ${empData.grade}, 월 ${monthlyWorkHours}h, ${monthlySalary.toLocaleString()}원)`);
        } catch (error: any) {
          console.log(`   ❌ ${i + 1}/${companyData.employees.length}: ${empData.name} - 오류: ${error.message}`);
        }
      }

      console.log(`\n   📊 ${company.name} 총 ${companyData.employees.length}명 등록 완료\n`);
    }

    console.log('\n✅ 실제 목업 직원 데이터 생성 완료!\n');
    console.log(`📊 전체 등록된 직원 수: ${totalCreated}명\n`);

    // 최종 확인
    const totalEmployees = await prisma.disabledEmployee.count();
    console.log(`📊 데이터베이스 전체 직원 수: ${totalEmployees}명\n`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRealMockEmployees();
