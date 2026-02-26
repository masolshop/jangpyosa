#!/bin/bash

# 완전 재배포 스크립트
set -e

echo "==================================="
echo "🚀 장표사닷컴 완전 재배포 시작"
echo "==================================="

# 서버 정보
SERVER_USER="ubuntu"
SERVER_HOST="jangpyosa.com"
DEPLOY_PATH="/home/ubuntu/jangpyosa"

echo ""
echo "📡 서버 접속: $SERVER_USER@$SERVER_HOST"
echo "📂 배포 경로: $DEPLOY_PATH"
echo ""

# SSH로 원격 서버에서 명령 실행
ssh -i /home/user/.ssh/jangpyosa_key -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e

cd /home/ubuntu/jangpyosa

echo "================================"
echo "📥 Step 1: Git Pull Latest Code"
echo "================================"
git fetch origin main
git reset --hard origin/main
echo "✅ Latest code fetched"
echo ""

echo "================================"
echo "🛠️ Step 2: Install Dependencies"
echo "================================"
cd apps/api
npm install --production=false
cd ../web
npm install --production=false
cd ../..
echo "✅ Dependencies installed"
echo ""

echo "================================"
echo "💾 Step 3: Prisma Generate"
echo "================================"
cd apps/api
npx prisma generate
echo "✅ Prisma client generated"
echo ""

echo "================================"
echo "🔨 Step 4: Build API"
echo "================================"
npm run build
echo "✅ API built successfully"
echo ""

echo "================================"
echo "🎨 Step 5: Build Web"
echo "================================"
cd ../web
npm run build
echo "✅ Web built successfully"
echo ""

echo "================================"
echo "🔄 Step 6: PM2 Restart Services"
echo "================================"
pm2 restart jangpyosa-api
pm2 restart jangpyosa-web
echo "✅ Services restarted"
echo ""

echo "================================"
echo "📊 Step 7: PM2 Status"
echo "================================"
pm2 status
echo ""

echo "================================"
echo "📝 Step 8: Check API Logs"
echo "================================"
pm2 logs jangpyosa-api --lines 20 --nostream
echo ""

echo "✅ 배포 완료!"
echo "🌐 웹사이트: https://jangpyosa.com"
echo "🔌 API: http://localhost:4000"

ENDSSH

echo ""
echo "================================"
echo "✅ 완전 재배포 완료!"
echo "================================"
echo ""
echo "📍 다음 단계:"
echo "1. https://jangpyosa.com 접속하여 사이드바 확인"
echo "2. 로그인 테스트"
echo "3. 장애인직원관리솔루션 메뉴 확인"
echo ""
