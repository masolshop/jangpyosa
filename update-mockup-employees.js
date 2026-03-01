const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 랜덤 생년월일 생성 (1970~1995년생)
function generateBirthDate() {
  const year = Math.floor(Math.random() * 26) + 70; // 70~95
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${year}${month}${day}`;
}

async function main() {
  console.log("=== 목업 장애인 직원 데이터 업데이트 시작 ===\n");

  // 1. 페마연구소 직원 업데이트
  console.log("1. 페마연구소 직원 업데이트...");
  const pemaCompany = await prisma.company.findFirst({
    where: { name: { contains: "페마연구소" } },
    include: { buyerProfile: true },
  });

  if (pemaCompany?.buyerProfile) {
    const pemaEmployees = await prisma.disabledEmployee.findMany({
      where: { buyerId: pemaCompany.buyerProfile.id },
    });

    console.log(`   총 ${pemaEmployees.length}명 발견`);

    for (const emp of pemaEmployees) {
      if (!emp.registrationNumber) {
        const birthDate = generateBirthDate();
        await prisma.disabledEmployee.update({
          where: { id: emp.id },
          data: { registrationNumber: birthDate },
        });
        console.log(`   ✅ ${emp.name}: 주민번호 ${birthDate} 추가`);
      }
    }
  }

  // 2. 공공기관A 직원 업데이트
  console.log("\n2. 공공기관A 직원 업데이트...");
  const publicCompany = await prisma.company.findFirst({
    where: { name: { contains: "공공기관A" } },
    include: { buyerProfile: true },
  });

  if (publicCompany?.buyerProfile) {
    const publicEmployees = await prisma.disabledEmployee.findMany({
      where: { buyerId: publicCompany.buyerProfile.id },
    });

    console.log(`   총 ${publicEmployees.length}명 발견`);

    for (const emp of publicEmployees) {
      if (!emp.registrationNumber) {
        const birthDate = generateBirthDate();
        await prisma.disabledEmployee.update({
          where: { id: emp.id },
          data: { registrationNumber: birthDate },
        });
        console.log(`   ✅ ${emp.name}: 주민번호 ${birthDate} 추가`);
      }
    }
  }

  // 3. 행복한표준사업장 확인
  console.log("\n3. 행복한표준사업장 확인...");
  const standardCompany = await prisma.company.findFirst({
    where: { name: { contains: "행복한표준사업장" } },
    include: { supplierProfile: true },
  });

  if (standardCompany) {
    console.log(`   회사명: ${standardCompany.name}`);
    console.log(`   SupplierProfile: ${standardCompany.supplierProfile ? '✅ 있음' : '❌ 없음'}`);
    
    if (!standardCompany.supplierProfile) {
      console.log("   ⚠️ SupplierProfile이 없어서 직원을 조회할 수 없습니다.");
    }
  }

  console.log("\n=== 업데이트 완료! ===");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
