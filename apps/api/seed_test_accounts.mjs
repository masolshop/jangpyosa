import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 시드 데이터 생성 시작...\n');

    // 1. 슈퍼어드민
    const admin = await prisma.user.upsert({
      where: { phone: '01012345678' },
      update: {},
      create: {
        phone: '01012345678',
        passwordHash: await bcrypt.hash('admin1234', 10),
        name: '슈퍼관리자',
        role: 'SUPER_ADMIN',
        email: 'admin@jangpyosa.com',
        privacyAgreed: true,
        privacyAgreedAt: new Date()
      }
    });
    console.log('✅ 슈퍼어드민 생성:', admin.phone);

    // 2. 지사 생성
    const branch = await prisma.branch.upsert({
      where: { name: '본사' },
      update: {},
      create: {
        name: '본사',
        code: 'HQ',
        
        
      }
    });
    console.log('✅ 지사 생성:', branch.name);

    // 3. 매니저
    const agent = await prisma.user.upsert({
      where: { phone: '01098765432' },
      update: {},
      create: {
        phone: '01098765432',
        passwordHash: await bcrypt.hash('agent1234', 10),
        name: '김매니저',
        role: 'AGENT',
        email: 'agent@jangpyosa.com',
        branchId: branch.id,
        refCode: 'MGR001',
        privacyAgreed: true,
        privacyAgreedAt: new Date()
      }
    });
    console.log('✅ 매니저 생성:', agent.phone);

    // 4. 표준사업장
    const supplierCompany = await prisma.company.upsert({
      where: { bizNo: '1234567890' },
      update: {},
      create: {
        name: '행복한표준사업장',
        bizNo: '1234567890',
        representative: '이대표',
        type: 'SUPPLIER',
        isVerified: true,
        apickData: JSON.stringify({ verified: true }),
        ownerUserId: ''  // 임시
      }
    });

    const supplier = await prisma.user.upsert({
      where: { phone: '01099998888' },
      update: {},
      create: {
        phone: '01099998888',
        username: 'supplier01',
        passwordHash: await bcrypt.hash('test1234', 10),
        name: '표준사업장',
        role: 'SUPPLIER',
        
        managerTitle: '대리',
        managerEmail: 'supplier@example.com',
        
        privacyAgreed: true,
        privacyAgreedAt: new Date()
      }
    });

    await prisma.company.update({
      where: { id: supplierCompany.id },
      data: { ownerUserId: supplier.id }
    });

    // supplier profile 생성
    await prisma.supplierProfile.upsert({
      where: { userId: supplier.id },
      update: {},
      create: {
        userId: supplier.id,
        companyId: supplierCompany.id
      }
    });

    console.log('✅ 표준사업장 생성:', supplier.username, supplier.phone);

    // 5. 고용의무기업 - 민간1 (3.1%)
    const buyer1Company = await prisma.company.upsert({
      where: { bizNo: '1111122222' },
      update: {},
      create: {
        name: '민간기업1',
        bizNo: '1111122222',
        representative: '최대표',
        type: 'BUYER',
        buyerType: 'PRIVATE_COMPANY',
        isVerified: true,
        apickData: JSON.stringify({ verified: true }),
        ownerUserId: ''
      }
    });

    const buyer1 = await prisma.user.upsert({
      where: { phone: '01055556666' },
      update: {},
      create: {
        phone: '01055556666',
        username: 'buyer01',
        passwordHash: await bcrypt.hash('test1234', 10),
        name: '민간기업1',
        role: 'BUYER',
        
        managerTitle: '과장',
        managerEmail: 'buyer1@example.com',
        
        referredById: agent.id,
        privacyAgreed: true,
        privacyAgreedAt: new Date()
      }
    });

    await prisma.company.update({
      where: { id: buyer1Company.id },
      data: { ownerUserId: buyer1.id }
    });

    await prisma.buyerProfile.upsert({
      where: { userId: buyer1.id },
      update: {},
      create: {
        userId: buyer1.id,
        companyId: buyer1Company.id
      }
    });

    console.log('✅ 민간기업1 생성:', buyer1.username, buyer1.phone);

    // 6. 고용의무기업 - 민간2 (3.1%)
    const buyer2Company = await prisma.company.upsert({
      where: { bizNo: '2222233333' },
      update: {},
      create: {
        name: '민간기업2',
        bizNo: '2222233333',
        representative: '박대표',
        type: 'BUYER',
        buyerType: 'PRIVATE_COMPANY',
        isVerified: true,
        apickData: JSON.stringify({ verified: true }),
        ownerUserId: ''
      }
    });

    const buyer2 = await prisma.user.upsert({
      where: { phone: '01011112222' },
      update: {},
      create: {
        phone: '01011112222',
        username: 'buyer02',
        passwordHash: await bcrypt.hash('test1234', 10),
        name: '민간기업2',
        role: 'BUYER',
        
        managerTitle: '대리',
        managerEmail: 'buyer2@example.com',
        
        referredById: agent.id,
        privacyAgreed: true,
        privacyAgreedAt: new Date()
      }
    });

    await prisma.company.update({
      where: { id: buyer2Company.id },
      data: { ownerUserId: buyer2.id }
    });

    await prisma.buyerProfile.upsert({
      where: { userId: buyer2.id },
      update: {},
      create: {
        userId: buyer2.id,
        companyId: buyer2Company.id
      }
    });

    console.log('✅ 민간기업2 생성:', buyer2.username, buyer2.phone);

    // 7. 고용의무기업 - 공공1 (3.8%)
    const buyer3Company = await prisma.company.upsert({
      where: { bizNo: '3333344444' },
      update: {},
      create: {
        name: '공공기관1',
        bizNo: '3333344444',
        representative: '정대표',
        type: 'BUYER',
        buyerType: 'PUBLIC_INSTITUTION',
        isVerified: true,
        apickData: JSON.stringify({ verified: true }),
        ownerUserId: ''
      }
    });

    const buyer3 = await prisma.user.upsert({
      where: { phone: '01077778888' },
      update: {},
      create: {
        phone: '01077778888',
        username: 'buyer03',
        passwordHash: await bcrypt.hash('test1234', 10),
        name: '공공기관1',
        role: 'BUYER',
        
        managerTitle: '부장',
        managerEmail: 'buyer3@example.com',
        
        referredById: agent.id,
        privacyAgreed: true,
        privacyAgreedAt: new Date()
      }
    });

    await prisma.company.update({
      where: { id: buyer3Company.id },
      data: { ownerUserId: buyer3.id }
    });

    await prisma.buyerProfile.upsert({
      where: { userId: buyer3.id },
      update: {},
      create: {
        userId: buyer3.id,
        companyId: buyer3Company.id
      }
    });

    console.log('✅ 공공기관1 생성:', buyer3.username, buyer3.phone);

    // 8. 고용의무기업 - 공공2 (3.8%)
    const buyer4Company = await prisma.company.upsert({
      where: { bizNo: '4444455555' },
      update: {},
      create: {
        name: '공공기관2',
        bizNo: '4444455555',
        representative: '강대표',
        type: 'BUYER',
        buyerType: 'PUBLIC_INSTITUTION',
        isVerified: true,
        apickData: JSON.stringify({ verified: true }),
        ownerUserId: ''
      }
    });

    const buyer4 = await prisma.user.upsert({
      where: { phone: '01044445555' },
      update: {},
      create: {
        phone: '01044445555',
        username: 'buyer04',
        passwordHash: await bcrypt.hash('test1234', 10),
        name: '공공기관2',
        role: 'BUYER',
        
        managerTitle: '차장',
        managerEmail: 'buyer4@example.com',
        
        referredById: agent.id,
        privacyAgreed: true,
        privacyAgreedAt: new Date()
      }
    });

    await prisma.company.update({
      where: { id: buyer4Company.id },
      data: { ownerUserId: buyer4.id }
    });

    await prisma.buyerProfile.upsert({
      where: { userId: buyer4.id },
      update: {},
      create: {
        userId: buyer4.id,
        companyId: buyer4Company.id
      }
    });

    console.log('✅ 공공기관2 생성:', buyer4.username, buyer4.phone);

    // 9. 고용의무기업 - 국가1 (3.8% + 감면)
    const buyer5Company = await prisma.company.upsert({
      where: { bizNo: '5555566666' },
      update: {},
      create: {
        name: '교육청1',
        bizNo: '5555566666',
        representative: '윤대표',
        type: 'BUYER',
        buyerType: 'GOVERNMENT',
        isVerified: true,
        apickData: JSON.stringify({ verified: true }),
        ownerUserId: ''
      }
    });

    const buyer5 = await prisma.user.upsert({
      where: { phone: '01099990000' },
      update: {},
      create: {
        phone: '01099990000',
        username: 'buyer05',
        passwordHash: await bcrypt.hash('test1234', 10),
        name: '교육청1',
        role: 'BUYER',
        
        managerTitle: '교육사',
        managerEmail: 'buyer5@example.com',
        
        referredById: agent.id,
        privacyAgreed: true,
        privacyAgreedAt: new Date()
      }
    });

    await prisma.company.update({
      where: { id: buyer5Company.id },
      data: { ownerUserId: buyer5.id }
    });

    await prisma.buyerProfile.upsert({
      where: { userId: buyer5.id },
      update: {},
      create: {
        userId: buyer5.id,
        companyId: buyer5Company.id
      }
    });

    console.log('✅ 교육청1 생성:', buyer5.username, buyer5.phone);

    // 10. 고용의무기업 - 국가2 (3.8% + 감면)
    const buyer6Company = await prisma.company.upsert({
      where: { bizNo: '6666677777' },
      update: {},
      create: {
        name: '지자체1',
        bizNo: '6666677777',
        representative: '임대표',
        type: 'BUYER',
        buyerType: 'GOVERNMENT',
        isVerified: true,
        apickData: JSON.stringify({ verified: true }),
        ownerUserId: ''
      }
    });

    const buyer6 = await prisma.user.upsert({
      where: { phone: '01098889999' },
      update: {},
      create: {
        phone: '01098889999',
        username: 'buyer06',
        passwordHash: await bcrypt.hash('test1234', 10),
        name: '지자체1',
        role: 'BUYER',
        
        managerTitle: '주무관',
        managerEmail: 'buyer6@example.com',
        
        referredById: agent.id,
        privacyAgreed: true,
        privacyAgreedAt: new Date()
      }
    });

    await prisma.company.update({
      where: { id: buyer6Company.id },
      data: { ownerUserId: buyer6.id }
    });

    await prisma.buyerProfile.upsert({
      where: { userId: buyer6.id },
      update: {},
      create: {
        userId: buyer6.id,
        companyId: buyer6Company.id
      }
    });

    console.log('✅ 지자체1 생성:', buyer6.username, buyer6.phone);

    console.log('\n✅ 시드 데이터 생성 완료!');

  } catch (error) {
    console.error('❌ 에러:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
