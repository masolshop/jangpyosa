import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 장애인 직원 데이터 생성 시작...\n');

    // 모든 BUYER 기업 조회
    const buyers = await prisma.company.findMany({
      where: { type: 'BUYER' },
      include: { 
        ownerUser: true,
        buyerProfile: true 
      },
      orderBy: { createdAt: 'asc' }
    });

    if (buyers.length === 0) {
      console.error('❌ BUYER 기업을 찾을 수 없습니다');
      return;
    }

    // 장애인 직원 목업 데이터
    const employeeTemplates = [
      { name: '김장애', gender: 'M', birthDate: '1985-03-15', disabilityType: '지체장애', disabilityGrade: '2급', severity: '중증', hireDate: '2023-01-10', weeklyHours: 40, monthlySalary: 2500000 },
      { name: '이중증', gender: 'F', birthDate: '1990-07-22', disabilityType: '시각장애', disabilityGrade: '1급', severity: '중증', hireDate: '2023-02-01', weeklyHours: 40, monthlySalary: 2800000 },
      { name: '박근로', gender: 'M', birthDate: '1988-11-30', disabilityType: '청각장애', disabilityGrade: '3급', severity: '중증', hireDate: '2023-03-15', weeklyHours: 40, monthlySalary: 2600000 },
      { name: '최단시', gender: 'F', birthDate: '1992-05-18', disabilityType: '지체장애', disabilityGrade: '5급', severity: '경증', hireDate: '2023-04-01', weeklyHours: 20, monthlySalary: 1300000 },
      { name: '정여성', gender: 'F', birthDate: '1987-09-25', disabilityType: '뇌병변장애', disabilityGrade: '2급', severity: '중증', hireDate: '2023-05-10', weeklyHours: 40, monthlySalary: 2700000 },
      { name: '강중증', gender: 'M', birthDate: '1991-02-14', disabilityType: '신장장애', disabilityGrade: '1급', severity: '중증', hireDate: '2023-06-01', weeklyHours: 40, monthlySalary: 2900000 },
    ];

    for (const buyer of buyers) {
      console.log(`\n📌 ${buyer.name} (${buyer.buyerType})`);
      
      if (!buyer.buyerProfile) {
        console.log('   ⚠️ BuyerProfile이 없습니다. 건너뜁니다.');
        continue;
      }
      
      // 기업 규모에 따른 직원 수 설정
      let totalEmployees = 0;
      let disabledToAdd = 0;
      
      switch (buyer.buyerType) {
        case 'PRIVATE_COMPANY':
          totalEmployees = 100; // 민간기업: 100명
          disabledToAdd = 3; // 3.1% → 최소 3명
          break;
        case 'PUBLIC_INSTITUTION':
          totalEmployees = 150; // 공공기관: 150명
          disabledToAdd = 6; // 3.8% → 최소 6명
          break;
        case 'GOVERNMENT':
          totalEmployees = 200; // 국가/지자체: 200명
          disabledToAdd = 8; // 3.8% → 최소 8명
          break;
      }

      // BuyerProfile 업데이트 (총 직원 수)
      await prisma.buyerProfile.update({
        where: { id: buyer.buyerProfile.id },
        data: {
          employeeCount: totalEmployees,
          disabledCount: 0 // 초기화 (나중에 집계)
        }
      });

      console.log(`   총 직원 수: ${totalEmployees}명`);
      console.log(`   등록할 장애인 직원: ${disabledToAdd}명`);

      // 장애인 직원 등록
      let actualDisabledCount = 0;
      for (let i = 0; i < disabledToAdd; i++) {
        const template = employeeTemplates[i % employeeTemplates.length];
        
        const employee = await prisma.disabledEmployee.create({
          data: {
            buyerId: buyer.buyerProfile.id,
            name: `${template.name}${i > 5 ? i : ''}`,
            registrationNumber: `${template.birthDate.replace(/-/g, '').substring(2)}${template.gender === 'M' ? '3' : '4'}******`,
            gender: template.gender,
            birthDate: new Date(template.birthDate),
            disabilityType: template.disabilityType,
            disabilityGrade: template.disabilityGrade,
            severity: template.severity,
            hireDate: new Date(template.hireDate),
            workHoursPerWeek: template.weeklyHours,
            monthlySalary: template.monthlySalary,
            hasEmploymentInsurance: true,
            meetsMinimumWage: true,
          }
        });

        // 가중치 계산
        let weight = 1.0;
        
        // 중증장애(1~3급) 가중치 2배
        if (template.severity === '중증') {
          weight = 2.0;
        }
        
        // 여성 가중 0.5 추가
        if (template.gender === 'F') {
          weight += 0.5;
        }
        
        // 단시간(주 20시간 미만) 가중치 0.5배
        if (template.weeklyHours < 20) {
          weight *= 0.5;
        }

        actualDisabledCount += weight;

        const weightLabel = weight === 1.0 ? '일반' : 
                          weight === 2.0 ? '중증' :
                          weight === 2.5 ? '중증+여성' :
                          weight === 0.5 ? '단시간' : weight.toString();

        console.log(`   ✅ ${employee.name} (${template.disabilityType} ${template.disabilityGrade}, ${template.gender === 'F' ? '여성' : '남성'}, 주${template.weeklyHours}시간) → 가중치: ${weight} [${weightLabel}]`);
      }

      // 실제 장애인 직원 수 업데이트
      await prisma.buyerProfile.update({
        where: { id: buyer.buyerProfile.id },
        data: { disabledCount: actualDisabledCount }
      });

      // 의무고용률 계산
      const requiredRate = buyer.buyerType === 'PRIVATE_COMPANY' ? 3.1 : 3.8;
      const requiredCount = Math.ceil(totalEmployees * requiredRate / 100);
      const fulfillmentRate = (actualDisabledCount / requiredCount * 100).toFixed(1);

      console.log(`\n   📊 의무고용 현황:`);
      console.log(`      - 의무고용률: ${requiredRate}%`);
      console.log(`      - 의무고용 인원: ${requiredCount}명`);
      console.log(`      - 실제 고용 인원: ${actualDisabledCount}명 (가중치 포함)`);
      console.log(`      - 달성률: ${fulfillmentRate}%`);
      
      if (actualDisabledCount >= requiredCount) {
        console.log(`      ✅ 의무고용 달성!`);
      } else {
        const shortage = requiredCount - actualDisabledCount;
        console.log(`      ⚠️ ${shortage}명 부족`);
      }
    }

    console.log('\n\n✅ 장애인 직원 데이터 생성 완료!');

  } catch (error) {
    console.error('❌ 에러:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
