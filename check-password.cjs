const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const manager = await prisma.user.findFirst({
    where: { phone: '01010000001' },
    select: { phone: true, name: true, passwordHash: true }
  });
  
  if (!manager) {
    console.log("❌ 관리자 계정을 찾을 수 없습니다");
    return;
  }
  
  console.log(`✅ 관리자: ${manager.name} (${manager.phone})`);
  console.log(`비밀번호 해시 길이: ${manager.passwordHash.length}`);
  
  // password123 테스트
  const match123 = await bcrypt.compare('password123', manager.passwordHash);
  console.log(`password123 일치: ${match123}`);
  
  // 다른 비밀번호들 테스트
  const passwords = ['1234', '123456', 'admin123', 'manager123', '1q2w3e4r'];
  for (const pwd of passwords) {
    const match = await bcrypt.compare(pwd, manager.passwordHash);
    if (match) {
      console.log(`✅ 비밀번호 발견: ${pwd}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
