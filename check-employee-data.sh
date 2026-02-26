#!/bin/bash

echo "=========================================="
echo "직원 데이터 확인"
echo "=========================================="
echo ""

# Login as emp01
echo "🔐 박영희 (01099990001) 로그인 중..."
LOGIN=$(curl -s -X POST https://jangpyosa.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"01099990001","password":"test1234"}')

TOKEN=$(echo "$LOGIN" | jq -r '.accessToken')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "✅ 로그인 성공"
  echo ""
  
  echo "👤 사용자 정보 조회..."
  USER=$(curl -s -X GET https://jangpyosa.com/api/auth/me \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$USER" | jq '{
    id: .user.id,
    name: .user.name,
    role: .user.role,
    employeeId: .user.employeeId,
    companyId: .user.companyId
  }'
  
  echo ""
  echo "📋 휴가 유형 조회..."
  TYPES=$(curl -s -X GET https://jangpyosa.com/api/leave/types \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$TYPES" | jq '.leaveTypes | length'
  echo "개의 휴가 유형"
  
  echo ""
  echo "🏖️ 내 휴가 신청 조회..."
  REQUESTS=$(curl -s -X GET https://jangpyosa.com/api/leave/requests/my \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$REQUESTS" | jq '.'
else
  echo "❌ 로그인 실패"
  echo "$LOGIN" | jq '.'
fi
