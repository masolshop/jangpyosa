#!/bin/bash

echo "=== 🔐 1. 관리자 로그인 ==="
LOGIN=$(curl -s -X POST http://43.201.0.129:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"01010000001","password":"test1234"}')

TOKEN=$(echo $LOGIN | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 로그인 실패"
  echo $LOGIN
  exit 1
fi

echo "✅ 토큰: ${TOKEN:0:20}..."

echo -e "\n=== 🔔 2. 알림 목록 조회 ==="
NOTIFICATIONS=$(curl -s -X GET "http://43.201.0.129:4000/notifications?limit=5" \
  -H "Authorization: Bearer $TOKEN")

echo "$NOTIFICATIONS" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f\"총 알림: {data.get('total', 0)}개\")
    print(f\"미읽음: {data.get('unreadCount', 0)}개\")
    print(f\"반환된 알림: {len(data.get('notifications', []))}개\")
    print(\"\n최근 알림:\")
    for noti in data.get('notifications', [])[:3]:
        read_status = '✅' if noti.get('read') else '🔔'
        print(f\"  {read_status} [{noti.get('type')}] {noti.get('title')}\")
        print(f\"     {noti.get('message')}\")
except Exception as e:
    print(f\"❌ 파싱 실패: {e}\")
    print(sys.stdin.read())
"

echo -e "\n=== 📊 3. 타입별 알림 개수 ==="
COUNT=$(curl -s -X GET "http://43.201.0.129:4000/notifications/unread-count?byType=true" \
  -H "Authorization: Bearer $TOKEN")

echo "$COUNT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f\"전체 미읽음: {data.get('total', 0)}개\")
    print(\"\n타입별:\")
    for type, count in data.get('byType', {}).items():
        if count > 0:
            print(f\"  {type}: {count}개\")
except Exception as e:
    print(f\"❌ 파싱 실패: {e}\")
"

