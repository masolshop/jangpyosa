#!/bin/bash

echo "=========================================="
echo "🚀 영업 관리 수정/삭제 기능 배포"
echo "=========================================="
echo ""

# SSH로 서버에 접속하여 배포
ssh -o StrictHostKeyChecking=no ubuntu@43.201.0.129 << 'ENDSSH'
  set -e
  
  echo "📦 최신 코드 가져오기..."
  cd /home/ubuntu/jangpyosa
  git fetch origin
  git reset --hard origin/main
  
  echo ""
  echo "🔨 API 빌드..."
  cd apps/api
  npm run build
  
  echo ""
  echo "🔨 Web 빌드..."
  cd ../web
  npm run build
  
  echo ""
  echo "🔄 PM2 재시작..."
  pm2 restart jangpyosa-api
  pm2 restart jangpyosa-web
  
  echo ""
  echo "✅ PM2 프로세스 상태:"
  pm2 list
  
  echo ""
  echo "📊 서버 상태:"
  uptime
  df -h / | tail -1
  free -h | grep Mem
  
ENDSSH

echo ""
echo "=========================================="
echo "✅ 배포 완료!"
echo "=========================================="
echo ""
echo "🔧 새로운 기능:"
echo "  - 본부/지사 수정 기능"
echo "  - 본부/지사 삭제 기능 (하위 조직 있으면 거부)"
echo "  - 본부 정보 표시: 지사 N개 | 소속매니저 N명"
echo ""
echo "📝 API 엔드포인트:"
echo "  - PUT /sales/people/:id - 정보 수정"
echo "  - DELETE /sales/people/:id - 삭제"
echo ""
echo "🌐 주요 URL:"
echo "  - 슈퍼어드민 로그인: https://jangpyosa.com/admin/login"
echo "  - 슈퍼어드민 대시보드: https://jangpyosa.com/admin"
echo "  - 영업 관리: https://jangpyosa.com/admin/sales-management"
echo ""
