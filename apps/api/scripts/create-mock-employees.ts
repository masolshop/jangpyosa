import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 한국 이름 목록
const lastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍'];
const firstNames = ['민준', '서연', '지훈', '수빈', '예준', '하은', '도윤', '지우', '시우', '서준', '하준', '윤서', '건우', '유진', '준서', '채원', '민서', '지민', '수아', '다은'];

// 랜덤 이름 생성
function generateRandomName(): string {
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  return lastName + firstName;
}

// 랜덤 주민등록번호 생성 (1960-2000년생)
function generateRandomRegNo(): string {
  const year = Math.floor(Math.random() * 40) + 60; // 60-99
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  const gender = Math.random() > 0.5 ? '1' : '2'; // 1:남, 2:여
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `${year}${month}${day}-${gender}${random}`;
}

// 랜덤 전화번호 생성
function generateRandomPhone(): string {
  const middle = String(Math.floor(Math.random() * 9000) + 1000);
  const last = String(Math.floor(Math.random() * 9000) + 1000);
  return `010${middle}${last}`;
}

// 랜덤 주소 생성
const addresses = [
  '서울특별시 강남구 테헤란로 123',
  '서울특별시 마포구 월드컵로 456',
  '서울특별시 종로구 세종대로 789',
  '부산광역시 해운대구 센텀중앙로 321',
  '대구광역시 수성구 달구벌대로 654',
  '인천광역시 연수구 컨벤시아대로 987',
  '광주광역시 서구 상무대로 147',
  '대전광역시 유성구 대학로 258',
  '경기도 수원시 영통구 광교로 369',
  '경기도 성남시 분당구 판교역로 741'
];

function getRandomAddress(): string {
  return addresses[Math.floor(Math.random() * addresses.length)];
}

// 장애 유형 목록
const disabilityTypes = ['지체장애', '시각장애', '청각장애', '언어장애', '지적장애', '뇌병변장애', '자폐성장애', '정신장애'];

// 직무 목록
const jobTitles = ['생산직', '포장직', '사무보조', '청소', '조리보조', '세탁', '제조', '검수', '재활용', '단순노무'];

