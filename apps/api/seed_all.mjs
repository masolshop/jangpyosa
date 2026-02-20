import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 전체 시드 데이터 생성 시작...\n');

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
    console.log('✅ 슈퍼어드민:', admin.phone);

    // 2. 지사 생성
    const branch = await prisma.branch.upsert({
      where: { name: '본사' },
      update: {},
      create: {
        name: '본사',
        code: 'HQ'
      }
    });

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
    console.log('✅ 매니저:', agent.phone);

    // 4. 표준사업장
    const supplier = await prisma.user.create({
      data: {
        phone: '01099998888',
        username: 'supplier01',
        passwordHash: await bcrypt.hash('test1234', 10),
        name: '표준사업장',
        role: 'SUPPLIER',
        managerName: '박담당',
        managerTitle: '대리',
        managerEmail: 'supplier@example.com',
        managerPhone: '01099998888',
        privacyAgreed: true,
        privacyAgreedAt: new Date(),
        company: {
          create: {
            name: '행복한표준사업장',
            bizNo: '1234567890',
            representative: '이대표',
            type: 'SUPPLIER',
            isVerified: true,
            apickData: JSON.stringify({ verified: true }),
            supplierProfile: {
              create: {
                approved: true
              }
            }
          }
        }
      },
      include: { company: true }
    });
    console.log('✅ 표준사업장:', supplier.username);

    // 5. 고용의무기업들
    const buyers = [
      { phone: '01055556666', username: 'buyer01', companyName: '민간기업1', bizNo: '1111122222', buyerType: 'PRIVATE_COMPANY', managerName: '김과장' },
      { phone: '01011112222', username: 'buyer02', companyName: '민간기업2', bizNo: '2222233333', buyerType: 'PRIVATE_COMPANY', managerName: '이대리' },
      { phone: '01077778888', username: 'buyer03', companyName: '공공기관1', bizNo: '3333344444', buyerType: 'PUBLIC_INSTITUTION', managerName: '최부장' },
      { phone: '01044445555', username: 'buyer04', companyName: '공공기관2', bizNo: '4444455555', buyerType: 'PUBLIC_INSTITUTION', managerName: '조차장' },
      { phone: '01099990000', username: 'buyer05', companyName: '교육청1', bizNo: '5555566666', buyerType: 'GOVERNMENT', managerName: '한교육사' },
      { phone: '01098889999', username: 'buyer06', companyName: '지자체1', bizNo: '6666677777', buyerType: 'GOVERNMENT', managerName: '신주무관' }
    ];

    for (const buyerData of buyers) {
      const buyer = await prisma.user.create({
        data: {
          phone: buyerData.phone,
          username: buyerData.username,
          passwordHash: await bcrypt.hash('test1234', 10),
          name: buyerData.companyName,
          role: 'BUYER',
          managerName: buyerData.managerName,
          managerTitle: '담당자',
          managerEmail: `${buyerData.username}@example.com`,
          managerPhone: buyerData.phone,
          referredById: agent.id,
          privacyAgreed: true,
          privacyAgreedAt: new Date(),
          company: {
            create: {
              name: buyerData.companyName,
              bizNo: buyerData.bizNo,
              representative: `${buyerData.companyName} 대표`,
              type: 'BUYER',
              buyerType: buyerData.buyerType,
              isVerified: true,
              apickData: JSON.stringify({ verified: true }),
              buyerProfile: {
                create: {
                  employeeCount: 0,
                  disabledCount: 0
                }
              }
            }
          }
        },
        include: { company: true }
      });

      const typeLabel = buyerData.buyerType === 'PRIVATE_COMPANY' ? '민간(3.1%)' :
                        buyerData.buyerType === 'PUBLIC_INSTITUTION' ? '공공(3.8%)' : '국가/지자체(3.8%+감면)';
      console.log(`✅ ${typeLabel}: ${buyer.username}`);
    }

    console.log('\n✅ 전체 시드 데이터 생성 완료!');

  } catch (error) {
    console.error('❌ 에러:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
