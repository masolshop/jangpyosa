#!/bin/bash

echo "🔍 슈퍼어드민 계정 확인"
echo "================================"

# 프로덕션 서버에서 확인
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 << 'ENDSSH'
cd /home/ubuntu/jangpyosa

# 직접 PostgreSQL 쿼리
export PGPASSWORD='jangpyosa2025!@#'
psql -h 127.0.0.1 -U jangpyosa -d jangpyosa -c "
SELECT 
  id,
  phone,
  name,
  role,
  email,
  \"createdAt\"
FROM \"User\"
WHERE phone = '01063529091';
"

echo ""
echo "================================"
ENDSSH

echo ""
echo "✅ 확인 완료"
