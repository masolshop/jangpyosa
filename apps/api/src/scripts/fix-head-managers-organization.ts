/**
 * 본부장 소속 조직 수정 스크립트
 * 
 * 문제: 본부장으로 등업된 매니저들이 여전히 페마연 소속으로 표시됨
 * 해결: 본부장의 organizationId를 본인이 관리하는 본부 ID로 변경
 * 
 * 실행 방법:
 * cd apps/api
 * npx tsx src/scripts/fix-head-managers-organization.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixHeadManagersOrganization() {
  try {
    console.log("🔍 본부장 소속 조직 수정 시작...");

    // 1. HEAD_MANAGER 역할을 가진 모든 매니저 조회
    const headManagers = await prisma.salesPerson.findMany({
      where: {
        role: "HEAD_MANAGER",
        isActive: true,
      },
      include: {
        organization: true,
      },
    });

    console.log(`\n📊 총 ${headManagers.length}명의 본부장 발견`);

    // 2. 각 본부장이 리더로 등록된 본부 찾기
    for (const manager of headManagers) {
      console.log(`\n👤 본부장: ${manager.name} (ID: ${manager.id})`);
      console.log(`   현재 소속: ${manager.organization?.name || '없음'} (ID: ${manager.organizationId || '없음'})`);

      // 이 본부장이 leaderName에 등록된 본부 찾기
      const ownedOrganization = await prisma.organization.findFirst({
        where: {
          type: "HEADQUARTERS",
          leaderName: manager.name,
          phone: manager.phone,
          isActive: true,
        },
      });

      if (!ownedOrganization) {
        console.warn(`   ⚠️  본부를 찾을 수 없습니다. (이름: ${manager.name}, 전화: ${manager.phone})`);
        continue;
      }

      console.log(`   찾은 본부: ${ownedOrganization.name} (ID: ${ownedOrganization.id})`);

      // 이미 올바른 조직에 소속되어 있는 경우
      if (manager.organizationId === ownedOrganization.id) {
        console.log(`   ✅ 이미 올바른 조직에 소속되어 있습니다.`);
        continue;
      }

      // 소속 조직 업데이트
      await prisma.salesPerson.update({
        where: { id: manager.id },
        data: {
          organizationId: ownedOrganization.id,
          organizationName: ownedOrganization.name,
        },
      });

      console.log(`   ✅ 소속 변경 완료: ${manager.organization?.name || '(없음)'} → ${ownedOrganization.name}`);
    }

    // 3. 결과 확인
    console.log("\n\n📊 수정 결과 확인:");
    const updatedManagers = await prisma.salesPerson.findMany({
      where: {
        role: "HEAD_MANAGER",
        isActive: true,
      },
      include: {
        organization: true,
      },
    });

    for (const manager of updatedManagers) {
      const org = manager.organization;
      console.log(`   • ${manager.name} → ${org?.name || '(조직 없음)'} (${org?.type || '-'})`);
    }

    console.log("\n✅ 스크립트 실행 완료!");

  } catch (error) {
    console.error("❌ 오류 발생:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
fixHeadManagersOrganization()
  .then(() => {
    console.log("✅ 프로세스 종료");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 프로세스 실패:", error);
    process.exit(1);
  });
