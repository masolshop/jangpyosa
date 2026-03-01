const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestSalesData() {
  console.log('🏢 영업 조직 테스트 데이터 생성 시작...\n');

  try {
    // 1. 슈퍼어드민 사용자 찾기
    const superAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (!superAdmin) {
      console.log('❌ 슈퍼어드민을 찾을 수 없습니다');
      return;
    }

    console.log(`✅ 슈퍼어드민: ${superAdmin.name} (${superAdmin.id})\n`);

    // 2. 본부장 2명 생성
    const headManagers = [
      {
        name: '김본부',
        phone: '01011111111',
        email: 'kim.head@jangpyosa.com',
        role: 'HEAD_MANAGER',
      },
      {
        name: '이본부',
        phone: '01022222222',
        email: 'lee.head@jangpyosa.com',
        role: 'HEAD_MANAGER',
      },
    ];

    console.log('📍 본부장 생성 중...');
    const createdHeadManagers = [];
    for (const hm of headManagers) {
      const existing = await prisma.salesPerson.findUnique({
        where: { phone: hm.phone },
      });

      if (existing) {
        console.log(`  ⏭️  ${hm.name} - 이미 존재함`);
        createdHeadManagers.push(existing);
        continue;
      }

      const salesPerson = await prisma.salesPerson.create({
        data: {
          userId: `temp_user_${hm.phone}`,
          name: hm.name,
          phone: hm.phone,
          email: hm.email,
          role: hm.role,
          referralCode: hm.phone.replace(/-/g, ''),
          referralLink: `https://jangpyosa.com/${hm.phone}`,
          totalReferrals: Math.floor(Math.random() * 50) + 20,
          activeReferrals: Math.floor(Math.random() * 30) + 10,
          totalRevenue: Math.floor(Math.random() * 50000000) + 10000000,
          commission: Math.floor(Math.random() * 5000000) + 1000000,
        },
      });

      console.log(`  ✅ ${hm.name} - ${hm.phone}`);
      createdHeadManagers.push(salesPerson);
    }

    // 3. 지사장 4명 생성 (각 본부장 아래 2명씩)
    const branchManagers = [
      {
        name: '박지사',
        phone: '01033333333',
        email: 'park.branch@jangpyosa.com',
        managerId: createdHeadManagers[0].id,
      },
      {
        name: '최지사',
        phone: '01044444444',
        email: 'choi.branch@jangpyosa.com',
        managerId: createdHeadManagers[0].id,
      },
      {
        name: '정지사',
        phone: '01055555555',
        email: 'jung.branch@jangpyosa.com',
        managerId: createdHeadManagers[1].id,
      },
      {
        name: '강지사',
        phone: '01066666666',
        email: 'kang.branch@jangpyosa.com',
        managerId: createdHeadManagers[1].id,
      },
    ];

    console.log('\n📍 지사장 생성 중...');
    const createdBranchManagers = [];
    for (const bm of branchManagers) {
      const existing = await prisma.salesPerson.findUnique({
        where: { phone: bm.phone },
      });

      if (existing) {
        console.log(`  ⏭️  ${bm.name} - 이미 존재함`);
        createdBranchManagers.push(existing);
        continue;
      }

      const salesPerson = await prisma.salesPerson.create({
        data: {
          userId: `temp_user_${bm.phone}`,
          name: bm.name,
          phone: bm.phone,
          email: bm.email,
          role: 'BRANCH_MANAGER',
          managerId: bm.managerId,
          referralCode: bm.phone.replace(/-/g, ''),
          referralLink: `https://jangpyosa.com/${bm.phone}`,
          totalReferrals: Math.floor(Math.random() * 30) + 10,
          activeReferrals: Math.floor(Math.random() * 20) + 5,
          totalRevenue: Math.floor(Math.random() * 30000000) + 5000000,
          commission: Math.floor(Math.random() * 3000000) + 500000,
        },
      });

      console.log(`  ✅ ${bm.name} - ${bm.phone}`);
      createdBranchManagers.push(salesPerson);
    }

    // 4. 매니저 8명 생성 (각 지사장 아래 2명씩)
    const managers = [
      {
        name: '윤매니',
        phone: '01077777777',
        email: 'yoon.manager@jangpyosa.com',
        managerId: createdBranchManagers[0].id,
      },
      {
        name: '임매니',
        phone: '01088888888',
        email: 'lim.manager@jangpyosa.com',
        managerId: createdBranchManagers[0].id,
      },
      {
        name: '한매니',
        phone: '01099999999',
        email: 'han.manager@jangpyosa.com',
        managerId: createdBranchManagers[1].id,
      },
      {
        name: '오매니',
        phone: '01012341234',
        email: 'oh.manager@jangpyosa.com',
        managerId: createdBranchManagers[1].id,
      },
      {
        name: '서매니',
        phone: '01023452345',
        email: 'seo.manager@jangpyosa.com',
        managerId: createdBranchManagers[2].id,
      },
      {
        name: '권매니',
        phone: '01034563456',
        email: 'kwon.manager@jangpyosa.com',
        managerId: createdBranchManagers[2].id,
      },
      {
        name: '배매니',
        phone: '01045674567',
        email: 'bae.manager@jangpyosa.com',
        managerId: createdBranchManagers[3].id,
      },
      {
        name: '송매니',
        phone: '01056785678',
        email: 'song.manager@jangpyosa.com',
        managerId: createdBranchManagers[3].id,
      },
    ];

    console.log('\n📍 매니저 생성 중...');
    for (const m of managers) {
      const existing = await prisma.salesPerson.findUnique({
        where: { phone: m.phone },
      });

      if (existing) {
        console.log(`  ⏭️  ${m.name} - 이미 존재함`);
        continue;
      }

      await prisma.salesPerson.create({
        data: {
          userId: `temp_user_${m.phone}`,
          name: m.name,
          phone: m.phone,
          email: m.email,
          role: 'MANAGER',
          managerId: m.managerId,
          referralCode: m.phone.replace(/-/g, ''),
          referralLink: `https://jangpyosa.com/${m.phone}`,
          totalReferrals: Math.floor(Math.random() * 15) + 5,
          activeReferrals: Math.floor(Math.random() * 10) + 2,
          totalRevenue: Math.floor(Math.random() * 10000000) + 1000000,
          commission: Math.floor(Math.random() * 1000000) + 100000,
        },
      });

      console.log(`  ✅ ${m.name} - ${m.phone}`);
    }

    // 5. 통계 확인
    const totalCount = await prisma.salesPerson.count();
    const headCount = await prisma.salesPerson.count({ where: { role: 'HEAD_MANAGER' } });
    const branchCount = await prisma.salesPerson.count({ where: { role: 'BRANCH_MANAGER' } });
    const managerCount = await prisma.salesPerson.count({ where: { role: 'MANAGER' } });

    console.log('\n📊 생성 완료!');
    console.log(`  총 영업 사원: ${totalCount}명`);
    console.log(`  - 본부장: ${headCount}명`);
    console.log(`  - 지사장: ${branchCount}명`);
    console.log(`  - 매니저: ${managerCount}명`);

    console.log('\n✅ 영업 조직 테스트 데이터 생성 완료!');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSalesData();
