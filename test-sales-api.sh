#!/bin/bash

echo "🧪 영업 조직 API 테스트"
echo "========================="

# 1. 통계 조회
echo -e "\n1️⃣ 통계 조회 (GET /sales/stats)"
curl -s http://localhost:4000/sales/stats \
  -H "Authorization: Bearer test-super-admin-token" \
  | jq '.'

# 2. 영업 사원 목록 조회 (본부장만)
echo -e "\n2️⃣ 본부장 목록 (GET /sales/people?role=HEAD_MANAGER)"
curl -s "http://localhost:4000/sales/people?role=HEAD_MANAGER" \
  -H "Authorization: Bearer test-super-admin-token" \
  | jq '.salesPeople[] | {name, role, phone, totalReferrals, activeReferrals, totalRevenue, commission}'

# 3. 영업 사원 목록 조회 (지사장만)
echo -e "\n3️⃣ 지사장 목록 (GET /sales/people?role=BRANCH_MANAGER)"
curl -s "http://localhost:4000/sales/people?role=BRANCH_MANAGER" \
  -H "Authorization: Bearer test-super-admin-token" \
  | jq '.salesPeople[] | {name, role, phone, manager: .manager.name, subordinates: (.subordinates | length)}'

# 4. 전체 영업 사원 수
echo -e "\n4️⃣ 전체 영업 사원 수"
curl -s http://localhost:4000/sales/people \
  -H "Authorization: Bearer test-super-admin-token" \
  | jq '.salesPeople | length'

echo -e "\n✅ 테스트 완료"
