#!/bin/bash

echo "=========================================="
echo "직원 업무지시 API 테스트"
echo "=========================================="
echo ""

# Login as emp01
echo "🔐 박영희 (01099990001) 로그인 중..."
LOGIN_RESPONSE=$(curl -s -X POST https://jangpyosa.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"01099990001","password":"test1234"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "✅ 로그인 성공! Token: ${TOKEN:0:20}..."
  echo ""
  
  echo "📋 업무지시 목록 조회 중..."
  WORK_ORDERS=$(curl -s -X GET https://jangpyosa.com/api/work-orders/my-work-orders \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$WORK_ORDERS" | jq '.'
  
  COUNT=$(echo "$WORK_ORDERS" | jq '.workOrders | length')
  echo ""
  echo "✅ 조회 완료: $COUNT개의 업무지시"
  
  if [ "$COUNT" -gt 0 ]; then
    echo ""
    echo "📝 첫 번째 업무지시:"
    echo "$WORK_ORDERS" | jq '.workOrders[0] | {title, content: (.content[:50] + "..."), priority, isConfirmed}'
  fi
else
  echo "❌ 로그인 실패"
  echo "$LOGIN_RESPONSE" | jq '.'
fi
