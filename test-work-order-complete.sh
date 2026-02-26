#!/bin/bash

echo "=========================================="
echo "업무지시 완료 처리 테스트"
echo "=========================================="
echo ""

# Login
TOKEN=$(curl -s -X POST https://jangpyosa.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"01099990001","password":"test1234"}' | jq -r '.accessToken')

echo "1️⃣ 업무지시 목록 조회..."
WORK_ORDERS=$(curl -s -X GET https://jangpyosa.com/api/work-orders/my-work-orders \
  -H "Authorization: Bearer $TOKEN")

COUNT=$(echo "$WORK_ORDERS" | jq '.workOrders | length')
echo "총 ${COUNT}개의 업무지시"
echo ""

if [ "$COUNT" -gt 0 ]; then
  # 첫 번째 업무지시 ID
  WORK_ORDER_ID=$(echo "$WORK_ORDERS" | jq -r '.workOrders[0].id')
  TITLE=$(echo "$WORK_ORDERS" | jq -r '.workOrders[0].title')
  IS_CONFIRMED=$(echo "$WORK_ORDERS" | jq -r '.workOrders[0].isConfirmed')
  
  echo "첫 번째 업무:"
  echo "  ID: $WORK_ORDER_ID"
  echo "  제목: $TITLE"
  echo "  완료 여부: $IS_CONFIRMED"
  echo ""
  
  if [ "$IS_CONFIRMED" == "false" ]; then
    echo "2️⃣ 업무 완료 처리 시도..."
    RESULT=$(curl -s -X POST https://jangpyosa.com/api/work-orders/${WORK_ORDER_ID}/confirm \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"note":"업무 완료 보고서입니다."}')
    
    echo "$RESULT" | jq '.'
    
    if echo "$RESULT" | jq -e '.confirmation' > /dev/null 2>&1; then
      echo ""
      echo "✅ 완료 처리 성공!"
      
      echo ""
      echo "3️⃣ 업무지시 목록 다시 조회..."
      WORK_ORDERS_AFTER=$(curl -s -X GET https://jangpyosa.com/api/work-orders/my-work-orders \
        -H "Authorization: Bearer $TOKEN")
      
      IS_CONFIRMED_AFTER=$(echo "$WORK_ORDERS_AFTER" | jq -r ".workOrders[] | select(.id == \"$WORK_ORDER_ID\") | .isConfirmed")
      echo "완료 후 isConfirmed: $IS_CONFIRMED_AFTER"
      
      if [ "$IS_CONFIRMED_AFTER" == "true" ]; then
        echo "✅ 상태 변경 확인됨!"
      else
        echo "❌ 상태 변경 안됨 - API 응답 확인 필요"
      fi
    else
      echo ""
      echo "❌ 완료 처리 실패"
    fi
  else
    echo "⚠️ 이미 완료된 업무입니다"
  fi
fi
