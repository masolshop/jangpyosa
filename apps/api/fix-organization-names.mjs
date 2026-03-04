import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('\n🔧 조직명 수정 스크립트\n');
  
  const orgs = await prisma.organization.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      type: true,
      leaderName: true,
    },
  });
  
  console.log(`📊 총 ${orgs.length}개 조직 확인 중...\n`);
  
  const fixes = [];
  
  orgs.forEach((org) => {
    // 본부명이 개인 이름처럼 보이는 경우 (2-3글자 한글 이름)
    const isPersonName = /^[가-힣]{2,3}$/.test(org.name);
    
    if (isPersonName && org.name === org.leaderName) {
      // 본부명과 본부장명이 같은 경우
      const newName = org.type === 'HEADQUARTERS' 
        ? `${org.name}본부` 
        : `${org.name}지사`;
      
      fixes.push({
        id: org.id,
        type: org.type,
        oldName: org.name,
        newName: newName,
        leaderName: org.leaderName,
      });
    }
  });
  
  if (fixes.length === 0) {
    console.log('✅ 수정이 필요한 조직이 없습니다.\n');
    return;
  }
  
  console.log(`⚠️  수정 필요한 조직: ${fixes.length}개\n`);
  
  fixes.forEach((fix, i) => {
    console.log(`${i + 1}. ${fix.type === 'HEADQUARTERS' ? '🏢 본부' : '🏪 지사'}`);
    console.log(`   조직명: "${fix.oldName}" → "${fix.newName}"`);
    console.log(`   ${fix.type === 'HEADQUARTERS' ? '본부장' : '지사장'}: ${fix.leaderName}\n`);
  });
  
  console.log('📝 수정을 진행합니다...\n');
  
  for (const fix of fixes) {
    await prisma.organization.update({
      where: { id: fix.id },
      data: { name: fix.newName },
    });
    console.log(`✅ "${fix.oldName}" → "${fix.newName}" 수정 완료`);
  }
  
  console.log(`\n✨ 총 ${fixes.length}개 조직 수정 완료!\n`);
}

main()
  .catch((error) => {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
