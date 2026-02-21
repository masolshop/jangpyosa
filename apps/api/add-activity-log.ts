import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 ActivityLog 테이블 추가 시작...');

  // SQLite에서 ActivityLog 테이블 생성
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ActivityLog (
      id TEXT PRIMARY KEY,
      companyId TEXT NOT NULL,
      userId TEXT NOT NULL,
      userName TEXT NOT NULL,
      action TEXT NOT NULL,
      targetType TEXT NOT NULL,
      targetId TEXT,
      targetName TEXT,
      details TEXT,
      ipAddress TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (companyId) REFERENCES Company(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ ActivityLog 테이블 생성 완료');

  // 인덱스 생성
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS ActivityLog_companyId_createdAt_idx ON ActivityLog(companyId, createdAt)`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS ActivityLog_userId_createdAt_idx ON ActivityLog(userId, createdAt)`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS ActivityLog_action_idx ON ActivityLog(action)`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS ActivityLog_targetType_targetId_idx ON ActivityLog(targetType, targetId)`);

  console.log('✅ 인덱스 생성 완료');
  console.log('🎉 마이그레이션 완료!');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
