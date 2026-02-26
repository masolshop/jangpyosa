#!/bin/bash

echo "=========================================="
echo "휴가 관리 API 테스트"
echo "=========================================="
echo ""

# Login
TOKEN=$(curl -s -X POST https://jangpyosa.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"01099990001","password":"test1234"}' | jq -r '.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ 로그인 실패"
  exit 1
fi

echo "✅ 로그인 성공"
echo ""

# Test /me endpoint
echo "1️⃣ /auth/me 테스트..."
ME=$(curl -s -X GET https://jangpyosa.com/api/auth/me \
  -H "Authorization: Bearer $TOKEN")

echo "$ME" | jq '{
  id: .user.id,
  name: .user.name,
  role: .user.role,
  employeeId: .user.employeeId,
  companyId: .user.companyId
}'

EMPLOYEE_ID=$(echo "$ME" | jq -r '.user.employeeId')
COMPANY_ID=$(echo "$ME" | jq -r '.user.companyId')

echo ""
if [ "$EMPLOYEE_ID" != "null" ] && [ "$COMPANY_ID" != "null" ]; then
  echo "✅ employeeId: $EMPLOYEE_ID"
  echo "✅ companyId: $COMPANY_ID"
else
  echo "❌ employeeId 또는 companyId가 없습니다"
fi

echo ""
echo "2️⃣ 휴가 유형 조회..."
TYPES=$(curl -s -X GET https://jangpyosa.com/api/leave/types \
  -H "Authorization: Bearer $TOKEN")

TYPE_COUNT=$(echo "$TYPES" | jq '.leaveTypes | length')
echo "휴가 유형: $TYPE_COUNT개"

if [ "$TYPE_COUNT" -gt 0 ]; then
  echo ""
  echo "첫 번째 유형:"
  echo "$TYPES" | jq '.leaveTypes[0] | {id, name, isPaid, maxDaysPerYear}'
  
  LEAVE_TYPE_ID=$(echo "$TYPES" | jq -r '.leaveTypes[0].id')
  
  echo ""
  echo "3️⃣ 휴가 신청 테스트..."
  echo "   leaveTypeId: $LEAVE_TYPE_ID"
  echo "   시작일: 2026-03-10"
  echo "   종료일: 2026-03-11"
  echo "   일수: 2"
  
  REQUEST=$(curl -s -X POST https://jangpyosa.com/api/leave/requests \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"leaveTypeId\": \"$LEAVE_TYPE_ID\",
      \"startDate\": \"2026-03-10\",
      \"endDate\": \"2026-03-11\",
      \"days\": \"2\",
      \"reason\": \"개인 사유로 인한 휴가 신청\"
    }")
  
  echo "$REQUEST" | jq '.'
  
  if echo "$REQUEST" | jq -e '.request' > /dev/null 2>&1; then
    echo ""
    echo "✅ 휴가 신청 성공!"
  else
    echo ""
    echo "❌ 휴가 신청 실패"
  fi
fi
