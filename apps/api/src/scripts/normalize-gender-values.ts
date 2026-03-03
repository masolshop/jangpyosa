/**
 * 데이터 마이그레이션 스크립트: 성별 값 정규화
 * 
 * 이 스크립트는 DisabledEmployee 테이블의 gender 필드를 "M" 또는 "F"로 정규화합니다.
 * 
 * 실행 방법:
 * cd apps/api
 * npx ts-node src/scripts/normalize-gender-values.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function normalizeGenderValues() {
  try {
    console.log("🔍 성별 값 정규화 시작...");

    // 모든 직원 조회
    const employees = await prisma.disabledEmployee.findMany({
      select: {
        id: true,
        name: true,
        gender: true,
      },
    });

    console.log(`📊 총 ${employees.length}명의 직원 발견`);

    let updatedCount = 0;
    let unchangedCount = 0;

    for (const emp of employees) {
      const currentGender = emp.gender?.toString().toLowerCase() || "";
      let normalizedGender: "M" | "F" | null = null;

      // 여성 패턴
      if (currentGender === "f" || currentGender === "여" || currentGender === "여성" || currentGender === "female") {
        normalizedGender = "F";
      }
      // 남성 패턴
      else if (currentGender === "m" || currentGender === "남" || currentGender === "남성" || currentGender === "male") {
        normalizedGender = "M";
      }
      // 이미 정규화된 값
      else if (currentGender === "M" || currentGender === "F") {
        unchangedCount++;
        continue;
      }
      // 알 수 없는 값 - 기본값 "M"으로 설정
      else {
        console.warn(`⚠️  ${emp.name} (ID: ${emp.id}): 알 수 없는 성별 값 "${emp.gender}" → 기본값 "M"으로 설정`);
        normalizedGender = "M";
      }

      // 업데이트가 필요한 경우
      if (normalizedGender && emp.gender !== normalizedGender) {
        await prisma.disabledEmployee.update({
          where: { id: emp.id },
          data: { gender: normalizedGender },
        });
        
        console.log(`✅ ${emp.name} (ID: ${emp.id}): "${emp.gender}" → "${normalizedGender}"`);
        updatedCount++;
      }
    }

    console.log("\n📊 정규화 완료:");
    console.log(`  - 업데이트됨: ${updatedCount}명`);
    console.log(`  - 변경 없음: ${unchangedCount}명`);
    console.log(`  - 총: ${employees.length}명`);

  } catch (error) {
    console.error("❌ 오류 발생:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
normalizeGenderValues()
  .then(() => {
    console.log("✅ 스크립트 실행 완료");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 스크립트 실행 실패:", error);
    process.exit(1);
  });
