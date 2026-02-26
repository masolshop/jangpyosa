#!/bin/bash

echo "=== 장애인 직원 로그인 테스트 ==="
echo ""

# Login as emp01 (박영희)
echo "🔐 박영희 (01099990001) 로그인 중..."
TOKEN=$(curl -s -X POST https://jangpyosa.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"01099990001","password":"test1234"}' | jq -r '.accessToken')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "✅ 로그인 성공! Token: ${TOKEN:0:20}..."
  echo ""
  echo "📱 웹사이트에서 테스트:"
  echo "   URL: https://jangpyosa.com/employee/login"
  echo "   전화번호: 01099990001"
  echo "   비밀번호: test1234"
  echo ""
  echo "✨ 로그인 후 사이드바가 표시되는지 확인하세요!"
else
  echo "❌ 로그인 실패"
fi
