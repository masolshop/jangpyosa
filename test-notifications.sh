#!/bin/bash

echo "🔔 알림 시스템 테스트 시작..."

# 페마연구소 관리자 (01010000001)
echo -e "\n1️⃣ 페마연구소 관리자 (김관리자)"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"phone":"01010000001","password":"test1234"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 로그인 실패"
  exit 1
fi

echo "✅ 로그인 성공"

# 알림 카운트 조회
echo -e "\n📊 알림 카운트 조회..."
NOTIFICATION_COUNT=$(curl -s -X GET http://localhost:4000/notifications/unread-count \
  -H "Authorization: Bearer $TOKEN")

echo "$NOTIFICATION_COUNT"

# 공지사항 리스트 조회
echo -e "\n📢 공지사항 목록..."
ANNOUNCEMENTS=$(curl -s -X GET http://localhost:4000/announcements/list \
  -H "Authorization: Bearer $TOKEN")

echo "$ANNOUNCEMENTS" | head -50

# 업무지시 리스트 조회
echo -e "\n📝 업무지시 목록..."
WORK_ORDERS=$(curl -s -X GET http://localhost:4000/work-orders/list \
  -H "Authorization: Bearer $TOKEN")

echo "$WORK_ORDERS" | head -50

# 휴가 신청 리스트 조회
echo -e "\n🏖️  휴가 신청 목록..."
LEAVE_REQUESTS=$(curl -s -X GET http://localhost:4000/leave/requests \
  -H "Authorization: Bearer $TOKEN")

echo "$LEAVE_REQUESTS" | head -50

echo -e "\n✅ 테스트 완료!"
