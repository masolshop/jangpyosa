#!/bin/bash

echo "========================================="
echo "🚀 매니저 가입 UI 개선 배포 시작"
echo "========================================="

ssh -i /home/user/.ssh/jangpyosa.pem ubuntu@43.201.0.129 << 'ENDSSH'

cd /home/ubuntu/jangpyosa

echo "📥 최신 코드 가져오기..."
git fetch origin main
git reset --hard origin/main

echo "📝 최근 커밋 확인..."
git log --oneline -n 3

echo "🗄️  Prisma 마이그레이션 및 클라이언트 생성..."
cd apps/api
npx prisma generate
npx prisma db push --skip-generate

echo "🔧 API 빌드..."
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
echo ""
echo "📝 변경사항:"
echo "  - ✅ 회원가입 모달 닫기(X) 버튼 추가"
echo "  - ✅ 하단 로그인 페이지 이동 버튼"
echo "  - ✅ 주민번호 앞 6자리만 DB 저장"
echo "========================================="
