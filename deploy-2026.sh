#!/bin/bash

echo "======================================"
echo "🚀 2026년 기준 프로덕션 배포"
echo "======================================"

# 프로덕션 서버에서 실행
ssh ubuntu@jangpyosa.com << 'ENDSSH'

echo "📍 프로덕션 서버 작업 시작..."
cd /home/ubuntu/jangpyosa

echo ""
echo "1️⃣ 코드 Pull..."
git pull origin main

echo ""
echo "2️⃣ 2026년 연도 설정 추가..."
cd apps/api
node src/scripts/create-2026-setting.mjs

echo ""
echo "3️⃣ API 재시작..."
pm2 restart api

echo ""
echo "4️⃣ 상태 확인..."
pm2 list

echo ""
echo "✅ 배포 완료!"

ENDSSH

echo ""
echo "======================================"
echo "🧪 배포 테스트 시작..."
echo "======================================"

sleep 5

# API 테스트
echo ""
echo "📊 부담금 계산기 API 테스트..."
curl -X POST https://jangpyosa.com/api/calculators/levy \
  -H "Content-Type: application/json" \
  -d '{"year": 2026, "employeeCount": 1000, "disabledCount": 10, "companyType": "PRIVATE"}' \
  | python3 -m json.tool

echo ""
echo "======================================"
echo "✅ 배포 및 테스트 완료"
echo "======================================"
