#!/bin/bash
set -e

echo "🚀 매니저 페이지 접근 권한 수정 배포..."
ssh -i ~/.ssh/jangpyosa.pem -o StrictHostKeyChecking=no ubuntu@43.201.0.129 << 'ENDSSH'
cd /home/ubuntu/jangpyosa

echo "📥 최신 코드..."
git fetch origin main
git reset --hard origin/main
git log --oneline -2

echo "🗑️ 캐시 삭제..."
cd apps/web
rm -rf .next node_modules/.cache .swc

echo "📦 빌드..."
npm run build

echo "🔄 재시작..."
pm2 restart jangpyosa-web
pm2 logs jangpyosa-web --nostream --lines 5

echo "✅ 완료!"
ENDSSH

echo ""
echo "✅ 배포 완료!"
echo "🔗 매니저 페이지: https://jangpyosa.com/admin/sales"
echo "📝 이제 누구나 접근 가능합니다!"
