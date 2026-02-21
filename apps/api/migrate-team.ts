import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrate() {
  console.log("🔄 Starting migration...");

  try {
    // 1. 기존 데이터 마이그레이션 (ownerUserId → companyId) - 컬럼이 존재하면 실행
    const companies = await prisma.company.findMany();
    
    console.log(`Found ${companies.length} companies`);
    
    for (const company of companies) {
      const user = await prisma.user.findUnique({
        where: { id: company.ownerUserId }
      });
      
      if (user && !user.companyId) {
        await prisma.$executeRawUnsafe(`
          UPDATE User SET companyId = '${company.id}', isCompanyOwner = 1 WHERE id = '${company.ownerUserId}'
        `);
        console.log(`✅ Migrated owner for company ${company.name}`);
      }
    }

    // 2. TeamInvitation 테이블 생성
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "TeamInvitation" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "companyId" TEXT NOT NULL,
        "inviteCode" TEXT NOT NULL,
        "invitedBy" TEXT NOT NULL,
        "companyType" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "expiresAt" DATETIME NOT NULL,
        "isUsed" BOOLEAN NOT NULL DEFAULT 0,
        "usedBy" TEXT,
        "usedAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);
    console.log("✅ Created TeamInvitation table");

    // 3. 인덱스 생성
    try {
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "TeamInvitation_inviteCode_key" ON "TeamInvitation"("inviteCode");
      `);
      
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "TeamInvitation_inviteCode_idx" ON "TeamInvitation"("inviteCode");
      `);
      
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "TeamInvitation_companyId_idx" ON "TeamInvitation"("companyId");
      `);
      
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "TeamInvitation_expiresAt_isUsed_idx" ON "TeamInvitation"("expiresAt", "isUsed");
      `);
      
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "User_companyId_idx" ON "User"("companyId");
      `);
      
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "User_isCompanyOwner_idx" ON "User"("isCompanyOwner");
      `);
      
      console.log("✅ Created indexes");
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.log("⚠️ Indexes already exist, skipping...");
      } else {
        throw error;
      }
    }

    console.log("✅ Migration completed successfully!");
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message);
    if (error.message.includes("already exists")) {
      console.log("⚠️ Objects already exist, migration might be already applied");
    } else {
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
