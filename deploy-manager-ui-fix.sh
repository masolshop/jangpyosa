#!/bin/bash
set -e

echo "🚀 매니저 UI 제거 배포 시작..."
ssh -i ~/.ssh/jangpyosa.pem -o StrictHostKeyChecking=no ubuntu@43.201.0.129 << 'ENDSSH'
cd /home/ubuntu/jangpyosa

echo "📥 최신 코드 가져오기..."
git fetch origin main
git reset --hard origin/main

echo "📋 최신 커밋 확인..."
git log --oneline -3

echo "🗑️ Web 캐시 삭제..."
cd apps/web
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc

echo "📦 Web 빌드 시작..."
npm run build

echo "🔄 PM2 재시작..."
pm2 restart jangpyosa-web

echo "📊 PM2 상태 확인..."
pm2 status

echo "📝 최근 로그 확인..."
pm2 logs jangpyosa-web --nostream --lines 15

echo "✅ 배포 완료!"
echo "🌐 https://jangpyosa.com/login"
echo "🌐 https://jangpyosa.com/signup"
ENDSSH

echo ""
echo "✅ 매니저 UI 제거 배포 완료!"
echo "📌 변경사항: 로그인/회원가입 페이지에서 매니저 버튼 제거"
echo "🔗 로그인: https://jangpyosa.com/login"
echo "🔗 회원가입: https://jangpyosa.com/signup"
