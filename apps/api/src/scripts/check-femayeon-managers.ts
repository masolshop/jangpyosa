/**
 * 페마연 소속 매니저 확인 스크립트
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkFemayeonManagers() {
  try {
    console.log("🔍 페마연 조직 정보 확인...\n");

    // 페마연 조직 찾기
    const femayeon = await prisma.organization.findFirst({
      where: {
        name: { contains: "페마연" },
        isActive: true,
      },
      include: {
        salesPeople: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
            isActive: true,
            organizationId: true,
            organizationName: true,
          },
        },
      },
    });

    if (!femayeon) {
      console.log("❌ 페마연 조직을 찾을 수 없습니다.");
      return;
    }

    console.log(`📋 조직명: ${femayeon.name}`);
    console.log(`📍 조직 ID: ${femayeon.id}`);
    console.log(`👤 본부장: ${femayeon.leaderName}`);
    console.log(`📞 연락처: ${femayeon.phone}\n`);

    console.log(`👥 소속 매니저: ${femayeon.salesPeople.length}명\n`);

    if (femayeon.salesPeople.length === 0) {
      console.log("✅ 페마연에 소속된 매니저가 없습니다.");
    } else {
      console.log("매니저 목록:");
      femayeon.salesPeople.forEach((person, idx) => {
        console.log(`  ${idx + 1}. ${person.name}`);
        console.log(`     - 전화: ${person.phone}`);
        console.log(`     - 역할: ${person.role}`);
        console.log(`     - 활성: ${person.isActive ? 'Y' : 'N'}`);
        console.log(`     - 조직ID: ${person.organizationId}`);
        console.log(`     - 조직명: ${person.organizationName || '(없음)'}`);
        console.log("");
      });
    }

    // 모든 활성 본부장 확인
    console.log("\n📊 전체 활성 본부장 목록:");
    const allHeadManagers = await prisma.salesPerson.findMany({
      where: {
        role: "HEAD_MANAGER",
        isActive: true,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    allHeadManagers.forEach((manager, idx) => {
      console.log(`  ${idx + 1}. ${manager.name} (${manager.phone})`);
      console.log(`     → 소속: ${manager.organization?.name || '(조직 없음)'} (ID: ${manager.organizationId || '(없음)'})`);
    });

  } catch (error) {
    console.error("❌ 오류 발생:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkFemayeonManagers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
