#!/bin/bash

echo "======================================"
echo "서버 API 배포 스크립트"
echo "======================================"

SERVER="ubuntu@15.164.103.96"
REMOTE_PATH="/home/ubuntu/jangpyosa"

echo -e "\n1. 서버 접속 테스트..."
if ! timeout 5 ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no $SERVER "echo '연결 성공'" 2>/dev/null; then
  echo "❌ 서버 연결 실패"
  echo ""
  echo "수동 배포 방법:"
  echo "----------------"
  echo "서버에 직접 접속하여 다음 명령을 실행하세요:"
  echo ""
  echo "ssh $SERVER"
  echo "cd $REMOTE_PATH"
  echo "git pull origin main"
  echo "pm2 restart jangpyosa-api"
  echo "pm2 logs jangpyosa-api --lines 20"
  echo ""
  exit 1
fi

echo "✅ 서버 연결 성공"

echo -e "\n2. Git pull..."
ssh -o StrictHostKeyChecking=no $SERVER "cd $REMOTE_PATH && git pull origin main"

echo -e "\n3. API 재시작..."
ssh -o StrictHostKeyChecking=no $SERVER "pm2 restart jangpyosa-api"

echo -e "\n4. 서비스 상태 확인..."
ssh -o StrictHostKeyChecking=no $SERVER "pm2 status"

echo -e "\n5. 최근 로그 확인..."
ssh -o StrictHostKeyChecking=no $SERVER "pm2 logs jangpyosa-api --lines 10 --nostream"

echo -e "\n✅ 배포 완료!"

