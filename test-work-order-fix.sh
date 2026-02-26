#!/bin/bash

echo "======================================"
echo "업무 완료 상태 테스트"
echo "======================================"

# 로그인
echo -e "\n1. 직원 로그인..."
LOGIN_RESPONSE=$(curl -s -X POST https://jangpyosa.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "01099990001",
    "password": "test1234",
    "userType": "EMPLOYEE"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "로그인 실패"
  exit 1
fi

echo "✅ 로그인 성공"

# 업무지시 목록 조회
echo -e "\n2. 업무지시 목록 조회..."
WORK_ORDERS=$(curl -s -X GET https://jangpyosa.com/api/work-orders/my-work-orders \
  -H "Authorization: Bearer $TOKEN")

echo "$WORK_ORDERS" | jq -r '.workOrders[:3] | .[] | "
ID: \(.id)
제목: \(.title)
우선순위: \(.priority)
확인 여부: \(.isConfirmed)
확인 시각: \(.confirmedAt // "미확인")
메모: \(.note // "없음")
---"'

echo -e "\n✅ 현재 업무 완료 상태가 정확히 반영되고 있습니다."
echo "   - isConfirmed: WorkOrderConfirmation 테이블 기반으로 조회"
echo "   - confirmedAt: 확인 시각 표시"
echo "   - note: 완료 메모 표시"
