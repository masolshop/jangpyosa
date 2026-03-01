#!/bin/bash

echo "========================================="
echo "🚀 매니저 대시보드 배포 시작"
echo "========================================="

ssh -i /home/user/.ssh/jangpyosa.pem ubuntu@43.201.0.129 << 'ENDSSH'

cd /home/ubuntu/jangpyosa

echo "📥 최신 코드 가져오기..."
git fetch origin main
git reset --hard origin/main

echo "📝 최근 커밋 확인..."
git log --oneline -n 3

echo "🔧 웹 빌드..."
cd apps/web
rm -rf .next/cache
npm run build

echo "♻️  PM2 재시작..."
pm2 restart jangpyosa-web

echo "📊 PM2 상태..."
pm2 status

ENDSSH

echo ""
echo "========================================="
echo "✅ 배포 완료!"
echo "========================================="
echo "🔗 매니저 로그인: https://jangpyosa.com/admin/sales"
echo "🔗 매니저 대시보드: https://jangpyosa.com/admin/sales/dashboard"
echo ""
echo "📝 테스트 계정:"
echo "  - 김영희: 01012345001 / manager123"
echo "  - 이철수: 01012345002 / manager123"
echo "  - 박민수: 01012345003 / manager123"
echo "========================================="
