import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. 지사(Branch) 생성
  console.log("📍 Creating branches...");
  
  const branches = [
    { name: "서울남부지사", code: "SEOUL_SOUTH", region: "서울특별시", phone: "02-1234-5678" },
    { name: "서울북부지사", code: "SEOUL_NORTH", region: "서울특별시", phone: "02-2345-6789" },
    { name: "부산지역본부", code: "BUSAN", region: "부산광역시", phone: "051-1234-5678" },
    { name: "대구지사", code: "DAEGU", region: "대구광역시", phone: "053-1234-5678" },
    { name: "인천지사", code: "INCHEON", region: "인천광역시", phone: "032-1234-5678" },
    { name: "광주지역본부", code: "GWANGJU", region: "광주광역시", phone: "062-1234-5678" },
    { name: "대전지사", code: "DAEJEON", region: "대전광역시", phone: "042-1234-5678" },
    { name: "울산지사", code: "ULSAN", region: "울산광역시", phone: "052-1234-5678" },
    { name: "경기지사", code: "GYEONGGI", region: "경기도", phone: "031-1234-5678" },
    { name: "강원지사", code: "GANGWON", region: "강원도", phone: "033-1234-5678" },
  ];

  for (const branchData of branches) {
    await prisma.branch.upsert({
      where: { code: branchData.code },
      update: branchData,
      create: branchData,
    });
  }

  console.log(`✅ Created ${branches.length} branches`);

  // 2. 슈퍼어드민 계정 생성
  console.log("👤 Creating super admin...");
  
  const adminPassword = await bcrypt.hash("admin1234", 10);
  const admin = await prisma.user.upsert({
    where: { phone: "01012345678" },
    update: {},
    create: {
      phone: "01012345678",
      email: "admin@jangpyosa.com",
      passwordHash: adminPassword,
      name: "슈퍼관리자",
      role: "SUPER_ADMIN",
    },
  });

  console.log(`✅ Super admin created: ${admin.phone}`);

  // 3. 매니저(Agent) 계정 생성
  console.log("👥 Creating agents...");

  const seoulSouthBranch = await prisma.branch.findUnique({ where: { code: "SEOUL_SOUTH" } });
  const busanBranch = await prisma.branch.findUnique({ where: { code: "BUSAN" } });

  const agentPassword = await bcrypt.hash("agent1234", 10);
  
  const agent1 = await prisma.user.upsert({
    where: { phone: "01098765432" },
    update: {},
    create: {
      phone: "01098765432",
      email: "agent1@jangpyosa.com",
      passwordHash: agentPassword,
      name: "김매니저",
      role: "AGENT",
      branchId: seoulSouthBranch!.id,
      refCode: "AGENT001",
    },
  });

  const agent2 = await prisma.user.upsert({
    where: { phone: "01087654321" },
    update: {},
    create: {
      phone: "01087654321",
      email: "agent2@jangpyosa.com",
      passwordHash: agentPassword,
      name: "이매니저",
      role: "AGENT",
      branchId: busanBranch!.id,
      refCode: "AGENT002",
    },
  });

  console.log(`✅ Agents created: ${agent1.phone}, ${agent2.phone}`);

  // 4. 연도별 설정 생성
  console.log("📅 Creating year settings...");

  await prisma.yearSetting.upsert({
    where: { year: 2026 },
    update: {},
    create: {
      year: 2026,
      privateQuotaRate: 0.031, // 3.1%
      publicQuotaRate: 0.038,  // 3.8%
      baseLevyAmount: 1261000,
      maxReductionRate: 0.9,
      maxReductionByContract: 0.5,
    },
  });

  await prisma.yearSetting.upsert({
    where: { year: 2027 },
    update: {},
    create: {
      year: 2027,
      privateQuotaRate: 0.033, // 3.3%
      publicQuotaRate: 0.038,  // 3.8%
      baseLevyAmount: 1300000, // 예상값
      maxReductionRate: 0.9,
      maxReductionByContract: 0.5,
    },
  });

  console.log("✅ Year settings created for 2026, 2027");

  // 5. CMS 페이지 생성
  console.log("📄 Creating CMS pages...");

  await prisma.page.upsert({
    where: { slug: "establishment" },
    update: {},
    create: {
      slug: "establishment",
      title: "장애인표준사업장 설립 안내",
      contentMd: `# 장애인표준사업장 설립 안내

## 설립 요건
- 장애인 근로자가 10명 이상
- 장애인 근로자 비율이 70% 이상
- ...`,
    },
  });

  await prisma.page.upsert({
    where: { slug: "linkage" },
    update: {},
    create: {
      slug: "linkage",
      title: "연계고용 제도 안내",
      contentMd: `# 연계고용 제도 안내

## 연계고용이란?
장애인 미고용 부담금 납부 대상 기업이 장애인표준사업장과 도급계약을 체결하면 부담금을 감면받을 수 있는 제도입니다.
...`,
    },
  });

  await prisma.page.upsert({
    where: { slug: "health-voucher" },
    update: {},
    create: {
      slug: "health-voucher",
      title: "헬스바우처 제도 안내",
      contentMd: `# 헬스바우처 제도 안내

## 헬스바우처란?
장애인 근로자의 건강관리를 위한 지원 제도입니다.
...`,
    },
  });

  console.log("✅ CMS pages created");

  console.log("\n🎉 Seeding completed!");
  console.log("\n📝 Initial accounts:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔑 Super Admin");
  console.log("   Phone: 01012345678");
  console.log("   Password: admin1234");
  console.log("");
  console.log("👤 Agent 1 (서울남부지사)");
  console.log("   Phone: 01098765432");
  console.log("   Password: agent1234");
  console.log("   RefCode: AGENT001");
  console.log("");
  console.log("👤 Agent 2 (부산지역본부)");
  console.log("   Phone: 01087654321");
  console.log("   Password: agent1234");
  console.log("   RefCode: AGENT002");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
