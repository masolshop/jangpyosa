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

      const employeeCount = Math.floor(Math.random() * 6) + 10; // 10-15명
      console.log(`\n🏢 ${company.name} (${company.buyerType || company.type})`);
      console.log(`   👤 소유자: ${user.username || user.phone}`);
      console.log(`   📝 생성할 직원 수: ${employeeCount}명\n`);

      const employees = [];

      for (let i = 0; i < employeeCount; i++) {
        const name = generateRandomName();
        const regNo = generateRandomRegNo();
        const phone = generateRandomPhone();
        const address = getRandomAddress();
        
        // 중증(50%) vs 경증(50%)
        const severity = Math.random() > 0.5 ? '중증' : '경증';
        
        // 주당 근무시간: 15-40시간 랜덤
        const workHoursPerWeek = Math.floor(Math.random() * 26) + 15;
        
        const disabilityType = disabilityTypes[Math.floor(Math.random() * disabilityTypes.length)];
        const disabilityGrade = Math.floor(Math.random() * 3) + 1; // 1-3급
        const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
        
        // 성별 (주민등록번호에서 추출)
        const genderCode = regNo.split('-')[1][0];
        const gender = (genderCode === '1' || genderCode === '3') ? '남' : '여';

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
              workHoursPerWeek,
              hireDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
              isActive: true
            }
          });

          employees.push(employee);
          console.log(`   ✅ ${i + 1}/${employeeCount}: ${name} (${severity}, ${gender}, ${workHoursPerWeek}시간/주)`);
        } catch (error: any) {
          console.log(`   ❌ ${i + 1}/${employeeCount}: ${name} - 오류: ${error.message}`);
        }
      }

      console.log(`\n   📊 ${company.name} 총 ${employees.length}명 등록 완료`);
      
      // 통계 출력
      const severeCount = employees.filter(e => e.severity === '중증').length;
      const mildCount = employees.filter(e => e.severity === '경증').length;
      const maleCount = employees.filter(e => e.gender === '남').length;
      const femaleCount = employees.filter(e => e.gender === '여').length;
      const totalHours = employees.reduce((sum, e) => sum + (e.workHoursPerWeek || 0), 0);
      const avgHours = totalHours > 0 ? Math.round(totalHours / employees.length) : 0;

      console.log(`   - 중증: ${severeCount}명, 경증: ${mildCount}명`);
      console.log(`   - 남성: ${maleCount}명, 여성: ${femaleCount}명`);
      console.log(`   - 평균 근무시간: ${avgHours}시간/주`);
      console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    }

    console.log('\n✅ 목업 직원 데이터 생성 완료!\n');

    // 최종 통계
    const totalEmployees = await prisma.disabledEmployee.count();
    console.log(`📊 전체 등록된 직원 수: ${totalEmployees}명\n`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMockEmployees();
