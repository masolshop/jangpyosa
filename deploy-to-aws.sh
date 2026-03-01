#!/bin/bash

echo "=========================================="
echo "🚀 장표사 수정/삭제 기능 배포"
echo "=========================================="
echo ""

set -e

# 현재 위치 확인
echo "📍 현재 위치:"
pwd
echo ""

# Git 상태 확인
echo "📋 Git 상태:"
git status
echo ""

# 최신 코드 가져오기
echo "📦 최신 코드 가져오기..."
git fetch origin
git reset --hard origin/main
echo "✅ 코드 업데이트 완료"
echo ""

# 최신 커밋 확인
echo "📝 최신 커밋:"
git log --oneline -3
echo ""

# API 빌드
echo "🔨 API 빌드 중..."
cd apps/api
npm run build
echo "✅ API 빌드 완료"
echo ""

# Web 빌드
echo "🔨 Web 빌드 중..."
cd ../web
npm run build
echo "✅ Web 빌드 완료"
echo ""

# 프로젝트 루트로 돌아가기
cd ../..

# PM2 재시작
echo "🔄 PM2 재시작..."
pm2 restart jangpyosa-api
pm2 restart jangpyosa-web
echo "✅ PM2 재시작 완료"
echo ""

# PM2 상태 확인
echo "📊 PM2 상태:"
pm2 list
echo ""

# 서버 상태
echo "💻 서버 상태:"
echo "Uptime: $(uptime)"
echo "Disk: $(df -h / | tail -1)"
echo "Memory: $(free -h | grep Mem)"
echo ""

echo "=========================================="
echo "✅ 배포 완료!"
echo "=========================================="
echo ""
echo "🌐 확인 URL:"
echo "  - 슈퍼어드민 로그인: https://jangpyosa.com/admin/login"
echo "  - 영업 관리: https://jangpyosa.com/admin/sales-management"
echo ""
echo "🔑 테스트 계정:"
echo "  - ID: 01063529091"
echo "  - PW: admin123"
echo ""
