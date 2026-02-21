import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding inviteeName and inviteePhone columns to TeamInvitation...');
  
  // Prisma는 스키마 변경을 자동으로 감지하므로 직접 SQL 실행
  await prisma.$executeRawUnsafe(`
    ALTER TABLE TeamInvitation ADD COLUMN inviteeName TEXT;
  `);
  
  await prisma.$executeRawUnsafe(`
    ALTER TABLE TeamInvitation ADD COLUMN inviteePhone TEXT;
  `);
  
  console.log('✅ Migration completed successfully!');
}

main()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
