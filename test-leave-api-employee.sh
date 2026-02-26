#!/bin/bash

echo "=== 1. 장애인 직원 로그인 (박영희) ==="
LOGIN_RES=$(curl -s -X POST https://jangpyosa.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "01099990001", "password": "test1234", "userType": "BUYER"}')

TOKEN=$(echo "$LOGIN_RES" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ 로그인 실패"
  echo "$LOGIN_RES" | python3 -m json.tool
  exit 1
fi

echo "✅ 로그인 성공"
echo ""

echo "=== 2. 휴가 유형 조회 (/api/leave/types) - 장애인도 조회 가능해야 함 ==="
TYPES_RES=$(curl -s -X GET "https://jangpyosa.com/api/leave/types" \
  -H "Authorization: Bearer $TOKEN")
echo "$TYPES_RES" | python3 -m json.tool
echo ""

echo "=== 3. 내 휴가 신청 목록 (/api/leave/requests/my) ==="
MY_REQ_RES=$(curl -s -X GET "https://jangpyosa.com/api/leave/requests/my" \
  -H "Authorization: Bearer $TOKEN")
echo "$MY_REQ_RES" | python3 -m json.tool
