#!/bin/bash
###############################################
# 샌드박스 → EC2 실시간 동기화 스크립트
# 작성일: 2026-02-26
###############################################

set -e

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# SSH 설정
SSH_KEY="$HOME/.ssh/jangpyosa"
EC2_HOST="ubuntu@43.201.0.129"
EC2_PATH="/home/ubuntu/jangpyosa"
LOCAL_PATH="/home/user/webapp"

# SSH 키 확인
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}❌ SSH 키를 찾을 수 없습니다: $SSH_KEY${NC}"
    exit 1
fi

echo -e "${GREEN}🔄 EC2 서버로 파일 동기화 시작...${NC}"
echo "로컬: $LOCAL_PATH"
echo "원격: $EC2_HOST:$EC2_PATH"
echo ""

# rsync 옵션:
# -a: archive mode (recursive, preserve permissions, times, etc.)
# -v: verbose
# -z: compress during transfer
# -h: human-readable
# --delete: delete files on remote that don't exist locally
# --exclude: exclude patterns

rsync -avzh --delete \
    --exclude 'node_modules/' \
    --exclude '.next/' \
    --exclude '.git/' \
    --exclude '*.log' \
    --exclude '.env.local' \
    --exclude 'dev.db' \
    --exclude 'dev.db.*' \
    --exclude '*.backup*' \
    --exclude '*.bak*' \
    --exclude '*-backup-*' \
    --exclude 'dist/' \
    --exclude '.ssh-config/' \
    --exclude 'sync-to-ec2.sh' \
    --exclude '*.md' \
    --exclude '*.patch' \
    --exclude 'test-*.ts' \
    --exclude 'check-*.ts' \
    --exclude 'verify-*.ts' \
    --exclude 'analyze-*.ts' \
    --exclude 'reverse-*.ts' \
    -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
    "$LOCAL_PATH/" \
    "$EC2_HOST:$EC2_PATH/" || {
        echo -e "${RED}❌ 동기화 실패${NC}"
        exit 1
    }

echo ""
echo -e "${GREEN}✅ 동기화 완료!${NC}"

# 원격에서 npm install 및 서비스 재시작 여부 확인
read -p "npm install 및 서비스 재시작하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}📦 npm install 실행 중...${NC}"
    ssh -i "$SSH_KEY" "$EC2_HOST" "cd $EC2_PATH/apps/api && npm install && cd $EC2_PATH/apps/web && npm install && npm run build"
    
    echo -e "${YELLOW}🔄 PM2 서비스 재시작 중...${NC}"
    ssh -i "$SSH_KEY" "$EC2_HOST" "pm2 restart all"
    
    echo -e "${GREEN}✅ 서비스 재시작 완료!${NC}"
fi

echo ""
echo -e "${GREEN}🎉 모든 작업 완료!${NC}"
