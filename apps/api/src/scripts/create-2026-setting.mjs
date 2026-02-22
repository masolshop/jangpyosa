import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('====================================');
  console.log('2026년 기준 연도 설정 생성');
  console.log('====================================\n');
  
  try {
    // 기존 2026년 설정 확인
    const existing = await prisma.yearSetting.findUnique({
      where: { year: 2026 }
    });
    
    if (existing) {
      console.log('ℹ️  2026년 설정이 이미 존재합니다. 업데이트합니다...');
      
      const updated = await prisma.yearSetting.update({
        where: { year: 2026 },
        data: {
          privateQuotaRate: 0.031,        // 민간기업 3.1%
          publicQuotaRate: 0.038,          // 공공기관 3.8%
          baseLevyAmount: 2156880,         // 2026년 최저 월급여
          maxReductionRate: 0.9,           // 최대 감면율 90%
          maxReductionByContract: 0.5,     // 도급액 대비 최대 감면율 50%
        }
      });
      
      console.log('✅ 2026년 설정 업데이트 완료:');
      console.log(JSON.stringify(updated, null, 2));
    } else {
      console.log('🔧 2026년 설정 생성 중...');
      
      const created = await prisma.yearSetting.create({
        data: {
          year: 2026,
          privateQuotaRate: 0.031,
          publicQuotaRate: 0.038,
          baseLevyAmount: 2156880,
          maxReductionRate: 0.9,
          maxReductionByContract: 0.5,
        }
      });
      
      console.log('✅ 2026년 설정 생성 완료:');
      console.log(JSON.stringify(created, null, 2));
    }
    
    // 확인
    console.log('\n📋 전체 연도 설정:');
    const all = await prisma.yearSetting.findMany({
      orderBy: { year: 'desc' }
    });
    
    all.forEach(s => {
      console.log(`  ${s.year}년: baseLevyAmount=${s.baseLevyAmount.toLocaleString()}원, privateQuotaRate=${(s.privateQuotaRate * 100).toFixed(1)}%`);
    });
    
    console.log('\n====================================');
    console.log('✅ 완료');
    console.log('====================================');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
