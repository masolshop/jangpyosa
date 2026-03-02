#!/bin/bash
# 장표사 배포 스크립트 - EC2 서버에서 직접 실행

cd /home/ubuntu/jangpyosa

echo "================================"
echo "🚀 장표사 배포 시작"
echo "================================"

echo "📥 최신 코드 가져오기..."
git fetch origin main
git reset --hard origin/main

COMMIT=$(git rev-parse --short HEAD)
echo "✅ 현재 커밋: $COMMIT"

echo ""
echo "📦 Web 의존성 설치..."
cd apps/web
npm install

echo ""
echo "🔨 Next.js 웹 빌드 시작..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 빌드 실패!"
    exit 1
fi

echo ""
echo "🔄 PM2로 웹 서비스 재시작..."
cd /home/ubuntu/jangpyosa
pm2 restart jangpyosa-web

echo ""
echo "⏳ 서비스 안정화 대기..."
sleep 3

echo ""
echo "📊 서비스 상태 확인..."
pm2 list

echo ""
echo "📝 최근 로그 확인..."
pm2 logs jangpyosa-web --lines 20 --nostream

echo ""
echo "================================"
echo "✅ 배포 완료!"
echo "================================"
echo "📍 URL: https://jangpyosa.com"
echo "📍 커밋: $COMMIT"
echo ""
echo "🔍 실시간 로그 보기: pm2 logs jangpyosa-web"
echo "🔍 에러 로그만 보기: pm2 logs jangpyosa-web --err"
