#!/bin/bash

echo "=========================================="
echo "장애인 직원 사이드바 테스트"
echo "=========================================="
echo ""

# Login as emp01
echo "🔐 박영희 (01099990001) 로그인 중..."
TOKEN=$(curl -s -X POST https://jangpyosa.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"01099990001","password":"test1234"}' | jq -r '.accessToken')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "✅ 로그인 성공!"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📱 브라우저에서 테스트하세요:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "1️⃣  로그인 페이지: https://jangpyosa.com/employee/login"
  echo "    전화번호: 01099990001"
  echo "    비밀번호: test1234"
  echo ""
  echo "2️⃣  로그인 후 사이드바에서 다음 메뉴만 표시되어야 합니다:"
  echo "    ✅ 직원 메뉴"
  echo "       - ⏰ 출퇴근 관리"
  echo "       - 🏖️ 휴가 신청"
  echo ""
  echo "3️⃣  다음 메뉴는 표시되지 않아야 합니다:"
  echo "    ❌ 장애인직원관리솔루션"
  echo "    ❌ 고용부담금감면계산기"
  echo "    ❌ 연계고용감면센터"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🧪 다른 테스트 계정:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "주식회사 페마연:"
  echo "  박영희: 01099990001 / test1234"
  echo "  이철수: 01099990002 / test1234"
  echo "  정미라: 01099990003 / test1234"
  echo ""
  echo "공공기관1:"
  echo "  최동욱: 01099990004 / test1234"
  echo "  한수진: 01099990005 / test1234"
  echo ""
  echo "교육청1:"
  echo "  김민서: 01099990006 / test1234"
  echo ""
  echo "표준사업장:"
  echo "  supplier_emp01: 01099990012 / test1234"
  echo ""
else
  echo "❌ 로그인 실패"
fi
