#!/bin/bash

###############################################################################
# 장표사닷컴 AWS 배포 검증 스크립트
# 
# 실제 배포는 하지 않고, 배포 전 환경을 검증합니다.
###############################################################################

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_info "=========================================="
log_info "AWS 배포 환경 검증 시작"
log_info "=========================================="

# 1. SSH 키 확인
SSH_KEY="$HOME/.ssh/jangpyosa.pem"
log_info "1. SSH 키 확인 중..."

if [ -f "$SSH_KEY" ]; then
    log_success "SSH 키 발견: $SSH_KEY"
    PERMISSIONS=$(stat -c %a "$SSH_KEY" 2>/dev/null || stat -f %Lp "$SSH_KEY" 2>/dev/null)
    
    if [ "$PERMISSIONS" = "600" ]; then
        log_success "SSH 키 권한 올바름 (600)"
    else
        log_info "SSH 키 권한 수정 중... (현재: $PERMISSIONS)"
        chmod 600 "$SSH_KEY"
        log_success "SSH 키 권한 수정 완료 (600)"
    fi
else
    log_error "SSH 키를 찾을 수 없습니다: $SSH_KEY"
    exit 1
fi

# 2. SSH 연결 테스트
SSH_USER="ubuntu"
SSH_HOST="jangpyosa.com"
SSH_OPTIONS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10"

log_info "2. SSH 연결 테스트 중..."
if ssh -i "$SSH_KEY" $SSH_OPTIONS "$SSH_USER@$SSH_HOST" "echo '연결 성공'" 2>/dev/null; then
    log_success "SSH 연결 성공: $SSH_USER@$SSH_HOST"
else
    log_error "SSH 연결 실패: $SSH_USER@$SSH_HOST"
    log_info "네트워크 또는 SSH 키를 확인해주세요"
    exit 1
fi

# 3. 원격 서버 상태 확인
log_info "3. 원격 서버 상태 확인 중..."

ssh -i "$SSH_KEY" $SSH_OPTIONS "$SSH_USER@$SSH_HOST" << 'ENDSSH'
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[서버]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[서버]${NC} $1"
}

log_error() {
    echo -e "${RED}[서버]${NC} $1"
}

log_info "프로젝트 디렉토리 확인..."
if [ -d "/home/ubuntu/jangpyosa" ]; then
    log_success "프로젝트 디렉토리 존재: /home/ubuntu/jangpyosa"
    
    cd /home/ubuntu/jangpyosa
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    CURRENT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    
    log_info "현재 브랜치: $CURRENT_BRANCH"
    log_info "현재 커밋: $CURRENT_COMMIT"
else
    log_error "프로젝트 디렉토리가 없습니다"
    exit 1
fi

log_info "PM2 프로세스 확인..."
if command -v pm2 &> /dev/null; then
    pm2 list
    log_success "PM2 설치 확인 완료"
else
    log_error "PM2가 설치되어 있지 않습니다"
    exit 1
fi

log_info "서비스 Health Check..."
API_HEALTH=$(curl -s http://localhost:4000/health 2>/dev/null || echo "FAIL")
WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003 2>/dev/null || echo "000")

if echo "$API_HEALTH" | grep -q "ok"; then
    log_success "API 서버 정상 동작 (4000 포트)"
else
    log_error "API 서버 응답 없음"
fi

if [ "$WEB_STATUS" = "200" ] || [ "$WEB_STATUS" = "304" ]; then
    log_success "WEB 서버 정상 동작 (3003 포트)"
else
    log_error "WEB 서버 응답 없음 (HTTP $WEB_STATUS)"
fi

ENDSSH

if [ $? -eq 0 ]; then
    log_info ""
    log_success "=========================================="
    log_success "✅ 모든 검증 통과!"
    log_success "=========================================="
    log_info ""
    log_info "배포 준비가 완료되었습니다."
    log_info "다음 명령어로 배포를 실행할 수 있습니다:"
    log_info "  ./scripts/deploy-to-aws.sh production"
else
    log_error "=========================================="
    log_error "❌ 검증 실패"
    log_error "=========================================="
    exit 1
fi
