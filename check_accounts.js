const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAccounts() {
  try {
    // 모든 사용자 조회
    const users = await prisma.user.findMany({
      include: {
        company: true,
        branch: true
      },
      orderBy: {
        role: 'asc'
      }
    });

    console.log('=== 전체 계정 목록 ===\n');
    
    const grouped = {
      SUPER_ADMIN: [],
      AGENT: [],
      SUPPLIER: [],
      BUYER: []
    };

    users.forEach(user => {
      grouped[user.role].push(user);
    });

    // SUPER_ADMIN
    if (grouped.SUPER_ADMIN.length > 0) {
      console.log('📌 슈퍼어드민:');
      grouped.SUPER_ADMIN.forEach(user => {
        console.log(`  - 이름: ${user.name}`);
        console.log(`    핸드폰: ${user.phone}`);
        console.log(`    ID: ${user.username || '(핸드폰으로 로그인)'}`);
        console.log('');
      });
    }

    // AGENT
    if (grouped.AGENT.length > 0) {
      console.log('👔 매니저:');
      grouped.AGENT.forEach(user => {
        console.log(`  - 이름: ${user.name}`);
        console.log(`    핸드폰: ${user.phone}`);
        console.log(`    ID: ${user.username || '(핸드폰으로 로그인)'}`);
        console.log(`    지사: ${user.branch?.name || '없음'}`);
        console.log('');
      });
    }

    // SUPPLIER
    if (grouped.SUPPLIER.length > 0) {
      console.log('🏭 표준사업장:');
      grouped.SUPPLIER.forEach(user => {
        console.log(`  - 회사: ${user.company?.name || '없음'}`);
        console.log(`    ID: ${user.username || '(없음)'}`);
        console.log(`    핸드폰: ${user.phone}`);
        console.log(`    담당자: ${user.managerName || '없음'}`);
        console.log(`    담당자 핸드폰: ${user.managerPhone || '없음'}`);
        console.log('');
      });
    }

    // BUYER
    if (grouped.BUYER.length > 0) {
      console.log('🏢 고용의무기업:');
      grouped.BUYER.forEach(user => {
        console.log(`  - 회사: ${user.company?.name || '없음'}`);
        console.log(`    ID: ${user.username || '(없음)'}`);
        console.log(`    핸드폰: ${user.phone}`);
        console.log(`    기업유형: ${user.company?.buyerType || '없음'}`);
        console.log(`    담당자: ${user.managerName || '없음'}`);
        console.log(`    담당자 핸드폰: ${user.managerPhone || '없음'}`);
        console.log('');
      });
    }

    console.log('\n=== 테스트 계정 정리 (로그인 페이지용) ===\n');
    
    // 로그인 테스트용 정리
    console.log('관리자:');
    grouped.SUPER_ADMIN.forEach(u => console.log(`  슈퍼어드민: ${u.phone} / (DB 확인 필요)`));
    grouped.AGENT.forEach(u => console.log(`  매니저: ${u.phone} / (DB 확인 필요)`));
    
    console.log('\n표준사업장:');
    grouped.SUPPLIER.forEach(u => console.log(`  ${u.username || u.phone} / (DB 확인 필요)`));
    
    console.log('\n고용의무기업:');
    grouped.BUYER.forEach(u => {
      const type = u.company?.buyerType === 'PRIVATE_COMPANY' ? '민간' : 
                   u.company?.buyerType === 'PUBLIC_INSTITUTION' ? '공공' : 
                   u.company?.buyerType === 'GOVERNMENT' ? '국가/지자체' : '없음';
      const rate = u.company?.buyerType === 'PRIVATE_COMPANY' ? '3.1%' : 
                   (u.company?.buyerType === 'PUBLIC_INSTITUTION' || u.company?.buyerType === 'GOVERNMENT') ? '3.8%' : '';
      console.log(`  ${type} (${rate}): ${u.username || u.phone} / (DB 확인 필요)`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAccounts();
