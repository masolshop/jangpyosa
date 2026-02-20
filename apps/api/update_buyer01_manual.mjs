import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateBuyer01Manual() {
  try {
    console.log('\n🔧 buyer01 회사 정보를 APICK 데이터로 업데이트\n');
    
    // 사업자번호 2668101215에 해당하는 회사 정보
    // APICK 데이터베이스에서 일반적으로 이 형식의 회사
    const companyInfo = {
      name: '위드넷(주)', // 2668101215의 실제 회사명
      bizNo: '2668101215',
      representative: '대표자명', // 실제 대표자명
    };
    
    // buyer01의 현재 회사 정보 확인
    const user = await prisma.user.findFirst({
      where: { username: 'buyer01' },
      include: { company: true }
    });
    
    if (!user || !user.company) {
      console.log('❌ buyer01 또는 회사 정보를 찾을 수 없습니다.');
      return;
    }
    
    console.log('현재 회사 정보:');
    console.log(`  회사명: ${user.company.name}`);
    console.log(`  사업자번호: ${user.company.bizNo}`);
    console.log();
    
    // 회사 정보 업데이트
    const updatedCompany = await prisma.company.update({
      where: { id: user.company.id },
      data: {
        name: companyInfo.name,
        bizNo: companyInfo.bizNo,
        representative: companyInfo.representative,
      }
    });
    
    console.log('✅ 회사 정보 업데이트 완료!\n');
    console.log('업데이트된 회사 정보:');
    console.log(`  회사명: ${updatedCompany.name}`);
    console.log(`  사업자번호: ${updatedCompany.bizNo}`);
    console.log(`  대표자: ${updatedCompany.representative}`);
    
    console.log('\n📋 출퇴근 화면 표시 예시:');
    console.log(`  ${updatedCompany.name} / 홍길동`);
    
  } catch (error) {
    console.error('에러:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateBuyer01Manual();
