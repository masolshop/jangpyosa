#!/bin/bash

TOKEN=$(curl -s -X POST https://jangpyosa.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"01099990001","password":"test1234"}' | jq -r '.accessToken')

echo "👤 사용자 정보:"
curl -s -X GET https://jangpyosa.com/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
