#!/bin/bash

echo "======================================"
echo "2026년 기준 연도 설정 생성"
echo "======================================"

# 로컬에서도 실행
echo "📍 로컬 개발 DB에 2026년 설정 추가..."
sqlite3 /home/user/webapp/apps/api/prisma/dev.db << 'EOSQL'
INSERT OR REPLACE INTO YearSetting (
  year,
  privateQuotaRate,
  publicQuotaRate,
  baseLevyAmount,
  maxReductionRate,
  maxReductionByContract,
  createdAt,
  updatedAt
) VALUES (
  2026,
  0.031,
  0.038,
  2156880,
  0.9,
  0.5,
  datetime('now'),
  datetime('now')
);

SELECT '✅ 로컬 DB 업데이트 완료';
SELECT * FROM YearSetting ORDER BY year DESC;
EOSQL

echo ""
echo "======================================"
echo "✅ 로컬 설정 완료"
echo "======================================"
