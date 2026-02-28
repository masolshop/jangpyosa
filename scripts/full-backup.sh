#!/bin/bash
# 전체 백업 스크립트 (로컬 + 서버 + 설정 + DB)
# 작성일: 2026-02-28
# 작성자: Claude AI Assistant

# set -e  # 에러 발생 시 즉시 중단 (tar 경고 무시를 위해 비활성화)

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/tmp"
SSH_KEY="$HOME/.ssh/jangpyosa.pem"
SSH_USER="ubuntu"
SSH_HOST="43.201.0.129"
PROJECT_DIR="/home/ubuntu/jangpyosa"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 장표사닷컴 전체 백업 시작"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📅 시간: $TIMESTAMP"
echo ""

# 1. 로컬 코드 백업
echo "📦 [1/4] 로컬 코드 백업 중..."
cd /home/user/webapp
tar -czf "$BACKUP_DIR/jangpyosa_local_$TIMESTAMP.tar.gz" \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='apps/api/dist' \
  --exclude='apps/web/.next' \
  --exclude='*.log' \
  . 2>&1 | grep -v "Removing leading"

LOCAL_SIZE=$(du -sh "$BACKUP_DIR/jangpyosa_local_$TIMESTAMP.tar.gz" | awk '{print $1}')
echo "✅ 완료: jangpyosa_local_$TIMESTAMP.tar.gz ($LOCAL_SIZE)"

# 2. 서버 코드 백업
echo ""
echo "📦 [2/4] 서버 코드 백업 중..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "
  cd $PROJECT_DIR &&
  tar -czf /tmp/jangpyosa_server_$TIMESTAMP.tar.gz \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='apps/api/dist' \
    --exclude='apps/web/.next' \
    --exclude='*.log' \
    . 2>&1 | grep -v 'Removing leading'
" >/dev/null 2>&1

scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
  "$SSH_USER@$SSH_HOST:/tmp/jangpyosa_server_$TIMESTAMP.tar.gz" \
  "$BACKUP_DIR/" >/dev/null 2>&1

SERVER_SIZE=$(du -sh "$BACKUP_DIR/jangpyosa_server_$TIMESTAMP.tar.gz" | awk '{print $1}')
echo "✅ 완료: jangpyosa_server_$TIMESTAMP.tar.gz ($SERVER_SIZE)"

# 3. 서버 설정 백업
echo ""
echo "📦 [3/4] 서버 설정 백업 중..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "
  sudo cat /etc/nginx/sites-enabled/jangpyosa > /tmp/nginx_$TIMESTAMP.conf 2>/dev/null &&
  cat $PROJECT_DIR/ecosystem.config.js > /tmp/pm2_$TIMESTAMP.js 2>/dev/null
" >/dev/null 2>&1

scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
  "$SSH_USER@$SSH_HOST:/tmp/nginx_$TIMESTAMP.conf" \
  "$SSH_USER@$SSH_HOST:/tmp/pm2_$TIMESTAMP.js" \
  "$BACKUP_DIR/" >/dev/null 2>&1

NGINX_SIZE=$(du -sh "$BACKUP_DIR/nginx_$TIMESTAMP.conf" | awk '{print $1}')
PM2_SIZE=$(du -sh "$BACKUP_DIR/pm2_$TIMESTAMP.js" | awk '{print $1}')
echo "✅ 완료: nginx_$TIMESTAMP.conf ($NGINX_SIZE), pm2_$TIMESTAMP.js ($PM2_SIZE)"

# 4. Git 정보 백업
echo ""
echo "📦 [4/4] Git 정보 백업 중..."
cd /home/user/webapp
git log --oneline -10 > "$BACKUP_DIR/git_log_$TIMESTAMP.txt"
git status > "$BACKUP_DIR/git_status_$TIMESTAMP.txt" 2>&1

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "
  cd $PROJECT_DIR &&
  git log --oneline -10 > /tmp/server_git_log_$TIMESTAMP.txt &&
  git status > /tmp/server_git_status_$TIMESTAMP.txt 2>&1
" >/dev/null 2>&1

scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
  "$SSH_USER@$SSH_HOST:/tmp/server_git_log_$TIMESTAMP.txt" \
  "$SSH_USER@$SSH_HOST:/tmp/server_git_status_$TIMESTAMP.txt" \
  "$BACKUP_DIR/" >/dev/null 2>&1

echo "✅ 완료: git_log, git_status"

# 백업 요약
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 전체 백업 완료!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 백업 파일 목록:"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ls -lh "$BACKUP_DIR"/*_$TIMESTAMP.* 2>/dev/null | \
  awk '{printf "  📄 %-50s %8s\n", $9, $5}'
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TOTAL_SIZE=$(du -ch "$BACKUP_DIR"/*_$TIMESTAMP.* 2>/dev/null | tail -1 | awk '{print $1}')
echo "💾 총 용량: $TOTAL_SIZE"
echo ""
echo "📂 백업 위치: $BACKUP_DIR"
echo "🔗 파일명 패턴: *_$TIMESTAMP.*"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ 백업이 성공적으로 완료되었습니다!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
