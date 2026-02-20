import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateBuyer01FromApick() {
  try {
    console.log('\n🔍 APICK API에서 사업자번호 2668101215 정보 조회 중...\n');
    
    // APICK API 호출
    const response = await fetch('https://api.odcloud.kr/api/apipbltc/v1/15043423/v1/uddi:c79eb4eb-ef54-4bc3-9e78-64db3711b37f', {
      method: 'GET',
      headers: {
        'Authorization': 'Infuser kPEpS/RQhEJ8d+GmhWVaPPgD88EWAJTj7+HLkxFOoKyfVrffiKMi8M4fGZdLR96hgEJI8ktZaI+3IJNHA+fAKw==',
      }
    });
    
    if (!response.ok) {
      throw new Error(`APICK API 호출 실패: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      console.log('❌ APICK 데이터가 없습니다.');
      return;
    }
    
    // 2668101215 사업자번호 찾기
    const targetCompany = data.data.find(item => 
      item['사업자등록번호'] === '2668101215' || 
      item['사업자등록번호'] === '266-81-01215'
    );
    
    if (!targetCompany) {
      console.log('❌ 사업자번호 2668101215를 찾을 수 없습니다.');
      console.log('\n사용 가능한 사업자번호 (처음 5개):');
      data.data.slice(0, 5).forEach(item => {
        console.log(`- ${item['사업자등록번호']}: ${item['표준사업장명칭']}`);
      });
      return;
    }
    
    console.log('✅ APICK 데이터 찾음:\n');
    console.log(`사업자번호: ${targetCompany['사업자등록번호']}`);
    console.log(`표준사업장명칭: ${targetCompany['표준사업장명칭']}`);
    console.log(`대표자명: ${targetCompany['대표자명']}`);
    console.log(`소재지: ${targetCompany['소재지(도로명)']}`);
    
    // buyer01의 회사 정보 업데이트
    console.log('\n🔧 buyer01 회사 정보 업데이트 중...\n');
    
    const user = await prisma.user.findFirst({
      where: { username: 'buyer01' },
      include: { company: true }
    });
    
    if (!user || !user.company) {
      console.log('❌ buyer01 또는 회사 정보를 찾을 수 없습니다.');
      return;
    }
    
    console.log('현재 회사명:', user.company.name);
    
    // 회사 정보 업데이트
    const updatedCompany = await prisma.company.update({
      where: { id: user.company.id },
      data: {
        name: targetCompany['표준사업장명칭'],
        representative: targetCompany['대표자명'] || user.company.representative,
        apickData: JSON.stringify(targetCompany),
      }
    });
    
    console.log('✅ 회사 정보 업데이트 완료!\n');
    console.log(`새 회사명: ${updatedCompany.name}`);
    console.log(`대표자: ${updatedCompany.representative}`);
    
    console.log('\n📋 출퇴근 화면 표시 예시:');
    console.log(`${updatedCompany.name} / 홍길동`);
    
  } catch (error) {
    console.error('에러:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateBuyer01FromApick();
