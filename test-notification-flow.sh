#!/bin/bash

echo "=== 1. 관리자 로그인 ==="
MANAGER_TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"01010000001","password":"test1234"}' | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

echo "Token: ${MANAGER_TOKEN:0:50}..."

echo -e "\n=== 2. 관리자 알림 확인 (Before) ==="
curl -s "http://localhost:4000/notifications/unread-count?byType=true" \
  -H "Authorization: Bearer $MANAGER_TOKEN"

echo -e "\n\n=== 3. 직원 로그인 ==="
EMPLOYEE_TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"01010010001","password":"test1234"}' | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

echo "Token: ${EMPLOYEE_TOKEN:0:50}..."

echo -e "\n=== 4. 직원이 첫 번째 공지 확인 ==="
FIRST_ANN=$(curl -s "http://localhost:4000/company-announcements?limit=1" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "공지 ID: $FIRST_ANN"

if [ ! -z "$FIRST_ANN" ]; then
  curl -s -X POST "http://localhost:4000/company-announcements/$FIRST_ANN/read" \
    -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
    -H "Content-Type: application/json"
fi

echo -e "\n\n=== 5. 직원이 첫 번째 업무 완료 ==="
FIRST_WO=$(curl -s "http://localhost:4000/work-orders?limit=1" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "업무 ID: $FIRST_WO"

if [ ! -z "$FIRST_WO" ]; then
  curl -s -X POST "http://localhost:4000/work-orders/$FIRST_WO/confirm" \
    -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"note":"테스트 완료"}'
fi

echo -e "\n\n=== 6. 관리자 알림 확인 (After) ==="
curl -s "http://localhost:4000/notifications/unread-count?byType=true" \
  -H "Authorization: Bearer $MANAGER_TOKEN"

echo -e "\n\n=== 7. 관리자 최근 알림 5개 ==="
curl -s "http://localhost:4000/notifications?limit=5" \
  -H "Authorization: Bearer $MANAGER_TOKEN" | grep -o '"title":"[^"]*","message":"[^"]*"' | head -5

echo ""
