#!/bin/bash

echo "=== 🔐 관리자 로그인 ==="
LOGIN_RESPONSE=$(curl -s -X POST http://43.201.0.129:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"01010000001","password":"test1234"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
echo "로그인 성공: $TOKEN" | cut -c1-50

echo -e "\n=== 📋 업무지시 목록 조회 ==="
WO_LIST=$(curl -s -X GET "http://43.201.0.129:4000/work-orders?limit=5" \
  -H "Authorization: Bearer $TOKEN")
echo "$WO_LIST" | jq '{total: .total, items: .items | length, first: .items[0].title}'

echo -e "\n=== 📢 공지사항 목록 조회 ==="
ANN_LIST=$(curl -s -X GET "http://43.201.0.129:4000/announcements/list?limit=5" \
  -H "Authorization: Bearer $TOKEN")
echo "$ANN_LIST" | jq '{total: .total, items: .items | length, first: .items[0].title}'

echo -e "\n=== 👥 직원 목록 조회 ==="
EMP_LIST=$(curl -s -X GET "http://43.201.0.129:4000/employees?limit=5" \
  -H "Authorization: Bearer $TOKEN")
echo "$EMP_LIST" | jq 'if type == "object" then {total: .total, items: .items | length} else {error: .} end'

echo -e "\n=== 업무지시 상세 (첫번째) ==="
WO_ID=$(echo $WO_LIST | jq -r '.items[0].id')
if [ "$WO_ID" != "null" ]; then
  WO_DETAIL=$(curl -s -X GET "http://43.201.0.129:4000/work-orders/$WO_ID" \
    -H "Authorization: Bearer $TOKEN")
  echo "$WO_DETAIL" | jq '{
    title: .title,
    recipientsCount: .recipients | length,
    confirmedCount: ([.recipients[] | select(.completedAt != null)] | length)
  }'
else
  echo "업무지시 ID를 찾을 수 없습니다."
fi

echo -e "\n=== 🔔 알림 조회 ==="
NOTI=$(curl -s -X GET "http://43.201.0.129:4000/notifications?limit=5" \
  -H "Authorization: Bearer $TOKEN")
echo "$NOTI" | jq '{total: .total, unreadCount: .unreadCount, items: .items | length}'

echo -e "\n=== 🔔 타입별 알림 개수 ==="
NOTI_COUNT=$(curl -s -X GET "http://43.201.0.129:4000/notifications/unread-count?byType=true" \
  -H "Authorization: Bearer $TOKEN")
echo "$NOTI_COUNT" | jq '.'

