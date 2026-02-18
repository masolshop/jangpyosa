// 기존 데이터 마이그레이션 스크립트
// Company.buyerType 필드를 User.companyType 기반으로 업데이트

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting data migration...\n');

  // 1. 모든 BUYER 유저 조회
  const buyers = await prisma.user.findMany({
    where: { role: 'BUYER' },
    include: { company: true }
  });

  console.log(`📊 Found ${buyers.length} BUYER users\n`);

  for (const buyer of buyers) {
    if (!buyer.company) {
      console.log(`⚠️  User ${buyer.name} (${buyer.phone}) has no company - skipping`);
      continue;
    }

    // User.companyType을 Company.buyerType으로 매핑
    let buyerType = 'PRIVATE_COMPANY'; // 기본값

    if (buyer.companyType === 'PRIVATE') {
      buyerType = 'PRIVATE_COMPANY';
    } else if (buyer.companyType === 'GOVERNMENT') {
      buyerType = 'GOVERNMENT';
    }

    // Company 업데이트
    await prisma.company.update({
      where: { id: buyer.company.id },
      data: { buyerType }
    });

    console.log(`✅ Updated company "${buyer.company.name}"`);
    console.log(`   - User: ${buyer.name} (${buyer.phone})`);
    console.log(`   - User.companyType: ${buyer.companyType || 'null'}`);
    console.log(`   - Company.buyerType: ${buyerType}\n`);
  }

  // 2. "주식회사 페마연" 특별 처리 (데모 계정)
  const femaCompany = await prisma.company.findFirst({
    where: { name: { contains: '페마연' } },
    include: { buyerProfile: true, ownerUser: true }
  });

  if (femaCompany && !femaCompany.buyerType) {
    await prisma.company.update({
      where: { id: femaCompany.id },
      data: { buyerType: 'PRIVATE_COMPANY' }
    });
    console.log(`✅ Special: Set "주식회사 페마연" as PRIVATE_COMPANY (민간기업 데모)\n`);
  }

  console.log('✅ Data migration completed!\n');

  // 결과 확인
  const companies = await prisma.company.findMany({
    where: { type: 'BUYER' },
    select: {
      name: true,
      bizNo: true,
      buyerType: true,
      ownerUser: {
        select: { name: true, phone: true, companyType: true }
      }
    }
  });

  console.log('📋 Final state of BUYER companies:');
  console.table(companies.map(c => ({
    회사명: c.name,
    사업자번호: c.bizNo,
    'Company.buyerType': c.buyerType,
    '대표자': c.ownerUser.name,
    'User.companyType': c.ownerUser.companyType
  })));
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
