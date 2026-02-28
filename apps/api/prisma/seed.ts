import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('\n🗑️ Clearing existing test data...');
  await prisma.leaveRequest.deleteMany({});
  await prisma.leaveType.deleteMany({});
  await prisma.annualLeaveBalance.deleteMany({});
  await prisma.disabledEmployee.deleteMany({});
  await prisma.buyerProfile.deleteMany({});
  await prisma.supplierProfile.deleteMany({});
  await prisma.company.deleteMany({ where: { bizNo: { in: ['1234567890', '2345678901', '3456789012'] } } });
  await prisma.user.deleteMany({ where: { phone: { startsWith: '010-1000' } } });
  await prisma.user.deleteMany({ where: { phone: { startsWith: '010-2000' } } });
  await prisma.user.deleteMany({ where: { phone: { startsWith: '010-3000' } } });
  console.log('✅ Test data cleared');

  // 1. Create admin users first (without company)
  console.log('\n👤 Creating admin users...');
  
  const passwordHash = await bcrypt.hash('test1234', 10);

  const pemaAdmin = await prisma.user.create({
    data: {
      phone: '010-1000-0001',
      username: 'pema_admin',
      email: 'admin@pema.com',
      passwordHash,
      name: '김관리자',
      role: 'BUYER',
      managerName: '김관리자',
      managerTitle: '인사팀장',
      managerEmail: 'admin@pema.com',
      managerPhone: '010-1000-0001',
      privacyAgreed: true,
      privacyAgreedAt: new Date()
    }
  });

  const publicAdmin = await prisma.user.create({
    data: {
      phone: '010-2000-0001',
      username: 'public_admin',
      email: 'admin@public.go.kr',
      passwordHash,
      name: '이관리자',
      role: 'BUYER',
      managerName: '이관리자',
      managerTitle: '총무과장',
      managerEmail: 'admin@public.go.kr',
      managerPhone: '010-2000-0001',
      privacyAgreed: true,
      privacyAgreedAt: new Date()
    }
  });

  const standardAdmin = await prisma.user.create({
    data: {
      phone: '010-3000-0001',
      username: 'standard_admin',
      email: 'admin@happy-standard.com',
      passwordHash,
      name: '박관리자',
      role: 'SUPPLIER',
      managerName: '박관리자',
      managerTitle: '총무팀장',
      managerEmail: 'admin@happy-standard.com',
      managerPhone: '010-3000-0001',
      privacyAgreed: true,
      privacyAgreedAt: new Date()
    }
  });

  console.log('✅ Admin users created');

  // 2. Create test companies
  console.log('\n📦 Creating companies...');
  
  const pemaCompany = await prisma.company.create({
    data: {
      name: '페마연구소',
      bizNo: '1234567890',
      representative: '김대표',
      type: 'BUYER',
      buyerType: 'PRIVATE_COMPANY',
      isVerified: true,
      attachmentEmail: 'hr@pema.com',
      ownerUserId: pemaAdmin.id
    }
  });

  const publicCompany = await prisma.company.create({
    data: {
      name: '공공기관A',
      bizNo: '2345678901',
      representative: '이기관',
      type: 'BUYER',
      buyerType: 'PUBLIC_INSTITUTION',
      isVerified: true,
      attachmentEmail: 'hr@public.go.kr',
      ownerUserId: publicAdmin.id
    }
  });

  const standardCompany = await prisma.company.create({
    data: {
      name: '행복한표준사업장',
      bizNo: '3456789012',
      representative: '박표준',
      type: 'SUPPLIER',
      isVerified: true,
      attachmentEmail: 'info@happy-standard.com',
      ownerUserId: standardAdmin.id
    }
  });

  console.log('✅ Companies created');

  // 3. Update users with company IDs
  await prisma.user.update({
    where: { id: pemaAdmin.id },
    data: { companyId: pemaCompany.id, isCompanyOwner: true }
  });

  await prisma.user.update({
    where: { id: publicAdmin.id },
    data: { companyId: publicCompany.id, isCompanyOwner: true }
  });

  await prisma.user.update({
    where: { id: standardAdmin.id },
    data: { companyId: standardCompany.id, isCompanyOwner: true }
  });

  // 4. Create BuyerProfiles
  console.log('\n👥 Creating BuyerProfiles...');
  
  const pemaBuyer = await prisma.buyerProfile.create({
    data: {
      companyId: pemaCompany.id,
      employeeCount: 45,
      disabledCount: 0, // Will be calculated
      hasLevyExemption: false
    }
  });

  const publicBuyer = await prisma.buyerProfile.create({
    data: {
      companyId: publicCompany.id,
      employeeCount: 38,
      disabledCount: 0,
      hasLevyExemption: false
    }
  });

  const standardBuyer = await prisma.buyerProfile.create({
    data: {
      companyId: standardCompany.id,
      employeeCount: 25,
      disabledCount: 0,
      hasLevyExemption: false
    }
  });

  console.log('✅ BuyerProfiles created');

  // 5. Create SupplierProfile for standard company
  console.log('\n🏢 Creating SupplierProfile...');
  
  await prisma.supplierProfile.create({
    data: {
      companyId: standardCompany.id,
      approved: true,
      region: '서울',
      industry: '제조업',
      contactName: '박담당',
      contactTel: '02-1234-5678'
    }
  });

  console.log('✅ SupplierProfile created');

  // 6. Create disabled employees
  console.log('\n👨‍💼 Creating disabled employees...');

  const employees = [
    // Pema employees (15) - phone: 010-1001-XXXX
    { name: '김철수', phone: '010-1001-0001', buyerId: pemaBuyer.id, hireDate: new Date('2020-01-01'), monthlySalary: 3000000, severity: 'SEVERE', type: '지체장애' },
    { name: '이영희', phone: '010-1001-0002', buyerId: pemaBuyer.id, hireDate: new Date('2021-03-15'), monthlySalary: 2800000, severity: 'MILD', type: '시각장애' },
    { name: '박민수', phone: '010-1001-0003', buyerId: pemaBuyer.id, hireDate: new Date('2022-06-01'), monthlySalary: 2600000, severity: 'SEVERE', type: '청각장애' },
    { name: '정수진', phone: '010-1001-0004', buyerId: pemaBuyer.id, hireDate: new Date('2023-01-10'), monthlySalary: 2500000, severity: 'MILD', type: '지적장애' },
    { name: '최동욱', phone: '010-1001-0005', buyerId: pemaBuyer.id, hireDate: new Date('2024-04-01'), monthlySalary: 2400000, severity: 'MILD', type: '지체장애' },
    { name: '한미래', phone: '010-1001-0006', buyerId: pemaBuyer.id, hireDate: new Date('2025-01-15'), monthlySalary: 2300000, severity: 'MILD', type: '시각장애' },
    { name: '강준호', phone: '010-1001-0007', buyerId: pemaBuyer.id, hireDate: new Date('2025-07-01'), monthlySalary: 2200000, severity: 'MILD', type: '청각장애' },
    { name: '윤서연', phone: '010-1001-0008', buyerId: pemaBuyer.id, hireDate: new Date('2019-05-01'), monthlySalary: 3200000, severity: 'SEVERE', type: '지체장애' },
    { name: '임하늘', phone: '010-1001-0009', buyerId: pemaBuyer.id, hireDate: new Date('2021-09-01'), monthlySalary: 2700000, severity: 'MILD', type: '지적장애' },
    { name: '오지훈', phone: '010-1001-0010', buyerId: pemaBuyer.id, hireDate: new Date('2022-11-15'), monthlySalary: 2600000, severity: 'MILD', type: '시각장애' },
    { name: '송민지', phone: '010-1001-0011', buyerId: pemaBuyer.id, hireDate: new Date('2023-08-01'), monthlySalary: 2500000, severity: 'MILD', type: '청각장애' },
    { name: '안지원', phone: '010-1001-0012', buyerId: pemaBuyer.id, hireDate: new Date('2024-02-01'), monthlySalary: 2400000, severity: 'MILD', type: '지체장애' },
    { name: '배성호', phone: '010-1001-0013', buyerId: pemaBuyer.id, hireDate: new Date('2024-10-01'), monthlySalary: 2300000, severity: 'MILD', type: '지적장애' },
    { name: '홍서준', phone: '010-1001-0014', buyerId: pemaBuyer.id, hireDate: new Date('2025-03-01'), monthlySalary: 2200000, severity: 'MILD', type: '시각장애' },
    { name: '양지수', phone: '010-1001-0015', buyerId: pemaBuyer.id, hireDate: new Date('2025-08-15'), monthlySalary: 2100000, severity: 'MILD', type: '청각장애' },
    
    // Public institution employees (12) - phone: 010-2001-XXXX
    { name: '서준영', phone: '010-2001-0001', buyerId: publicBuyer.id, hireDate: new Date('2020-03-01'), monthlySalary: 3100000, severity: 'SEVERE', type: '지체장애' },
    { name: '구민아', phone: '010-2001-0002', buyerId: publicBuyer.id, hireDate: new Date('2021-05-01'), monthlySalary: 2900000, severity: 'MILD', type: '시각장애' },
    { name: '신동혁', phone: '010-2001-0003', buyerId: publicBuyer.id, hireDate: new Date('2022-01-15'), monthlySalary: 2700000, severity: 'MILD', type: '청각장애' },
    { name: '권나연', phone: '010-2001-0004', buyerId: publicBuyer.id, hireDate: new Date('2023-04-01'), monthlySalary: 2600000, severity: 'MILD', type: '지적장애' },
    { name: '유재석', phone: '010-2001-0005', buyerId: publicBuyer.id, hireDate: new Date('2024-01-01'), monthlySalary: 2500000, severity: 'MILD', type: '지체장애' },
    { name: '문소희', phone: '010-2001-0006', buyerId: publicBuyer.id, hireDate: new Date('2024-07-01'), monthlySalary: 2400000, severity: 'MILD', type: '시각장애' },
    { name: '탁현수', phone: '010-2001-0007', buyerId: publicBuyer.id, hireDate: new Date('2025-02-01'), monthlySalary: 2300000, severity: 'MILD', type: '청각장애' },
    { name: '석지혜', phone: '010-2001-0008', buyerId: publicBuyer.id, hireDate: new Date('2025-06-15'), monthlySalary: 2200000, severity: 'MILD', type: '지체장애' },
    { name: '진민재', phone: '010-2001-0009', buyerId: publicBuyer.id, hireDate: new Date('2021-11-01'), monthlySalary: 2800000, severity: 'SEVERE', type: '지적장애' },
    { name: '표은지', phone: '010-2001-0010', buyerId: publicBuyer.id, hireDate: new Date('2022-08-15'), monthlySalary: 2700000, severity: 'MILD', type: '시각장애' },
    { name: '반다솜', phone: '010-2001-0011', buyerId: publicBuyer.id, hireDate: new Date('2023-10-01'), monthlySalary: 2600000, severity: 'MILD', type: '청각장애' },
    { name: '함태양', phone: '010-2001-0012', buyerId: publicBuyer.id, hireDate: new Date('2024-12-01'), monthlySalary: 2500000, severity: 'MILD', type: '지체장애' },
    
    // Standard company employees (15) - phone: 010-3001-XXXX
    { name: '차승환', phone: '010-3001-0001', buyerId: standardBuyer.id, hireDate: new Date('2019-01-01'), monthlySalary: 3300000, severity: 'SEVERE', type: '지체장애' },
    { name: '하유진', phone: '010-3001-0002', buyerId: standardBuyer.id, hireDate: new Date('2020-06-01'), monthlySalary: 3000000, severity: 'SEVERE', type: '시각장애' },
    { name: '추민호', phone: '010-3001-0003', buyerId: standardBuyer.id, hireDate: new Date('2021-01-15'), monthlySalary: 2800000, severity: 'MILD', type: '청각장애' },
    { name: '곽수연', phone: '010-3001-0004', buyerId: standardBuyer.id, hireDate: new Date('2022-03-01'), monthlySalary: 2700000, severity: 'MILD', type: '지적장애' },
    { name: '도재원', phone: '010-3001-0005', buyerId: standardBuyer.id, hireDate: new Date('2023-05-15'), monthlySalary: 2600000, severity: 'MILD', type: '지체장애' },
    { name: '소라', phone: '010-3001-0006', buyerId: standardBuyer.id, hireDate: new Date('2024-01-10'), monthlySalary: 2500000, severity: 'MILD', type: '시각장애' },
    { name: '노준서', phone: '010-3001-0007', buyerId: standardBuyer.id, hireDate: new Date('2024-08-01'), monthlySalary: 2400000, severity: 'MILD', type: '청각장애' },
    { name: '모정민', phone: '010-3001-0008', buyerId: standardBuyer.id, hireDate: new Date('2025-01-20'), monthlySalary: 2300000, severity: 'MILD', type: '지체장애' },
    { name: '조서윤', phone: '010-3001-0009', buyerId: standardBuyer.id, hireDate: new Date('2025-05-01'), monthlySalary: 2200000, severity: 'MILD', type: '지적장애' },
    { name: '용지안', phone: '010-3001-0010', buyerId: standardBuyer.id, hireDate: new Date('2020-09-01'), monthlySalary: 3100000, severity: 'SEVERE', type: '시각장애' },
    { name: '두시우', phone: '010-3001-0011', buyerId: standardBuyer.id, hireDate: new Date('2021-12-15'), monthlySalary: 2900000, severity: 'MILD', type: '청각장애' },
    { name: '마예린', phone: '010-3001-0012', buyerId: standardBuyer.id, hireDate: new Date('2022-10-01'), monthlySalary: 2700000, severity: 'MILD', type: '지체장애' },
    { name: '갈도윤', phone: '010-3001-0013', buyerId: standardBuyer.id, hireDate: new Date('2023-07-15'), monthlySalary: 2600000, severity: 'MILD', type: '지적장애' },
    { name: '여현우', phone: '010-3001-0014', buyerId: standardBuyer.id, hireDate: new Date('2024-05-01'), monthlySalary: 2500000, severity: 'MILD', type: '시각장애' },
    { name: '국채원', phone: '010-3001-0015', buyerId: standardBuyer.id, hireDate: new Date('2025-09-01'), monthlySalary: 2400000, severity: 'MILD', type: '청각장애' }
  ];

  for (const emp of employees) {
    await prisma.disabledEmployee.create({
      data: {
        buyerId: emp.buyerId,
        name: emp.name,
        phone: emp.phone,
        disabilityType: emp.type,
        disabilityGrade: emp.severity === 'SEVERE' ? '1급' : '3급',
        severity: emp.severity,
        gender: 'MALE',
        hireDate: emp.hireDate,
        monthlySalary: emp.monthlySalary,
        hasEmploymentInsurance: true,
        meetsMinimumWage: true,
        monthlyWorkHours: 209,
        workType: 'OFFICE'
      }
    });
  }

  console.log('✅ 42 disabled employees created');

  // 7. Create leave types
  console.log('\n🏖️ Creating leave types...');

  const leaveTypes = [
    { companyId: pemaCompany.id, name: '연차', description: '근로기준법 기준 연차휴가', requiresDocument: false, maxDaysPerYear: null, isPaid: true, displayOrder: 1 },
    { companyId: pemaCompany.id, name: '병가', description: '질병으로 인한 휴가', requiresDocument: true, maxDaysPerYear: 5, isPaid: false, displayOrder: 2 },
    { companyId: pemaCompany.id, name: '경조사', description: '경조사 휴가', requiresDocument: true, maxDaysPerYear: 3, isPaid: true, displayOrder: 3 },
    { companyId: pemaCompany.id, name: '공가', description: '공적 사유로 인한 휴가', requiresDocument: true, maxDaysPerYear: null, isPaid: true, displayOrder: 4 },
    
    { companyId: publicCompany.id, name: '연차', description: '근로기준법 기준 연차휴가', requiresDocument: false, maxDaysPerYear: null, isPaid: true, displayOrder: 1 },
    { companyId: publicCompany.id, name: '병가', description: '질병으로 인한 휴가', requiresDocument: true, maxDaysPerYear: 7, isPaid: true, displayOrder: 2 },
    { companyId: publicCompany.id, name: '경조사', description: '경조사 휴가', requiresDocument: true, maxDaysPerYear: 5, isPaid: true, displayOrder: 3 },
    
    { companyId: standardCompany.id, name: '연차', description: '근로기준법 기준 연차휴가', requiresDocument: false, maxDaysPerYear: null, isPaid: true, displayOrder: 1 },
    { companyId: standardCompany.id, name: '병가', description: '질병으로 인한 휴가', requiresDocument: true, maxDaysPerYear: 5, isPaid: false, displayOrder: 2 }
  ];

  for (const type of leaveTypes) {
    await prisma.leaveType.create({ data: type });
  }

  console.log('✅ Leave types created');

  // 8. Update disabled counts
  console.log('\n🔢 Updating disabled counts...');

  const pemaCount = await prisma.disabledEmployee.count({ where: { buyerId: pemaBuyer.id } });
  const publicCount = await prisma.disabledEmployee.count({ where: { buyerId: publicBuyer.id } });
  const standardCount = await prisma.disabledEmployee.count({ where: { buyerId: standardBuyer.id } });

  await prisma.buyerProfile.update({
    where: { id: pemaBuyer.id },
    data: { disabledCount: pemaCount }
  });

  await prisma.buyerProfile.update({
    where: { id: publicBuyer.id },
    data: { disabledCount: publicCount }
  });

  await prisma.buyerProfile.update({
    where: { id: standardBuyer.id },
    data: { disabledCount: standardCount }
  });

  console.log('✅ Disabled counts updated');

  console.log('\n✨ Database seeding completed successfully!');
  console.log(`
📊 Summary:
- Companies: 3
- BuyerProfiles: 3
- SupplierProfiles: 1
- Admin Users: 2
- Disabled Employees: 42
  - 페마연구소: ${pemaCount}명
  - 공공기관A: ${publicCount}명
  - 행복한표준사업장: ${standardCount}명
- Leave Types: 9

🔑 Test Credentials:
- 페마연구소 관리자: 010-1000-0001 / test1234
- 공공기관A 관리자: 010-2000-0001 / test1234
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
