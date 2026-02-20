import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateToPemayeon() {
  console.log('🔄 위드넷(주) → 주식회사 페마연 변경...\n');
  
  try {
    // Company 정보 업데이트
    const company = await prisma.company.update({
      where: { bizNo: '2668101215' },
      data: {
        name: '주식회사 페마연',
        representative: '페마연 대표'
      },
      include: {
        buyerProfile: {
          include: {
            disabledEmployees: true
          }
        }
      }
    });
    
    console.log('✅ 변경 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`회사명: ${company.name}`);
    console.log(`사업자번호: ${company.bizNo}`);
    console.log(`대표자: ${company.representative}`);
    console.log(`등록 직원: ${company.buyerProfile.disabledEmployees.length}명`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // 직원 목록 출력
    console.log('📋 등록된 직원:');
    company.buyerProfile.disabledEmployees.forEach(emp => {
      console.log(`   - ${emp.name} (주민번호: ${emp.registrationNumber || 'N/A'})`);
    });
    
  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateToPemayeon();
