#!/bin/bash
###############################################
# 샌드박스 → EC2 자동 실시간 동기화
# 파일 변경 감지 및 자동 업로드
# 작성일: 2026-02-26
###############################################

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# SSH 설정
SSH_KEY="$HOME/.ssh/jangpyosa"
EC2_HOST="ubuntu@43.201.0.129"
EC2_PATH="/home/ubuntu/jangpyosa"
LOCAL_PATH="/home/user/webapp"
WATCH_DIRS="apps/"

# 로그 파일
LOG_FILE="$LOCAL_PATH/auto-sync.log"
PID_FILE="$LOCAL_PATH/auto-sync.pid"

# 마지막 동기화 시간
LAST_SYNC_FILE="$LOCAL_PATH/.last-sync"
SYNC_INTERVAL=5  # 5초마다 체크

echo -e "${GREEN}🔄 자동 동기화 시작...${NC}"
echo "로컬: $LOCAL_PATH"
echo "원격: $EC2_HOST:$EC2_PATH"
echo "감시 디렉토리: $WATCH_DIRS"
echo "동기화 간격: ${SYNC_INTERVAL}초"
echo ""

# PID 저장
echo $$ > "$PID_FILE"

# 초기 동기화
echo -e "${BLUE}📦 초기 동기화 실행 중...${NC}"
rsync -avz --delete \
    --exclude 'node_modules/' \
    --exclude '.next/' \
    --exclude 'dist/' \
    --exclude '*.log' \
    --exclude '*.backup*' \
    --exclude '*.bak*' \
    --exclude 'dev.db*' \
    --exclude '.git/' \
    -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
    "$LOCAL_PATH/$WATCH_DIRS" \
    "$EC2_HOST:$EC2_PATH/$WATCH_DIRS" >> "$LOG_FILE" 2>&1

echo -e "${GREEN}✅ 초기 동기화 완료${NC}"
echo ""

# 마지막 동기화 시간 저장
date +%s > "$LAST_SYNC_FILE"

# 파일 변경 감지 및 동기화 루프
SYNC_COUNT=0
echo -e "${YELLOW}👀 파일 변경 감시 중... (Ctrl+C로 종료)${NC}"
echo ""

while true; do
    # 변경된 파일 찾기 (최근 ${SYNC_INTERVAL}초 이내)
    CHANGED_FILES=$(find "$LOCAL_PATH/$WATCH_DIRS" \
        -type f \
        -newermt "@$(cat $LAST_SYNC_FILE)" \
        ! -path "*/node_modules/*" \
        ! -path "*/.next/*" \
        ! -path "*/dist/*" \
        ! -name "*.log" \
        ! -name "*.backup*" \
        ! -name "*.bak*" \
        ! -name "dev.db*" \
        2>/dev/null)
    
    if [ -n "$CHANGED_FILES" ]; then
        SYNC_COUNT=$((SYNC_COUNT + 1))
        TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
        
        echo -e "${GREEN}🔄 변경 감지! 동기화 중... (#$SYNC_COUNT)${NC}"
        echo "$CHANGED_FILES" | head -5
        
        # 동기화 실행
        rsync -avz --delete \
            --exclude 'node_modules/' \
            --exclude '.next/' \
            --exclude 'dist/' \
            --exclude '*.log' \
            --exclude '*.backup*' \
            --exclude '*.bak*' \
            --exclude 'dev.db*' \
            --exclude '.git/' \
            -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
            "$LOCAL_PATH/$WATCH_DIRS" \
            "$EC2_HOST:$EC2_PATH/$WATCH_DIRS" >> "$LOG_FILE" 2>&1
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 동기화 완료 [$TIMESTAMP]${NC}"
            echo "$TIMESTAMP - Sync #$SYNC_COUNT completed" >> "$LOG_FILE"
        else
            echo -e "${RED}❌ 동기화 실패 [$TIMESTAMP]${NC}"
            echo "$TIMESTAMP - Sync #$SYNC_COUNT failed" >> "$LOG_FILE"
        fi
        echo ""
        
        # 마지막 동기화 시간 업데이트
        date +%s > "$LAST_SYNC_FILE"
    fi
    
    # 대기
    sleep $SYNC_INTERVAL
done
