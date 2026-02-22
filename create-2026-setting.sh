#!/bin/bash

# 2026년 YearSetting 생성 스크립트

echo "======================================"
echo "2026년 기준 연도 설정 생성"
echo "======================================"

# 프로덕션 서버에서 실행
ssh ubuntu@jangpyosa.com << 'ENDSSH'

cd /home/ubuntu/jangpyosa/apps/api

# Prisma를 사용하여 2026년 설정 생성
cat > /tmp/create-2026-setting.js << 'EOF'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 2026년 연도 설정 생성 중...');
  
  // 기존 2026년 설정 확인
  const existing = await prisma.yearSetting.findUnique({
    where: { year: 2026 }
  });
  
  if (existing) {
    console.log('ℹ️  2026년 설정이 이미 존재합니다. 업데이트합니다...');
    
    const updated = await prisma.yearSetting.update({
      where: { year: 2026 },
      data: {
        privateQuotaRate: 0.031,        // 민간기업 3.1%
        publicQuotaRate: 0.038,          // 공공기관 3.8%
        baseLevyAmount: 2156880,         // 2026년 최저 월급여
        maxReductionRate: 0.9,           // 최대 감면율 90%
        maxReductionByContract: 0.5,     // 도급액 대비 최대 감면율 50%
      }
    });
    
    console.log('✅ 2026년 설정 업데이트 완료:', updated);
  } else {
    const created = await prisma.yearSetting.create({
      data: {
        year: 2026,
        privateQuotaRate: 0.031,
        publicQuotaRate: 0.038,
        baseLevyAmount: 2156880,
        maxReductionRate: 0.9,
        maxReductionByContract: 0.5,
      }
    });
    
    console.log('✅ 2026년 설정 생성 완료:', created);
  }
  
  // 확인
  const all = await prisma.yearSetting.findMany({
    orderBy: { year: 'desc' }
  });
  
  console.log('\n📋 전체 연도 설정:');
  all.forEach(s => {
    console.log(`  ${s.year}년: baseLevyAmount=${s.baseLevyAmount}, privateQuotaRate=${s.privateQuotaRate * 100}%`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
EOF

# 스크립트 실행
node /tmp/create-2026-setting.js

# 정리
rm /tmp/create-2026-setting.js

ENDSSH

echo "======================================"
echo "✅ 완료"
echo "======================================"
