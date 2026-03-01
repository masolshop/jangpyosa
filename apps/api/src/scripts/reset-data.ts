import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetData() {
  try {
    console.log('🗑️ 기존 데이터 삭제 시작...\n');
    
    // 1. 승인 대기 매니저 삭제
    console.log('1️⃣ 승인 대기 매니저 조회 중...');
    const inactiveSalesPeople = await prisma.salesPerson.findMany({
      where: { isActive: false },
      include: {
        referredCompanies: true,
      },
    });
    
    console.log(`   → ${inactiveSalesPeople.length}명 발견`);
    
    for (const person of inactiveSalesPeople) {
      console.log(`   → ${person.name} (${person.phone}) 삭제 중...`);
      
      // 추천 기업 기록 삭제
      if (person.referredCompanies.length > 0) {
        await prisma.companyReferral.deleteMany({
          where: { salesPersonId: person.id },
        });
      }
      
      // User 계정 삭제
      try {
        await prisma.user.delete({
          where: { id: person.userId },
        });
      } catch (e) {
        console.log(`      (User 계정 이미 삭제됨)`);
      }
    }
    
    // SalesPerson 삭제
    const deletedManagers = await prisma.salesPerson.deleteMany({
      where: { isActive: false },
    });
    console.log(`   ✅ ${deletedManagers.count}명 삭제 완료\n`);
    
    // 2. 기존 본부/지사 삭제
    console.log('2️⃣ 기존 본부/지사 조회 중...');
    const allOrgs = await prisma.organization.findMany({
      include: {
        salesPeople: true,
        subOrganizations: true,
      },
    });
    
    console.log(`   → 총 ${allOrgs.length}개 조직 발견`);
    
    // SalesPerson의 organizationId를 null로 설정
    if (allOrgs.length > 0) {
      await prisma.salesPerson.updateMany({
        where: { organizationId: { not: null } },
        data: { organizationId: null },
      });
      console.log(`   → SalesPerson의 조직 연결 해제 완료`);
    }
    
    // 지사 삭제
    const branches = allOrgs.filter(org => org.type === 'BRANCH');
    for (const branch of branches) {
      console.log(`   → 지사: ${branch.name} 삭제 중...`);
      await prisma.organization.delete({
        where: { id: branch.id },
      });
    }
    console.log(`   ✅ 지사 ${branches.length}개 삭제 완료`);
    
    // 본부 삭제
    const headquarters = allOrgs.filter(org => org.type === 'HEADQUARTERS');
    for (const hq of headquarters) {
      console.log(`   → 본부: ${hq.name} 삭제 중...`);
      await prisma.organization.delete({
        where: { id: hq.id },
      });
    }
    console.log(`   ✅ 본부 ${headquarters.length}개 삭제 완료\n`);
    
    console.log('✅ 전체 삭제 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 삭제 결과:`);
    console.log(`   - 승인 대기 매니저: ${deletedManagers.count}명`);
    console.log(`   - 본부: ${headquarters.length}개`);
    console.log(`   - 지사: ${branches.length}개`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 새로운 시스템으로 세팅 준비 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetData();
