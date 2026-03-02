#!/bin/bash
# 지사 생성 방식 변경 배포 스크립트

cd /home/ubuntu/jangpyosa

echo "================================"
echo "🚀 지사 생성 방식 변경 배포"
echo "================================"

echo ""
echo "📥 최신 코드 가져오기..."
git fetch origin main
git reset --hard origin/main

COMMIT=$(git rev-parse --short HEAD)
echo "✅ 현재 커밋: $COMMIT"

echo ""
echo "📦 API 의존성 설치 및 빌드..."
cd apps/api
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ API 빌드 실패!"
    exit 1
fi

echo ""
echo "📦 Web 의존성 설치..."
cd ../web
npm install

echo ""
echo "🔨 Next.js 웹 빌드..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web 빌드 실패!"
    exit 1
fi

echo ""
echo "🔄 PM2로 서비스 재시작..."
cd /home/ubuntu/jangpyosa
pm2 restart all

echo ""
echo "⏳ 서비스 안정화 대기..."
sleep 5

echo ""
echo "📊 서비스 상태 확인..."
pm2 list

echo ""
echo "📝 최근 로그 확인..."
pm2 logs jangpyosa-api --lines 10 --nostream
echo ""
pm2 logs jangpyosa-web --lines 10 --nostream

echo ""
echo "================================"
echo "✅ 배포 완료!"
echo "================================"
echo "📍 URL: https://jangpyosa.com"
echo "📍 커밋: $COMMIT"
echo ""
echo "🎯 변경 사항:"
echo "  - 지사 생성 시 기존 매니저 검색 후 선택"
echo "  - 선택한 매니저를 지사장으로 자동 등업"
echo "  - 전화번호/비밀번호 필드 제거"
echo ""
echo "🔍 실시간 로그: pm2 logs"
