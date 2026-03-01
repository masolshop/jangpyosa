#!/bin/bash

echo "🔐 슈퍼어드민 계정 생성/업데이트"
echo "================================"

# API를 통해 생성
echo "📡 API 호출 방식으로 슈퍼어드민 생성 중..."

curl -X POST https://jangpyosa.com/api/create-super-admin \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: jangpyosa-super-secret-2025" \
  -d '{
    "phone": "01063529091",
    "name": "슈퍼관리자",
    "email": "admin@jangpyosa.com",
    "password": "admin123"
  }'

echo ""
echo ""
echo "✅ 완료"
echo ""
echo "🔑 로그인 정보:"
echo "   URL: https://jangpyosa.com/admin/login"
echo "   아이디: 01063529091"
echo "   비밀번호: admin123"
