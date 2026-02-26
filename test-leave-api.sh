#!/bin/bash

echo "=== 1. 기업 로그인 (바이어) ==="
LOGIN_RES=$(curl -s -X POST https://jangpyosa.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "01012345678", "password": "test1234", "userType": "BUYER"}')

TOKEN=$(echo "$LOGIN_RES" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ 로그인 실패"
  echo "$LOGIN_RES" | python3 -m json.tool
  exit 1
fi

echo "✅ 로그인 성공"
echo ""

echo "=== 2. 휴가 유형 조회 (/api/leave/types) ==="
curl -s -X GET "https://jangpyosa.com/api/leave/types" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

echo "=== 3. 휴가 신청 목록 조회 (/api/leave/requests) ==="
curl -s -X GET "https://jangpyosa.com/api/leave/requests" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
