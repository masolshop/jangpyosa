const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simpleCheck() {
  console.log('=== 📬 알림 간단 확인 ===\n');
  
  // 1. 전체 알림 수
  const totalNotifications = await prisma.notification.count();
  console.log(`총 알림: ${totalNotifications}개\n`);
  
  // 2. 타입별 알림
  const byType = await prisma.notification.groupBy({
    by: ['type'],
    _count: true
  });
  
  console.log('타입별 알림:');
  byType.forEach(t => {
    console.log(`  - ${t.type}: ${t._count}개`);
  });
  
  // 3. 읽음/안읽음
  const readCount = await prisma.notification.count({ where: { read: true } });
  const unreadCount = await prisma.notification.count({ where: { read: false } });
  
  console.log(`\n읽음 상태:`);
  console.log(`  - 읽음: ${readCount}개`);
  console.log(`  - 안읽음: ${unreadCount}개`);
  
  // 4. 최근 알림 샘플
  const recent = await prisma.notification.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          phone: true,
          role: true
        }
      }
    }
  });
  
  console.log(`\n최근 알림 5개:`);
  recent.forEach((n, i) => {
    console.log(`\n[${i+1}] ${n.type} - ${n.title}`);
    console.log(`    수신자: ${n.user.name} (${n.user.role})`);
    console.log(`    메시지: ${n.message?.substring(0, 50)}...`);
    console.log(`    읽음: ${n.read ? '✅' : '❌'}`);
    console.log(`    생성: ${n.createdAt.toLocaleString('ko-KR')}`);
  });
  
  // 5. 사용자별 알림 수
  console.log(`\n사용자별 알림 통계:`);
  const userStats = await prisma.notification.groupBy({
    by: ['userId'],
    _count: true,
    orderBy: {
      _count: {
        userId: 'desc'
      }
    },
    take: 5
  });
  
  for (const stat of userStats) {
    const user = await prisma.user.findUnique({
      where: { id: stat.userId },
      select: { name: true, role: true }
    });
    console.log(`  - ${user?.name || '알 수 없음'} (${user?.role}): ${stat._count}개`);
  }
  
  await prisma.$disconnect();
}

simpleCheck().catch(e => {
  console.error('에러:', e.message);
  process.exit(1);
});