async function createMockEmployees() {
  try {
    console.log('🚀 목업 직원 데이터 생성 시작...\n');

    // 목표 계정 아이디 (실제 존재하는 계정들)
    const targetUsernames = [
      'buyer01',     // 민간기업
      'buyer03',     // 공공기관
      'buyer05',     // 국가지자체/교육청
      'supplier01',  // 표준사업장
    ];

    // 사용자 조회
    const allUsers = await prisma.user.findMany({
      where: {
        username: { in: targetUsernames }
      },
      include: {
        company: {
          include: {
            buyerProfile: true,
            supplierProfile: true
          }
        }
      }
    });

    console.log(`📊 찾은 사용자: ${allUsers.length}명\n`);

    // 2026년 최저시급
    const MIN_HOURLY_WAGE = 10320;
    
    // 최소 근로시간 (월 60시간)
    const MIN_WORK_HOURS = 60;

    for (const user of allUsers) {
      const company = user.company;
      
      if (!company) {
        console.log(`⚠️  사용자 ${user.phone}: 회사 없음, 건너뜀\n`);
        continue;
      }

      if (!company.buyerProfile) {
        console.log(`⚠️  ${company.name}: buyerProfile 없음, 건너뜀\n`);
        continue;
      }

      // 기존 직원 데이터 삭제
      const deletedCount = await prisma.disabledEmployee.deleteMany({
        where: { buyerId: company.buyerProfile.id }
      });
      console.log(`🗑️  기존 직원 ${deletedCount.count}명 삭제\n`);

      // 📊 명확한 직원 구성 (중증/경증, 남성/여성)
      const employeeDistribution = [
        // 중증 장애인 (SEVERE)
        { severity: 'SEVERE', gender: 'M', count: 5 },   // 중증 남성 5명
        { severity: 'SEVERE', gender: 'F', count: 3 },   // 중증 여성 3명
        
        // 경증 장애인 (MILD)
        { severity: 'MILD', gender: 'M', count: 7 },     // 경증 남성 7명
        { severity: 'MILD', gender: 'F', count: 3 },     // 경증 여성 3명
      ];

      const employeeCount = employeeDistribution.reduce((sum, d) => sum + d.count, 0);
      
      console.log(`\n🏢 ${company.name} (${company.buyerType || company.type})`);
      console.log(`   👤 소유자: ${user.username || user.phone}`);
      console.log(`   📝 생성할 직원 수: ${employeeCount}명`);
      console.log(`   📊 구성: 중증 남 5명, 중증 여 3명, 경증 남 7명, 경증 여 3명\n`);

      const employees = [];
      let employeeIndex = 0;

      // 각 분류별로 직원 생성
      for (const dist of employeeDistribution) {
        for (let i = 0; i < dist.count; i++) {
          employeeIndex++;
          
          const name = generateRandomName();
          const phone = generateRandomPhone();
          const address = getRandomAddress();
          
          // 성별에 맞는 주민등록번호 생성
          const year = Math.floor(Math.random() * 40) + 60; // 60-99
          const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
          const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
          const genderCode = dist.gender === 'M' ? '1' : '2'; // 1:남, 2:여
          const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
          const regNo = `${year}${month}${day}-${genderCode}${random}`;
          
          // 중증도와 성별
          const severity = dist.severity;
          const gender = dist.gender;
          
          // 월 근로시간: 60시간 ~ 209시간 랜덤 (최소 60시간, 최대 주 52시간 × 4주)
          const monthlyWorkHours = Math.floor(Math.random() * 150) + MIN_WORK_HOURS; // 60-209시간
          
          // 월급 = 월 근로시간 × 최저시급 (10,320원)
          const monthlySalary = monthlyWorkHours * MIN_HOURLY_WAGE;
          
          const disabilityType = disabilityTypes[Math.floor(Math.random() * disabilityTypes.length)];
          const disabilityGrade = severity === 'SEVERE' ? 
            Math.floor(Math.random() * 3) + 1 :  // 중증: 1-3급
            Math.floor(Math.random() * 3) + 4;   // 경증: 4-6급
          const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];

          try {
            const employee = await prisma.disabledEmployee.create({
              data: {
                buyerId: company.buyerProfile.id,
                name,
                registrationNumber: regNo,
                gender,
                disabilityType,
                disabilityGrade: `${disabilityGrade}급`,
                severity,
                monthlyWorkHours: monthlyWorkHours, // 월 근로시간
                workHoursPerWeek: Math.round(monthlyWorkHours / 4.33), // 주당 근무시간 (참고용)
                monthlySalary,
                hireDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
              }
            });

            employees.push(employee);
            
            const severityKr = severity === 'SEVERE' ? '중증' : '경증';
            const genderKr = gender === 'M' ? '남성' : '여성';
            console.log(`   ✅ ${employeeIndex}/${employeeCount}: ${name} (${severityKr} ${genderKr}, ${disabilityGrade}급, 월 ${monthlyWorkHours}h, ${monthlySalary.toLocaleString()}원)`);
          } catch (error: any) {
            console.log(`   ❌ ${employeeIndex}/${employeeCount}: ${name} - 오류: ${error.message}`);
          }
        }
      }

      console.log(`\n   📊 ${company.name} 총 ${employees.length}명 등록 완료`);
      
      // 📊 상세 통계 출력
      const severeMale = employees.filter(e => e.severity === 'SEVERE' && e.gender === 'M').length;
      const severeFemale = employees.filter(e => e.severity === 'SEVERE' && e.gender === 'F').length;
      const mildMale = employees.filter(e => e.severity === 'MILD' && e.gender === 'M').length;
      const mildFemale = employees.filter(e => e.severity === 'MILD' && e.gender === 'F').length;
      
      const totalSalary = employees.reduce((sum, e) => sum + (e.monthlySalary || 0), 0);
      const avgSalary = totalSalary > 0 ? Math.round(totalSalary / employees.length) : 0;

      console.log(`\n   📈 중증도 & 성별 분포:`);
      console.log(`   ┌─────────┬──────┬──────┬──────┐`);
      console.log(`   │         │ 남성 │ 여성 │ 합계 │`);
      console.log(`   ├─────────┼──────┼──────┼──────┤`);
      console.log(`   │ 중증    │  ${String(severeMale).padStart(2, ' ')}  │  ${String(severeFemale).padStart(2, ' ')}  │  ${String(severeMale + severeFemale).padStart(2, ' ')}  │`);
      console.log(`   │ 경증    │  ${String(mildMale).padStart(2, ' ')}  │  ${String(mildFemale).padStart(2, ' ')}  │  ${String(mildMale + mildFemale).padStart(2, ' ')}  │`);
      console.log(`   ├─────────┼──────┼──────┼──────┤`);
      console.log(`   │ 합계    │  ${String(severeMale + mildMale).padStart(2, ' ')}  │  ${String(severeFemale + mildFemale).padStart(2, ' ')}  │  ${String(employees.length).padStart(2, ' ')}  │`);
      console.log(`   └─────────┴──────┴──────┴──────┘`);
      console.log(`   - 평균 급여: ${avgSalary.toLocaleString()}원/월`);
      console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    }

    console.log('\n✅ 목업 직원 데이터 생성 완료!\n');

    // 최종 통계
    const totalEmployees = await prisma.disabledEmployee.count();
    console.log(`📊 전체 등록된 직원 수: ${totalEmployees}명\n`);

    // 🔧 User-DisabledEmployee 매핑 설정
    console.log('🔧 User-DisabledEmployee 매핑 설정 중...\n');
    
    const mappings = [
      { companyId: 'cmlu4gobz000910vpj1izl197', userIds: ['user_emp_1', 'user_emp_2', 'user_emp_3', 'user_emp_4', 'user_emp_5'], name: '주식회사 페마연' },
      { companyId: 'cmlu4gokt000h10vp9paz1nwl', userIds: ['user_emp_6', 'user_emp_7', 'user_emp_8'], name: '공공기관1' },
      { companyId: 'cmlu4gose000p10vpecg64uct', userIds: ['user_emp_9', 'user_emp_10', 'user_emp_11'], name: '교육청1' }
    ];
    
    for (const mapping of mappings) {
      const company = await prisma.company.findUnique({
        where: { id: mapping.companyId },
        include: { buyerProfile: true }
      });
      
      if (!company?.buyerProfile) {
        console.log(`⚠️  ${mapping.name}: 회사 또는 buyerProfile 없음, 건너뜀`);
        continue;
      }
      
      const employees = await prisma.disabledEmployee.findMany({
        where: { buyerId: company.buyerProfile.id },
        orderBy: { createdAt: 'asc' },
        take: mapping.userIds.length
      });
      
      console.log(`📋 ${mapping.name}:`);
      for (let i = 0; i < mapping.userIds.length && i < employees.length; i++) {
        await prisma.user.update({
          where: { id: mapping.userIds[i] },
          data: { employeeId: employees[i].id }
        });
        console.log(`   ✅ ${mapping.userIds[i]} → ${employees[i].name}`);
      }
    }
    
    console.log('\n✅ User-DisabledEmployee 매핑 완료!\n');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMockEmployees();
