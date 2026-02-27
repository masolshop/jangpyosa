import { PrismaClient } from '@prisma/client';

// 싱글톤 패턴으로 PrismaClient 인스턴스 관리
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// 우아한 종료
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
