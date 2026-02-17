import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. 연도별 설정 생성
  console.log("📅 Creating year settings...");
  await prisma.yearSetting.upsert({
    where: { year: 2026 },
    update: {},
    create: {
      year: 2026,
      privateQuotaRate: 0.031, // 3.1%
      publicQuotaRate: 0.038, // 3.8%
      baseLevyAmount: 1000000, // 100만원 (예시)
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
      publicQuotaRate: 0.038,
      baseLevyAmount: 1050000,
      maxReductionRate: 0.9,
      maxReductionByContract: 0.5,
    },
  });

  // 2. 관리자 계정 생성
  console.log("👤 Creating admin user...");
  const adminPassword = await bcrypt.hash("admin1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@jangpyosa.com" },
    update: {},
    create: {
      email: "admin@jangpyosa.com",
      passwordHash: adminPassword,
      name: "관리자",
      role: "SUPER_ADMIN",
      phone: "010-1234-5678",
      company: {
        create: {
          name: "장표사닷컴",
          bizNo: "1234567890",
          type: "PRIVATE",
          isVerified: true,
        },
      },
    },
  });

  console.log(`✓ Admin created: ${admin.email} / password: admin1234`);

  // 3. 영업자 계정 생성 (추천코드)
  console.log("👔 Creating agent user...");
  const agentPassword = await bcrypt.hash("agent1234", 10);
  const agent = await prisma.user.upsert({
    where: { email: "agent@jangpyosa.com" },
    update: {},
    create: {
      email: "agent@jangpyosa.com",
      passwordHash: agentPassword,
      name: "영업자A",
      role: "AGENT",
      refCode: "AGENT001",
      phone: "010-2345-6789",
      company: {
        create: {
          name: "영업지사A",
          bizNo: "2345678901",
          type: "PRIVATE",
          isVerified: true,
        },
      },
    },
  });

  console.log(`✓ Agent created: ${agent.email} / password: agent1234 / refCode: AGENT001`);

  // 4. 테스트 공급사 생성
  console.log("🏭 Creating test supplier...");
  const supplierPassword = await bcrypt.hash("supplier1234", 10);
  const supplier = await prisma.user.upsert({
    where: { email: "supplier@test.com" },
    update: {},
    create: {
      email: "supplier@test.com",
      passwordHash: supplierPassword,
      name: "공급사담당자",
      role: "SUPPLIER",
      company: {
        create: {
          name: "(주)테스트표준사업장",
          bizNo: "3456789012",
          type: "PRIVATE",
          isVerified: true,
          supplierProfile: {
            create: {
              region: "서울",
              industry: "제조업",
              contactName: "김담당",
              contactTel: "02-1234-5678",
              approved: true,
            },
          },
        },
      },
    },
    include: { company: { include: { supplierProfile: true } } },
  });

  // 5. 테스트 상품 생성
  if (supplier.company?.supplierProfile) {
    console.log("📦 Creating test products...");
    await prisma.product.createMany({
      data: [
        {
          supplierId: supplier.company.supplierProfile.id,
          title: "인쇄물 제작 서비스",
          category: "인쇄/출판",
          price: 500000,
          unit: "건",
          minOrderQty: 1,
          leadTimeDays: 7,
          isActive: true,
        },
        {
          supplierId: supplier.company.supplierProfile.id,
          title: "청소 용역 서비스",
          category: "용역",
          price: 2000000,
          unit: "월",
          minOrderQty: 3,
          leadTimeDays: 3,
          isActive: true,
        },
        {
          supplierId: supplier.company.supplierProfile.id,
          title: "사무용품 납품",
          category: "물품",
          price: 300000,
          unit: "세트",
          minOrderQty: 1,
          leadTimeDays: 5,
          isActive: true,
        },
      ],
    });
    console.log("✓ 3 products created");
  }

  // 6. 콘텐츠 페이지 생성
  console.log("📄 Creating content pages...");
  await prisma.page.upsert({
    where: { slug: "establishment" },
    update: {},
    create: {
      slug: "establishment",
      title: "장애인표준사업장 설립",
      contentMd: `
        <h2>장애인표준사업장이란?</h2>
        <p>장애인표준사업장은 장애인 고용을 위해 특별히 설립된 사업장으로, 전체 근로자의 30% 이상을 장애인으로 고용하는 기업입니다.</p>
        
        <h3>설립 요건</h3>
        <ul>
          <li>장애인 고용비율: 전체 근로자의 30% 이상</li>
          <li>최소 고용인원: 장애인 10명 이상</li>
          <li>안정적인 사업 운영 능력</li>
        </ul>

        <h3>지원 혜택</h3>
        <ul>
          <li>시설·장비 지원</li>
          <li>운영자금 지원</li>
          <li>세제 혜택</li>
          <li>우선 구매 대상</li>
        </ul>
      `,
    },
  });

  await prisma.page.upsert({
    where: { slug: "linkage" },
    update: {},
    create: {
      slug: "linkage",
      title: "장애인표준사업장 연계사업",
      contentMd: `
        <h2>연계사업이란?</h2>
        <p>의무고용 대상 기업이 장애인표준사업장과 도급계약을 체결하여 부담금을 감면받는 제도입니다.</p>
        
        <h3>감면 혜택</h3>
        <ul>
          <li>부담금의 최대 90% 감면</li>
          <li>도급액의 50% 한도 내에서 적용</li>
        </ul>

        <h3>진행 절차</h3>
        <ol>
          <li>표준사업장 검색 및 상담</li>
          <li>도급계약 체결</li>
          <li>납품 완료</li>
          <li>부담금 감면 신청</li>
        </ol>
      `,
    },
  });

  await prisma.page.upsert({
    where: { slug: "health-voucher" },
    update: {},
    create: {
      slug: "health-voucher",
      title: "연계사업_헬스바우처",
      contentMd: `
        <h2>헬스바우처 연계사업</h2>
        <p>장애인 건강관리 서비스를 제공하는 표준사업장과의 연계사업입니다.</p>
        
        <h3>제공 서비스</h3>
        <ul>
          <li>헬스케어 프로그램</li>
          <li>건강검진 지원</li>
          <li>재활 서비스</li>
        </ul>

        <h3>이용 방법</h3>
        <p>장표사닷컴 쇼핑몰에서 관련 서비스를 검색하고 도급계약을 의뢰하세요.</p>
      `,
    },
  });

  console.log("✓ Content pages created");

  // 7. 샘플 공급사 레지스트리 생성 (830개 업체 시뮬레이션)
  console.log("🏢 Creating sample supplier registry (5 samples)...");
  const sampleSuppliers = [
    { name: "(주)행복나눔", bizNo: "4567890123", region: "서울", industry: "제조업" },
    { name: "(주)희망공방", bizNo: "5678901234", region: "경기", industry: "서비스업" },
    { name: "(주)다함께", bizNo: "6789012345", region: "부산", industry: "도소매업" },
    { name: "(주)새로운시작", bizNo: "7890123456", region: "대구", industry: "용역업" },
    { name: "(주)함께일하는세상", bizNo: "8901234567", region: "인천", industry: "IT" },
  ];

  for (const s of sampleSuppliers) {
    await prisma.supplierRegistry.upsert({
      where: { bizNo: s.bizNo },
      update: {},
      create: s,
    });
  }

  console.log("✓ Sample supplier registry created");

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
