#!/bin/bash

# 기업관리자 로그인
echo "=== 기업관리자 로그인 (김관리자) ==="
MANAGER_TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"01010000001","password":"password123"}' | jq -r '.token')

if [ "$MANAGER_TOKEN" = "null" ] || [ -z "$MANAGER_TOKEN" ]; then
  echo "❌ 관리자 로그인 실패"
  exit 1
fi
echo "✅ 관리자 로그인 성공"

# 관리자 알림 확인
echo -e "\n=== 관리자 알림 현황 ==="
curl -s "http://localhost:4000/notifications/unread-count?byType=true" \
  -H "Authorization: Bearer $MANAGER_TOKEN" | jq .

# 최근 알림 5개
echo -e "\n=== 최근 알림 5개 ==="
curl -s "http://localhost:4000/notifications?limit=5" \
  -H "Authorization: Bearer $MANAGER_TOKEN" | jq '.notifications[] | {type, title, message, read, createdAt}'

# 직원 로그인 (김철수)
echo -e "\n=== 직원 로그인 (김철수) ==="
EMPLOYEE_TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"01010010001","password":"password123"}' | jq -r '.token')

if [ "$EMPLOYEE_TOKEN" = "null" ] || [ -z "$EMPLOYEE_TOKEN" ]; then
  echo "❌ 직원 로그인 실패"
  exit 1
fi
echo "✅ 직원 로그인 성공"

# 공지사항 목록 조회
echo -e "\n=== 미확인 공지사항 조회 ==="
ANNOUNCEMENTS=$(curl -s "http://localhost:4000/company-announcements?limit=5" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN")
echo "$ANNOUNCEMENTS" | jq '.announcements[] | {id, title, isRead}'

# 첫 번째 공지 확인 처리
FIRST_ANNOUNCEMENT_ID=$(echo "$ANNOUNCEMENTS" | jq -r '.announcements[0].id')
if [ "$FIRST_ANNOUNCEMENT_ID" != "null" ] && [ -n "$FIRST_ANNOUNCEMENT_ID" ]; then
  echo -e "\n=== 공지 $FIRST_ANNOUNCEMENT_ID 확인 처리 ==="
  curl -s -X POST "http://localhost:4000/company-announcements/$FIRST_ANNOUNCEMENT_ID/read" \
    -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
    -H "Content-Type: application/json" | jq .
fi

# 업무지시 목록 조회
echo -e "\n=== 미완료 업무지시 조회 ==="
WORK_ORDERS=$(curl -s "http://localhost:4000/work-orders?limit=5" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN")
echo "$WORK_ORDERS" | jq '.workOrders[] | {id, title, isConfirmed}'

# 첫 번째 업무 완료 처리
FIRST_WORK_ORDER_ID=$(echo "$WORK_ORDERS" | jq -r '.workOrders[0].id')
if [ "$FIRST_WORK_ORDER_ID" != "null" ] && [ -n "$FIRST_WORK_ORDER_ID" ]; then
  echo -e "\n=== 업무 $FIRST_WORK_ORDER_ID 완료 처리 ==="
  curl -s -X POST "http://localhost:4000/work-orders/$FIRST_WORK_ORDER_ID/confirm" \
    -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"note":"테스트 완료"}' | jq .
fi

# 다시 관리자 알림 확인
echo -e "\n=== 관리자 알림 재확인 (공지확인/업무완료 후) ==="
curl -s "http://localhost:4000/notifications/unread-count?byType=true" \
  -H "Authorization: Bearer $MANAGER_TOKEN" | jq .

echo -e "\n=== 관리자 최근 알림 ==="
curl -s "http://localhost:4000/notifications?limit=10" \
  -H "Authorization: Bearer $MANAGER_TOKEN" | jq '.notifications[] | {type, title, message, read, createdAt}' | head -30

