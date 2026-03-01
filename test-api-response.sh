#!/bin/bash
echo "🔍 API 응답 테스트 중..."

# 페마연 회사 ID 가져오기
COMPANY_ID=$(ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 "cd /home/ubuntu/jangpyosa/apps/api && node -e \"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const company = await prisma.company.findUnique({
    where: { bizNo: '2668101215' }
  });
  console.log(company.id);
  await prisma.\\\$disconnect();
})();
\"")

echo "회사 ID: $COMPANY_ID"
echo ""
echo "📡 API 응답 확인 중..."

# API 직접 호출
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 "curl -s http://localhost:5000/api/calculators/company/$COMPANY_ID/employees | jq '.employees[0]'"
