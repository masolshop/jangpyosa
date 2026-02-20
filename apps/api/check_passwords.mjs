import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkPasswords() {
  const users = await prisma.user.findMany({
    select: {
      name: true,
      username: true,
      phone: true,
      passwordHash: true,
      role: true
    }
  });
  
  console.log('=== 비밀번호 검증 ===\n');
  
  for (const user of users) {
    console.log(`[${user.role}] ${user.name}`);
    console.log(`  Phone: ${user.phone || 'N/A'}`);
    console.log(`  Username: ${user.username || 'N/A'}`);
    
    // test1234 검증
    const test1234Match = await bcrypt.compare('test1234', user.passwordHash);
    console.log(`  test1234: ${test1234Match ? '✅ 맞음' : '❌ 틀림'}`);
    
    // admin1234 검증
    const admin1234Match = await bcrypt.compare('admin1234', user.passwordHash);
    console.log(`  admin1234: ${admin1234Match ? '✅ 맞음' : '❌ 틀림'}`);
    
    // agent1234 검증
    const agent1234Match = await bcrypt.compare('agent1234', user.passwordHash);
    console.log(`  agent1234: ${agent1234Match ? '✅ 맞음' : '❌ 틀림'}`);
    
    console.log();
  }
  
  await prisma.$disconnect();
}

checkPasswords();
