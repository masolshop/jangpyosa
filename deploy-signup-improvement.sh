#!/bin/bash

# 매니저 회원가입 개선 배포 스크립트
# 사용법: AWS 서버에서 다음 명령어 실행
# ssh ubuntu@43.201.0.129
# cd /home/ubuntu/jangpyosa
# bash <(curl -s https://raw.githubusercontent.com/masolshop/jangpyosa/main/deploy-signup-improvement.sh)

echo "=========================================="
echo "매니저 회원가입 개선 배포 시작"
echo "=========================================="
echo ""

# 1. 최신 코드 가져오기
echo "✅ Step 1: 최신 코드 가져오기..."
git fetch origin
git reset --hard origin/main
echo "   최신 커밋: $(git log --oneline -1)"
echo ""

# 2. API 빌드
echo "✅ Step 2: API 빌드 중..."
cd apps/api
npm run build
if [ $? -eq 0 ]; then
    echo "   API 빌드 완료 ✅"
else
    echo "   ❌ API 빌드 실패"
    exit 1
fi
echo ""

# 3. Web 빌드
echo "✅ Step 3: Web 빌드 중..."
cd ../web
npm run build
if [ $? -eq 0 ]; then
    echo "   Web 빌드 완료 ✅"
else
    echo "   ❌ Web 빌드 실패"
    exit 1
fi
echo ""

# 4. PM2 재시작
echo "✅ Step 4: PM2 재시작 중..."
cd ../..
pm2 restart jangpyosa-api
pm2 restart jangpyosa-web
echo ""

# 5. PM2 상태 확인
echo "✅ Step 5: PM2 상태 확인..."
pm2 list
echo ""

# 6. 서버 상태 확인
echo "✅ Step 6: 서버 상태 확인..."
echo "   Disk: $(df -h / | tail -1 | awk '{print $3 " / " $2 " (" $5 ")"}')"
echo "   Memory: $(free -h | grep Mem | awk '{print $3 " / " $2}')"
echo "   Load: $(uptime | awk -F'load average:' '{print $2}')"
echo "   Uptime: $(uptime | awk '{print $3,$4}' | sed 's/,$//')"
echo ""

echo "=========================================="
echo "✅ 배포 완료!"
echo "=========================================="
echo ""
echo "🧪 테스트 방법:"
echo "1. 회원가입 페이지: https://jangpyosa.com/admin/sales"
echo "   - '본부지사매니저전용' 표기 확인"
echo "   - X 닫기 버튼 확인 (로그인/회원가입 모두)"
echo ""
echo "2. 회원가입 테스트:"
echo "   - 실명인증 완료 후"
echo "   - 본부 선택 → 지사 리스트 확인"
echo "   - 지사 선택 (또는 본부 직속)"
echo "   - 가입 완료 후 승인 안내 메시지 확인"
echo ""
echo "3. 로그인 테스트:"
echo "   - 승인 전: '비활성 상태' 에러 확인"
echo "   - 슈퍼어드민 승인 후: 정상 로그인 확인"
echo ""
echo "4. 슈퍼어드민 확인:"
echo "   - https://jangpyosa.com/admin/sales-management"
echo "   - 신규 가입자 isActive=false 확인"
echo "   - 활성화 버튼으로 승인"
echo ""

echo "🔗 주요 URL:"
echo "   - 슈퍼어드민: https://jangpyosa.com/admin/login (ID: 01063529091)"
echo "   - 매니저 로그인: https://jangpyosa.com/admin/sales"
echo "   - 영업 관리: https://jangpyosa.com/admin/sales-management"
echo ""
