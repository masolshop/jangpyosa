#!/bin/bash
###############################################
# 샌드박스 → EC2 소스코드만 동기화 (빠른 버전)
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

echo -e "${GREEN}🔄 EC2 서버로 소스코드 동기화 시작...${NC}"
echo "로컬: $LOCAL_PATH"
echo "원격: $EC2_HOST:$EC2_PATH"
echo ""

# 동기화할 디렉토리만 지정 (apps/ 내부만)
rsync -avzh \
    --include='apps/***' \
    --exclude='*' \
    --exclude='node_modules/' \
    --exclude='.next/' \
    --exclude='dist/' \
    --exclude='*.log' \
    --exclude='*.backup*' \
    --exclude='*.bak*' \
    --exclude='dev.db*' \
    -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
    "$LOCAL_PATH/" \
    "$EC2_HOST:$EC2_PATH/" || {
        echo -e "${RED}❌ 동기화 실패${NC}"
        exit 1
    }

echo ""
echo -e "${GREEN}✅ 소스코드 동기화 완료!${NC}"
echo -e "${YELLOW}📝 참고: apps/ 디렉토리의 소스코드만 동기화되었습니다.${NC}"
