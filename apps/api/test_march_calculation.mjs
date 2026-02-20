import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testMarchCalculation() {
  try {
    console.log('\n🔍 Testing March calculation...\n');

    // 1. Get buyer company
    const buyer = await prisma.user.findFirst({
      where: {
        phone: '01055556666',
      },
      include: {
        company: {
          include: {
            buyerProfile: true,
          },
        },
      },
    });

    if (!buyer || !buyer.company?.buyerProfile) {
      console.error('❌ Buyer not found');
      return;
    }

    const buyerProfileId = buyer.company.buyerProfile.id;
    console.log(`📌 Buyer: ${buyer.company.name}`);

    // 2. Get all disabled employees
    const employees = await prisma.employee.findMany({
      where: {
        buyerProfileId,
        disabilityType: { not: null },
        disabilityGrade: { not: null },
      },
    });

    console.log(`📊 Total disabled employees: ${employees.length}`);

    // 3. Filter active employees for March 2026
    const targetDate = new Date('2026-03-15');
    const activeEmployees = employees.filter(emp => {
      const hireDate = emp.hireDate ? new Date(emp.hireDate) : null;
      const resignDate = emp.resignDate ? new Date(emp.resignDate) : null;
      
      if (!hireDate) return false;
      if (hireDate > targetDate) return false;
      if (resignDate && resignDate <= targetDate) return false;
      
      return true;
    });

    console.log(`✅ Active employees in March: ${activeEmployees.length}\n`);

    // 4. Check each employee's qualification
    const totalEmployeeCount = 800;
    const quotaRate = 0.031;
    const incentiveBaselineCount = Math.ceil(totalEmployeeCount * quotaRate);

    console.log(`📌 Total employees: ${totalEmployeeCount}`);
    console.log(`📌 Baseline count (ceil): ${incentiveBaselineCount}\n`);

    let excludedCount = 0;
    let eligibleCount = 0;

    activeEmployees.forEach((emp, index) => {
      const rank = index + 1;
      const isWithinBaseline = rank <= incentiveBaselineCount;

      // Calculate months worked
      const hireDate = new Date(emp.hireDate);
      const monthsWorked = Math.floor(
        (targetDate.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
      );

      // Support period
      const maxPeriod = emp.severity === 'SEVERE' ? 24 : 12;

      let status = '';
      if (isWithinBaseline) {
        status = '기준인원 이내';
      } else if (!emp.hasEmploymentInsurance) {
        status = '🚫 고용보험 미가입';
        excludedCount++;
      } else if (!emp.meetsMinimumWage) {
        status = '🚫 최저임금 미만';
        excludedCount++;
      } else if (monthsWorked > maxPeriod) {
        status = `🚫 지원기간 초과 (${monthsWorked}개월 > ${maxPeriod}개월)`;
        excludedCount++;
      } else {
        status = '✅ 장려금 지급 대상';
        eligibleCount++;
      }

      console.log(
        `${rank}. ${emp.name?.padEnd(10)} | ` +
        `${emp.severity?.padEnd(7)} | ` +
        `근무: ${monthsWorked.toString().padStart(2)}개월 | ` +
        `보험: ${emp.hasEmploymentInsurance ? 'O' : 'X'} | ` +
        `최저: ${emp.meetsMinimumWage ? 'O' : 'X'} | ` +
        status
      );
    });

    console.log(`\n📊 Summary:`);
    console.log(`  - Total active: ${activeEmployees.length}`);
    console.log(`  - Baseline (within quota): ${incentiveBaselineCount}`);
    console.log(`  - Excluded (over baseline): ${excludedCount}`);
    console.log(`  - Eligible (incentive recipients): ${eligibleCount}`);
    console.log(`\n✅ Formula: ${activeEmployees.length} - ${incentiveBaselineCount} - ${excludedCount} = ${eligibleCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMarchCalculation();
