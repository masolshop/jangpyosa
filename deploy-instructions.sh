#!/bin/bash

echo "=========================================="
echo "🚀 AWS 서버 배포 스크립트"
echo "=========================================="
echo ""
echo "이 스크립트를 AWS 서버에서 실행하세요:"
echo ""
echo "1. SSH 접속:"
echo "   ssh ubuntu@43.201.0.129"
echo ""
echo "2. 프로젝트 디렉토리로 이동:"
echo "   cd /home/ubuntu/jangpyosa"
echo ""
echo "3. 최신 코드 가져오기:"
echo "   git fetch origin"
echo "   git reset --hard origin/main"
echo ""
echo "4. API 빌드:"
echo "   cd apps/api"
echo "   npm run build"
echo ""
echo "5. Web 빌드:"
echo "   cd ../web"
echo "   npm run build"
echo ""
echo "6. PM2 재시작:"
echo "   pm2 restart jangpyosa-api"
echo "   pm2 restart jangpyosa-web"
echo ""
echo "7. 상태 확인:"
echo "   pm2 list"
echo "   pm2 logs --lines 20"
echo ""
echo "=========================================="
echo ""
echo "또는 한 번에 실행:"
echo ""
cat << 'EOF'
cd /home/ubuntu/jangpyosa && \
git fetch origin && \
git reset --hard origin/main && \
cd apps/api && npm run build && \
cd ../web && npm run build && \
pm2 restart jangpyosa-api && \
pm2 restart jangpyosa-web && \
pm2 list
EOF

echo ""
echo "=========================================="
echo "✅ 최신 커밋:"
echo "=========================================="
git log --oneline -5
echo ""
