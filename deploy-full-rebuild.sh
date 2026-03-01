#!/bin/bash
set -e

echo "🚀 전체 재빌드 시작..."
ssh -o StrictHostKeyChecking=no ubuntu@43.201.0.129 << 'ENDSSH'
cd /home/ubuntu/jangpyosa

echo "📥 최신 코드 가져오기..."
git fetch origin main
git reset --hard origin/main

echo "🗑️  모든 캐시 삭제..."
cd apps/web
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc

echo "📦 빌드 시작..."
npm run build

echo "🔄 PM2 재시작..."
pm2 restart jangpyosa-web
pm2 logs jangpyosa-web --nostream --lines 10

echo "✅ 배포 완료!"
ENDSSH
