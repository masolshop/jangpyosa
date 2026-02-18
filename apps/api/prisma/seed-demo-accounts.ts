import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 데모 계정 및 장애인 직원 데이터 시딩 시작...");

  // 1. 공공기관 계정 생성
  console.log("\n1️⃣ 공공기관 계정 생성...");
  
  const publicUser = await prisma.user.upsert({
    where: { phone: "01077778888" },
    update: {},
    create: {
      phone: "01077778888",
      passwordHash: await bcrypt.hash("test1234", 10),
      name: "김공공",
      email: "public@example.com",
      role: "BUYER",
    },
  });

  const publicCompany = await prisma.company.upsert({
    where: { bizNo: "1234567890" },
    update: {
      buyerType: "PUBLIC_INSTITUTION",
    },
    create: {
      bizNo: "1234567890",
      name: "한국공공기관",
      representative: "김공공",
      type: "BUYER",
      buyerType: "PUBLIC_INSTITUTION",
      isVerified: true,
      ownerUserId: publicUser.id,
    },
  });

  const publicBuyerProfile = await prisma.buyerProfile.upsert({
    where: { companyId: publicCompany.id },
    update: {
      hasLevyExemption: false,
    },
    create: {
      companyId: publicCompany.id,
      hasLevyExemption: false,
    },
  });

  console.log(`✅ 공공기관 계정 생성 완료: ${publicCompany.name} (${publicCompany.buyerType})`);

  // 2. 국가/지자체 계정 생성
  console.log("\n2️⃣ 국가/지자체 계정 생성...");

  const govUser = await prisma.user.upsert({
    where: { phone: "01099990000" },
    update: {},
    create: {
      phone: "01099990000",
      passwordHash: await bcrypt.hash("test1234", 10),
      name: "박국가",
      email: "gov@example.com",
      role: "BUYER",
    },
  });

  const govCompany = await prisma.company.upsert({
    where: { bizNo: "9876543210" },
    update: {
      buyerType: "GOVERNMENT",
    },
    create: {
      bizNo: "9876543210",
      name: "서울특별시청",
      representative: "박국가",
      type: "BUYER",
      buyerType: "GOVERNMENT",
      isVerified: true,
      ownerUserId: govUser.id,
    },
  });

  const govBuyerProfile = await prisma.buyerProfile.upsert({
    where: { companyId: govCompany.id },
    update: {
      hasLevyExemption: true,
    },
    create: {
      companyId: govCompany.id,
      hasLevyExemption: true,
    },
  });

  console.log(`✅ 국가/지자체 계정 생성 완료: ${govCompany.name} (${govCompany.buyerType})`);

  // 3. 공공기관용 장애인 직원 10명 생성
  console.log("\n3️⃣ 공공기관용 장애인 직원 10명 생성 (500명 기준)...");

  const publicEmployees = [
    {
      name: "이중증남",
      disabilityType: "지체장애",
      disabilityGrade: "2급",
      severity: "SEVERE" as const,
      gender: "M" as const,
      birthDate: new Date("1985-03-15"),
      hireDate: new Date("2024-01-10"),
      workHoursPerWeek: 60,
      monthlySalary: 3500000,
    },
    {
      name: "김중증여",
      disabilityType: "시각장애",
      disabilityGrade: "2급",
      severity: "SEVERE" as const,
      gender: "F" as const,
      birthDate: new Date("1990-06-20"),
      hireDate: new Date("2024-02-01"),
      workHoursPerWeek: 60,
      monthlySalary: 3200000,
    },
    {
      name: "박경증남",
      disabilityType: "청각장애",
      disabilityGrade: "5급",
      severity: "MILD" as const,
      gender: "M" as const,
      birthDate: new Date("1988-09-10"),
      hireDate: new Date("2024-03-01"),
      workHoursPerWeek: 50,
      monthlySalary: 2800000,
    },
    {
      name: "최경증여",
      disabilityType: "언어장애",
      disabilityGrade: "6급",
      severity: "MILD" as const,
      gender: "F" as const,
      birthDate: new Date("1992-12-05"),
      hireDate: new Date("2024-04-01"),
      workHoursPerWeek: 45,
      monthlySalary: 2600000,
    },
    {
      name: "정중증남2",
      disabilityType: "뇌병변장애",
      disabilityGrade: "1급",
      severity: "SEVERE" as const,
      gender: "M" as const,
      birthDate: new Date("1983-07-22"),
      hireDate: new Date("2024-05-01"),
      workHoursPerWeek: 65,
      monthlySalary: 3800000,
    },
    {
      name: "강중증여2",
      disabilityType: "자폐성장애",
      disabilityGrade: "2급",
      severity: "SEVERE" as const,
      gender: "F" as const,
      birthDate: new Date("1995-04-18"),
      hireDate: new Date("2024-06-01"),
      workHoursPerWeek: 60,
      monthlySalary: 3100000,
    },
    {
      name: "조경증남2",
      disabilityType: "지적장애",
      disabilityGrade: "4급",
      severity: "MILD" as const,
      gender: "M" as const,
      birthDate: new Date("1991-11-30"),
      hireDate: new Date("2024-07-01"),
      workHoursPerWeek: 48,
      monthlySalary: 2700000,
    },
    {
      name: "윤경증여2",
      disabilityType: "지체장애",
      disabilityGrade: "5급",
      severity: "MILD" as const,
      gender: "F" as const,
      birthDate: new Date("1989-02-14"),
      hireDate: new Date("2024-08-01"),
      workHoursPerWeek: 52,
      monthlySalary: 2900000,
    },
    {
      name: "장중증남3",
      disabilityType: "시각장애",
      disabilityGrade: "1급",
      severity: "SEVERE" as const,
      gender: "M" as const,
      birthDate: new Date("1987-08-25"),
      hireDate: new Date("2024-09-01"),
      workHoursPerWeek: 68,
      monthlySalary: 4000000,
    },
    {
      name: "임경증여3",
      disabilityType: "청각장애",
      disabilityGrade: "6급",
      severity: "MILD" as const,
      gender: "F" as const,
      birthDate: new Date("1993-05-07"),
      hireDate: new Date("2024-10-01"),
      workHoursPerWeek: 40,
      monthlySalary: 2500000,
    },
  ];

  for (const emp of publicEmployees) {
    await prisma.disabledEmployee.create({
      data: {
        ...emp,
        hasEmploymentInsurance: true,
        meetsMinimumWage: true,
        buyerId: publicBuyerProfile.id,
      },
    });
  }

  console.log(`✅ 공공기관 장애인 직원 ${publicEmployees.length}명 생성 완료`);

  // 4. 국가/지자체용 장애인 직원 10명 생성
  console.log("\n4️⃣ 국가/지자체용 장애인 직원 10명 생성 (500명 기준)...");

  const govEmployees = [
    {
      name: "서중증남",
      disabilityType: "뇌병변장애",
      disabilityGrade: "2급",
      severity: "SEVERE" as const,
      gender: "M" as const,
      birthDate: new Date("1984-01-12"),
      hireDate: new Date("2024-01-15"),
      workHoursPerWeek: 62,
      monthlySalary: 3600000,
    },
    {
      name: "한중증여",
      disabilityType: "지체장애",
      disabilityGrade: "1급",
      severity: "SEVERE" as const,
      gender: "F" as const,
      birthDate: new Date("1991-07-08"),
      hireDate: new Date("2024-02-15"),
      workHoursPerWeek: 60,
      monthlySalary: 3400000,
    },
    {
      name: "오경증남",
      disabilityType: "언어장애",
      disabilityGrade: "5급",
      severity: "MILD" as const,
      gender: "M" as const,
      birthDate: new Date("1986-10-20"),
      hireDate: new Date("2024-03-15"),
      workHoursPerWeek: 48,
      monthlySalary: 2750000,
    },
    {
      name: "신경증여",
      disabilityType: "청각장애",
      disabilityGrade: "6급",
      severity: "MILD" as const,
      gender: "F" as const,
      birthDate: new Date("1994-04-03"),
      hireDate: new Date("2024-04-15"),
      workHoursPerWeek: 44,
      monthlySalary: 2550000,
    },
    {
      name: "유중증남2",
      disabilityType: "자폐성장애",
      disabilityGrade: "2급",
      severity: "SEVERE" as const,
      gender: "M" as const,
      birthDate: new Date("1982-09-16"),
      hireDate: new Date("2024-05-15"),
      workHoursPerWeek: 66,
      monthlySalary: 3900000,
    },
    {
      name: "노중증여2",
      disabilityType: "시각장애",
      disabilityGrade: "1급",
      severity: "SEVERE" as const,
      gender: "F" as const,
      birthDate: new Date("1996-12-28"),
      hireDate: new Date("2024-06-15"),
      workHoursPerWeek: 60,
      monthlySalary: 3300000,
    },
    {
      name: "하경증남2",
      disabilityType: "지적장애",
      disabilityGrade: "4급",
      severity: "MILD" as const,
      gender: "M" as const,
      birthDate: new Date("1990-05-11"),
      hireDate: new Date("2024-07-15"),
      workHoursPerWeek: 50,
      monthlySalary: 2850000,
    },
    {
      name: "전경증여2",
      disabilityType: "지체장애",
      disabilityGrade: "5급",
      severity: "MILD" as const,
      gender: "F" as const,
      birthDate: new Date("1988-08-19"),
      hireDate: new Date("2024-08-15"),
      workHoursPerWeek: 46,
      monthlySalary: 2650000,
    },
    {
      name: "배중증남3",
      disabilityType: "뇌병변장애",
      disabilityGrade: "1급",
      severity: "SEVERE" as const,
      gender: "M" as const,
      birthDate: new Date("1985-03-27"),
      hireDate: new Date("2024-09-15"),
      workHoursPerWeek: 70,
      monthlySalary: 4200000,
    },
    {
      name: "민경증여3",
      disabilityType: "청각장애",
      disabilityGrade: "6급",
      severity: "MILD" as const,
      gender: "F" as const,
      birthDate: new Date("1992-11-14"),
      hireDate: new Date("2024-10-15"),
      workHoursPerWeek: 42,
      monthlySalary: 2480000,
    },
  ];

  for (const emp of govEmployees) {
    await prisma.disabledEmployee.create({
      data: {
        ...emp,
        hasEmploymentInsurance: true,
        meetsMinimumWage: true,
        buyerId: govBuyerProfile.id,
      },
    });
  }

  console.log(`✅ 국가/지자체 장애인 직원 ${govEmployees.length}명 생성 완료`);

  // 5. 요약 출력
  console.log("\n📊 시딩 완료 요약:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`\n🏢 공공기관 계정`);
  console.log(`   - 회사명: ${publicCompany.name}`);
  console.log(`   - 기업 유형: ${publicCompany.buyerType} (의무고용률 3.8%)`);
  console.log(`   - 전화번호: ${publicUser.phone}`);
  console.log(`   - 비밀번호: test1234`);
  console.log(`   - 장애인 직원: ${publicEmployees.length}명`);

  console.log(`\n🏛️ 국가/지자체 계정`);
  console.log(`   - 회사명: ${govCompany.name}`);
  console.log(`   - 기업 유형: ${govCompany.buyerType} (의무고용률 3.8%, 특별 감면)`);
  console.log(`   - 전화번호: ${govUser.phone}`);
  console.log(`   - 비밀번호: test1234`);
  console.log(`   - 장애인 직원: ${govEmployees.length}명`);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ 모든 데모 데이터 시딩 완료!");
}

main()
  .catch((e) => {
    console.error("❌ 시딩 오류:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
