import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsernames() {
  const users = await prisma.user.findMany({
    where: {
      role: { in: ['BUYER', 'SUPPLIER'] }
    },
    select: {
      name: true,
      username: true,
      phone: true,
      role: true
    },
    orderBy: { createdAt: 'asc' }
  });
  
  console.log('=== Username 확인 ===\n');
  
  for (const user of users) {
    console.log(`[${user.role}] ${user.name}`);
    console.log(`  phone: ${user.phone}`);
    console.log(`  username: ${user.username || '❌ NULL'}`);
    console.log();
  }
  
  await prisma.$disconnect();
}

checkUsernames();
