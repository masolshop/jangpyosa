#!/bin/bash

# 로그인
echo "=== 박영희 직원 로그인 ==="
LOGIN_RES=$(curl -s -X POST https://jangpyosa.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "01099990001", "password": "test1234", "userType": "BUYER"}')

TOKEN=$(echo "$LOGIN_RES" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ 로그인 실패"
  exit 1
fi

echo "✅ 로그인 성공"
echo ""

# 특정 업무지시에 대해 완료 요청 시도
echo "=== 업무지시 완료 요청 (wo_cmlu4gobz000910vpj1izl197_2) ==="
curl -s -X POST "https://jangpyosa.com/api/work-orders/wo_cmlu4gobz000910vpj1izl197_2/confirm" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note": "테스트 완료 메모"}' | python3 -m json.tool

echo ""
echo "=== 다시 업무지시 목록 조회 ==="
curl -s -X GET "https://jangpyosa.com/api/work-orders/my-work-orders" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys, json
data = json.load(sys.stdin)
orders = data.get('workOrders', [])
for wo in orders[:3]:
    print(f'ID: {wo[\"id\"]}')
    print(f'제목: {wo[\"title\"]}')
    print(f'확인 여부: {wo[\"isConfirmed\"]}')
    print(f'확인 시각: {wo.get(\"confirmedAt\", \"미확인\")}')
    print('-' * 40)
"
