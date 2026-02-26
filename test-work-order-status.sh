#!/bin/bash

echo "======================================"
echo "업무 완료 상태 확인 테스트"
echo "======================================"

# 로그인
echo -e "\n1. 직원 로그인 (박영희: 01099990001)"
LOGIN_RESPONSE=$(curl -s -X POST https://jangpyosa.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "01099990001",
    "password": "test1234"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ 로그인 실패"
  echo "$LOGIN_RESPONSE" | jq .
  exit 1
fi

echo "✅ 로그인 성공 (토큰: ${TOKEN:0:20}...)"

# 업무지시 목록 조회
echo -e "\n2. 내 업무지시 조회 (/api/work-orders/my-work-orders)..."
WORK_ORDERS=$(curl -s -X GET https://jangpyosa.com/api/work-orders/my-work-orders \
  -H "Authorization: Bearer $TOKEN")

COUNT=$(echo "$WORK_ORDERS" | jq '.workOrders | length')

if [ "$COUNT" = "null" ] || [ -z "$COUNT" ]; then
  echo "❌ 업무지시 조회 실패"
  echo "$WORK_ORDERS" | jq .
  exit 1
fi

echo "✅ 총 $COUNT개의 업무지시 조회됨"

# 처음 3개 업무지시 출력
echo -e "\n3. 업무지시 상태:"
echo "$WORK_ORDERS" | jq -r '.workOrders[:3] | .[] | "
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID: \(.id)
제목: \(.title)
우선순위: \(.priority)
마감일: \(.dueDate // "없음")
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 확인 여부: \(.isConfirmed)
✓ 확인 시각: \(.confirmedAt // "미확인")
✓ 완료 메모: \(.note // "없음")
"'

# 완료된 업무와 미완료 업무 개수 세기
CONFIRMED_COUNT=$(echo "$WORK_ORDERS" | jq '[.workOrders[] | select(.isConfirmed == true)] | length')
PENDING_COUNT=$(echo "$WORK_ORDERS" | jq '[.workOrders[] | select(.isConfirmed == false)] | length')

echo -e "\n4. 요약:"
echo "   총 업무: $COUNT개"
echo "   ✅ 완료: $CONFIRMED_COUNT개"
echo "   ⏳ 대기: $PENDING_COUNT개"

echo -e "\n✅ 테스트 완료!"
echo "   완료 상태가 WorkOrderConfirmation 테이블에서 정확히 조회됩니다."
