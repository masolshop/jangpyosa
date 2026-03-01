#!/bin/bash
set -e

echo "🚀 관리자/매니저 시스템 개선 배포..."
ssh -i ~/.ssh/jangpyosa.pem -o StrictHostKeyChecking=no ubuntu@43.201.0.129 << 'ENDSSH'
cd /home/ubuntu/jangpyosa

echo "📥 최신 코드 가져오기..."
git fetch origin main
git reset --hard origin/main

echo "📋 최신 커밋..."
git log --oneline -2

echo "🗑️ Web 캐시 삭제..."
cd apps/web
rm -rf .next node_modules/.cache .swc

echo "📦 빌드..."
npm run build

echo "🔄 PM2 재시작..."
pm2 restart jangpyosa-web
pm2 logs jangpyosa-web --nostream --lines 10

echo "✅ 배포 완료!"
ENDSSH

echo ""
echo "✅ 배포 완료!"
echo "🔗 슈퍼어드민 로그인: https://jangpyosa.com/admin/login"
echo "🔗 매니저 가입/로그인: https://jangpyosa.com/admin/sales"
