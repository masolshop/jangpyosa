import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 영업 조직 테스트 데이터 생성 시작...');

  try {
    // 1. 기존 영업 사원 데이터 삭제
    await prisma.companyReferral.deleteMany({});
    await prisma.salesActivityLog.deleteMany({});
    await prisma.salesPerson.deleteMany({});
    console.log('✅ 기존 데이터 삭제 완료');

    // 2. 본부장 3명 생성
    const headManagers = [];
    for (let i = 1; i <= 3; i++) {
      // User 생성
      const phone = `0101111${i.toString().padStart(4, '0')}`;
      const user = await prisma.user.create({
        data: {
          email: `headmanager${i}@jangpyosa.com`,
          passwordHash: '$2a$10$YourHashedPasswordHere',
          name: `김본부${i}`,
          phone: phone,
          role: 'EMPLOYEE',
        },
      });

      // SalesPerson 생성
      const salesPerson = await prisma.salesPerson.create({
        data: {
          userId: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: 'HEAD_MANAGER',
          referralCode: user.phone.replace(/^0/, ''),
          referralLink: `https://jangpyosa.com/${user.phone}`,
          totalReferrals: Math.floor(Math.random() * 50) + 20,
          activeReferrals: Math.floor(Math.random() * 30) + 10,
          totalRevenue: Math.floor(Math.random() * 50000000) + 10000000,
          commission: Math.floor(Math.random() * 5000000) + 1000000,
          isActive: true,
        },
      });
      
      headManagers.push(salesPerson);
      console.log(`✅ 본부장 생성: ${salesPerson.name}`);
    }

    // 3. 각 본부장마다 지사장 3명씩 생성
    const branchManagers = [];
    let branchCounter = 1;
    for (const headManager of headManagers) {
      for (let i = 1; i <= 3; i++) {
        const phone = `0102222${branchCounter.toString().padStart(4, '0')}`;
        const user = await prisma.user.create({
          data: {
            email: `branch_${branchCounter}@jangpyosa.com`,
            passwordHash: '$2a$10$YourHashedPasswordHere',
            name: `이지사${branchCounter}`,
            phone: phone,
            role: 'EMPLOYEE',
          },
        });

        const salesPerson = await prisma.salesPerson.create({
          data: {
            userId: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: 'BRANCH_MANAGER',
            managerId: headManager.id,
            referralCode: user.phone.replace(/^0/, ''),
            referralLink: `https://jangpyosa.com/${user.phone}`,
            totalReferrals: Math.floor(Math.random() * 30) + 10,
            activeReferrals: Math.floor(Math.random() * 20) + 5,
            totalRevenue: Math.floor(Math.random() * 30000000) + 5000000,
            commission: Math.floor(Math.random() * 3000000) + 500000,
            isActive: true,
          },
        });

        branchManagers.push(salesPerson);
        console.log(`✅ 지사장 생성: ${salesPerson.name} (상위: ${headManager.name})`);
        branchCounter++;
      }
    }

    // 4. 각 지사장마다 매니저 5명씩 생성
    let managerCounter = 1;
    for (const branchManager of branchManagers) {
      for (let i = 1; i <= 5; i++) {
        const phone = `0103333${managerCounter.toString().padStart(4, '0')}`;
        const user = await prisma.user.create({
          data: {
            email: `manager_${managerCounter}@jangpyosa.com`,
            passwordHash: '$2a$10$YourHashedPasswordHere',
            name: `박매니${managerCounter}`,
            phone: phone,
            role: 'EMPLOYEE',
          },
        });

        const salesPerson = await prisma.salesPerson.create({
          data: {
            userId: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: 'MANAGER',
            managerId: branchManager.id,
            referralCode: user.phone.replace(/^0/, ''),
            referralLink: `https://jangpyosa.com/${user.phone}`,
            totalReferrals: Math.floor(Math.random() * 20) + 5,
            activeReferrals: Math.floor(Math.random() * 15) + 2,
            totalRevenue: Math.floor(Math.random() * 15000000) + 2000000,
            commission: Math.floor(Math.random() * 1500000) + 200000,
            isActive: true,
          },
        });

        console.log(`✅ 매니저 생성: ${salesPerson.name} (상위: ${branchManager.name})`);
        managerCounter++;
      }
    }

    // 5. 통계 출력
    const totalCount = await prisma.salesPerson.count();
    const countByRole = await prisma.salesPerson.groupBy({
      by: ['role'],
      _count: true,
    });

    console.log('\n📊 최종 통계:');
    console.log(`   총 영업 사원: ${totalCount}명`);
    countByRole.forEach(item => {
      const roleNames = {
        HEAD_MANAGER: '본부장',
        BRANCH_MANAGER: '지사장',
        MANAGER: '매니저',
      };
      console.log(`   ${roleNames[item.role]}: ${item._count}명`);
    });

    console.log('\n✅ 영업 조직 테스트 데이터 생성 완료!');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
