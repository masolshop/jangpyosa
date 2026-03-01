#!/bin/bash

echo "🚀 슈퍼어드민 API 배포"
echo "================================"

# 프로덕션 서버에서 최신 코드 적용
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 << 'ENDSSH'
cd /home/ubuntu/jangpyosa

# 최신 코드 가져오기
git fetch origin main
git reset --hard origin/main

# API 빌드
echo ""
echo "🔨 API 빌드 중..."
cd apps/api
npm run build

# PM2 재시작
echo ""
echo "🔄 PM2 재시작 중..."
pm2 restart jangpyosa-api

# PM2 상태 확인
echo ""
pm2 status

# 서버 상태 확인
echo ""
echo "🏥 서버 상태:"
echo "  - 부하: $(uptime | awk -F'load average:' '{print $2}')"
echo "  - 디스크: $(df -h | grep '/$' | awk '{print $5}')"
echo "  - 메모리: $(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100}')"

ENDSSH

echo ""
echo "================================"
echo "✅ 배포 완료!"
echo ""
echo "📡 슈퍼어드민 생성 API:"
echo "   POST https://jangpyosa.com/api/create-super-admin"
echo ""
echo "🔑 사용 방법:"
echo "   curl -X POST https://jangpyosa.com/api/create-super-admin \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -H 'X-Admin-Secret: jangpyosa-super-secret-2025' \\"
echo "     -d '{\"phone\":\"01063529091\",\"password\":\"admin123\"}'"
