import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addColumns() {
  console.log("🔄 Adding columns to User table...");

  try {
    // 1. companyId 컬럼 추가
    await prisma.$executeRawUnsafe(`ALTER TABLE User ADD COLUMN companyId TEXT;`);
    console.log("✅ Added companyId column");

    // 2. isCompanyOwner 컬럼 추가
    await prisma.$executeRawUnsafe(`ALTER TABLE User ADD COLUMN isCompanyOwner BOOLEAN NOT NULL DEFAULT 0;`);
    console.log("✅ Added isCompanyOwner column");

    console.log("✅ Columns added successfully!");
  } catch (error: any) {
    if (error.message.includes("duplicate column name")) {
      console.log("⚠️ Columns already exist");
    } else {
      console.error("❌ Error:", error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

addColumns();
