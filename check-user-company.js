const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== 1. jangpyosa 사용자 정보 확인 ===");
  const user = await prisma.user.findUnique({
    where: { username: "jangpyosa" },
    include: {
      company: {
        include: {
          buyerProfile: true
        }
      }
    }
  });
  
  if (user) {
    console.log("사용자 ID:", user.id);
    console.log("사용자 이름:", user.name);
    console.log("역할(Role):", user.role);
    console.log("회사 ID (companyId):", user.companyId);
    console.log("회사 정보:", user.company ? {
      id: user.company.id,
      name: user.company.name,
      bizNo: user.company.bizNo,
      buyerProfileId: user.company.buyerProfile?.id
    } : "없음");
  } else {
    console.log("❌ jangpyosa 사용자를 찾을 수 없습니다!");
  }
  
  console.log("\n=== 2. 페마연 회사 정보 확인 ===");
  const company = await prisma.company.findFirst({
    where: {
      OR: [
        { bizNo: "2668101215" },
        { bizNo: "266-81-01215" }
      ]
    },
    include: {
      buyerProfile: true
    }
  });
  
  if (company) {
    console.log("회사 ID:", company.id);
    console.log("회사명:", company.name);
    console.log("사업자번호:", company.bizNo);
    console.log("BuyerProfile ID:", company.buyerProfile?.id);
  } else {
    console.log("❌ 페마연 회사를 찾을 수 없습니다!");
  }
  
  console.log("\n=== 3. 연동 상태 분석 ===");
  if (user && company) {
    if (user.companyId === company.id) {
      console.log("✅ 연동 정상");
    } else {
      console.log("❌ 연동 끊김!");
      console.log("   - 사용자의 companyId:", user.companyId);
      console.log("   - 페마연 회사 ID:", company.id);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
