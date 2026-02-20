import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getApickAndRegister() {
  try {
    console.log('\n🔍 APICK API에서 사업자번호 2668101215 조회 중...\n');
    
    // APICK API 호출
    const response = await fetch('https://api.odcloud.kr/api/apipbltc/v1/15043423/v1/uddi:c79eb4eb-ef54-4bc3-9e78-64db3711b37f?page=1&perPage=10000', {
      method: 'GET',
      headers: {
        'Authorization': 'Infuser kPEpS/RQhEJ8d+GmhWVaPPgD88EWAJTj7+HLkxFOoKyfVrffiKMi8M4fGZdLR96hgEJI8ktZaI+3IJNHA+fAKw==',
      }
    });
    
    if (!response.ok) {
      console.log(`❌ APICK API 호출 실패: ${response.status}`);
      console.log('응답:', await response.text());
      return;
    }
    
    const data = await response.json();
    console.log(`✅ APICK 데이터 수신: 총 ${data.data?.length || 0}개 기업\n`);
    
    if (!data.data || data.data.length === 0) {
      console.log('❌ APICK 데이터가 없습니다.');
      return;
    }
    
    // 2668101215 사업자번호 찾기
    const targetCompany = data.data.find(item => {
      const bizNo = item['사업자등록번호']?.replace(/-/g, '');
      return bizNo === '2668101215';
    });
    
    if (!targetCompany) {
      console.log('❌ 사업자번호 2668101215를 찾을 수 없습니다.\n');
      console.log('사용 가능한 사업자번호 (처음 10개):');
      data.data.slice(0, 10).forEach(item => {
        console.log(`- ${item['사업자등록번호']}: ${item['표준사업장명칭']}`);
      });
      return;
    }
    
    console.log('✅ APICK에서 기업 정보 찾음:\n');
    console.log(`📋 기업 정보:`);
    console.log(`  사업자번호: ${targetCompany['사업자등록번호']}`);
    console.log(`  표준사업장명칭: ${targetCompany['표준사업장명칭']}`);
    console.log(`  대표자명: ${targetCompany['대표자명']}`);
    console.log(`  소재지(도로명): ${targetCompany['소재지(도로명)']}`);
    console.log(`  업종: ${targetCompany['업종']}`);
    console.log();
    
    // buyer01 회사 정보 업데이트
    console.log('🔧 buyer01 회사 정보 업데이트 중...\n');
    
    const user = await prisma.user.findFirst({
      where: { username: 'buyer01' },
      include: { company: true }
    });
    
    if (!user || !user.company) {
      console.log('❌ buyer01 또는 회사 정보를 찾을 수 없습니다.');
      return;
    }
    
    const bizNo = targetCompany['사업자등록번호'].replace(/-/g, '');
    
    const updatedCompany = await prisma.company.update({
      where: { id: user.company.id },
      data: {
        name: targetCompany['표준사업장명칭'],
        bizNo: bizNo,
        representative: targetCompany['대표자명'] || user.company.representative,
        apickData: JSON.stringify(targetCompany),
      }
    });
    
    console.log('✅ 회사 정보 업데이트 완료:');
    console.log(`  회사명: ${updatedCompany.name}`);
    console.log(`  사업자번호: ${updatedCompany.bizNo}`);
    console.log(`  대표자: ${updatedCompany.representative}`);
    console.log();
    
    console.log('📋 다음 단계:');
    console.log('  1. 홍길동 DisabledEmployee 등록');
    console.log('  2. 홍길동 User 계정 생성');
    console.log('  3. 로그인 테스트');
    console.log();
    console.log(`📋 출퇴근 화면 표시 예시: ${updatedCompany.name} / 홍길동`);
    
  } catch (error) {
    console.error('에러:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getApickAndRegister();
