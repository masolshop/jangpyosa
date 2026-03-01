#!/bin/bash

echo "========================================="
echo "🚀 매니저 실명인증 기능 배포 시작"
echo "========================================="

# SSH 접속
ssh -i /home/user/.ssh/jangpyosa.pem ubuntu@43.201.0.129 << 'ENDSSH'

cd /home/ubuntu/jangpyosa

echo "📥 최신 코드 가져오기..."
git fetch origin main
git reset --hard origin/main

echo "📝 최근 커밋 확인..."
git log --oneline -n 3

echo "🔧 API 빌드..."
cd apps/api
npm run build

echo "🔧 웹 빌드..."
cd ../web
rm -rf .next/cache
npm run build

echo "♻️  PM2 프로세스 재시작..."
pm2 restart all

echo "📊 PM2 상태 확인..."
pm2 status

echo "📋 최근 로그 확인..."
pm2 logs --nostream --lines 10

ENDSSH

echo ""
echo "========================================="
echo "✅ 배포 완료!"
echo "========================================="
echo "🔗 매니저 가입: https://jangpyosa.com/admin/sales"
echo "🔗 슈퍼어드민: https://jangpyosa.com/admin/login"
echo "========================================="
