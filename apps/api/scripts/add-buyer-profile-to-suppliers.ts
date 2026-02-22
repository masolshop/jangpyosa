/**
 * 기존 표준사업장 회사에 BuyerProfile 추가
 * 표준사업장도 장애인 직원을 고용하므로 buyerProfile이 필요함
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 기존 표준사업장 회사 확인 중...');

  // 표준사업장 회사 중 buyerProfile이 없는 회사 조회
  const suppliers = await prisma.company.findMany({
    where: {
      type: 'SUPPLIER',
      buyerProfile: null,
    },
    include: {
      supplierProfile: true,
      buyerProfile: true,
    },
  });

  console.log(`📊 buyerProfile이 없는 표준사업장: ${suppliers.length}개`);

  if (suppliers.length === 0) {
    console.log('✅ 모든 표준사업장에 buyerProfile이 이미 있습니다.');
    return;
  }

  // 각 표준사업장에 buyerProfile 추가
  for (const company of suppliers) {
    console.log(`\n➡️  ${company.name} (${company.bizNo})`);
    
    try {
      await prisma.buyerProfile.create({
        data: {
          companyId: company.id,
        },
      });
      console.log('   ✅ buyerProfile 추가 완료');
    } catch (error: any) {
      console.error(`   ❌ 오류: ${error.message}`);
    }
  }

  // 결과 확인
  console.log('\n📊 최종 결과:');
  const allSuppliers = await prisma.company.findMany({
    where: { type: 'SUPPLIER' },
    include: {
      supplierProfile: true,
      buyerProfile: true,
    },
  });

  const withBuyerProfile = allSuppliers.filter(c => c.buyerProfile !== null).length;
  console.log(`✅ buyerProfile이 있는 표준사업장: ${withBuyerProfile}/${allSuppliers.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
