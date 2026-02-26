#!/bin/bash

echo "======================================"
echo "서버 코드 버전 확인"
echo "======================================"

echo -e "\n1. 로컬 Git 커밋 확인:"
git log --oneline -3

echo -e "\n2. 서버 API 테스트 (완료된 업무 확인):"
# 로그인
LOGIN_RESPONSE=$(curl -s -X POST https://jangpyosa.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "01099990001",
    "password": "test1234"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ 로그인 실패"
  exit 1
fi

# 업무지시 조회
WORK_ORDERS=$(curl -s -X GET https://jangpyosa.com/api/work-orders/my-work-orders \
  -H "Authorization: Bearer $TOKEN")

# 첫 번째 업무의 확인 상태 체크
IS_CONFIRMED=$(echo "$WORK_ORDERS" | jq -r '.workOrders[0].isConfirmed')
TITLE=$(echo "$WORK_ORDERS" | jq -r '.workOrders[0].title')

echo "첫 번째 업무: $TITLE"
echo "확인 상태: $IS_CONFIRMED"

if [ "$IS_CONFIRMED" = "true" ]; then
  echo "✅ 서버 코드가 최신 버전입니다 (WorkOrderConfirmation 테이블 사용)"
else
  echo "❌ 서버 코드가 구버전입니다 (배포 필요)"
fi

echo -e "\n3. 완료 기록 직접 확인:"
curl -s -X POST https://jangpyosa.com/api/work-orders/wo_cmlu4gobz000910vpj1izl197_2/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"note":"테스트 완료"}' | jq .

