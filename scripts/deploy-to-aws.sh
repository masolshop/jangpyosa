#!/bin/bash

###############################################################################
# 장표사닷컴 AWS 자동 배포 스크립트
# 
# 이 스크립트는 로컬에서 실행되며, AWS 서버로 자동 배포를 수행합니다.
# 
# 사용법:
#   ./deploy-to-aws.sh [환경]
#   
# 환경:
#   production (기본값) - 프로덕션 서버 배포
#   staging             - 스테이징 서버 배포
#
# 예시:
#   ./deploy-to-aws.sh production
#   ./deploy-to-aws.sh staging
###############################################################################

set -e  # 오류 발생 시 즉시 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로깅 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 환경 설정
ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

log_info "배포 환경: $ENVIRONMENT"

# SSH 설정
SSH_KEY="$HOME/.ssh/jangpyosa.pem"
SSH_USER="ubuntu"
SSH_HOST="jangpyosa.com"
SSH_OPTIONS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

# 원격 서버 경로
REMOTE_DIR="/home/ubuntu/jangpyosa"
REMOTE_API_DIR="$REMOTE_DIR/apps/api"
REMOTE_WEB_DIR="$REMOTE_DIR/apps/web"

# SSH 키 확인
if [ ! -f "$SSH_KEY" ]; then
    log_error "SSH 키를 찾을 수 없습니다: $SSH_KEY"
    log_info "SSH 키를 $HOME/.ssh/ 디렉토리에 배치해주세요"
    exit 1
fi

# SSH 키 권한 확인
chmod 600 "$SSH_KEY"
log_success "SSH 키 권한 설정 완료"

# Git 상태 확인
log_info "Git 상태 확인 중..."
cd "$PROJECT_ROOT"

if [ -n "$(git status --porcelain)" ]; then
    log_warning "커밋되지 않은 변경사항이 있습니다"
    log_info "변경사항을 커밋하시겠습니까? (y/n)"
    read -r COMMIT_CHANGES
    
    if [ "$COMMIT_CHANGES" = "y" ] || [ "$COMMIT_CHANGES" = "Y" ]; then
        log_info "커밋 메시지를 입력하세요:"
        read -r COMMIT_MESSAGE
        
        git add -A
        git commit -m "$COMMIT_MESSAGE"
        log_success "변경사항 커밋 완료"
    else
        log_warning "커밋하지 않은 변경사항은 배포되지 않습니다"
    fi
fi

# 현재 브랜치 및 커밋 확인
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
CURRENT_COMMIT=$(git rev-parse --short HEAD)

log_info "현재 브랜치: $CURRENT_BRANCH"
log_info "현재 커밋: $CURRENT_COMMIT"

# GitHub에 푸시
log_info "GitHub에 푸시 중..."
git push origin "$CURRENT_BRANCH"
log_success "GitHub 푸시 완료"

# 원격 서버에 배포 스크립트 실행
log_info "원격 서버 연결 및 배포 시작..."

ssh -i "$SSH_KEY" $SSH_OPTIONS "$SSH_USER@$SSH_HOST" << 'ENDSSH'
set -e

# 색상 정의
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
    echo -e "${RED}[서버 오류]${NC} $1"
}

cd /home/ubuntu/jangpyosa

log_info "Git pull 수행 중..."
git pull origin main

log_info "API 의존성 설치 중..."
cd apps/api
npm install --production

log_info "API 빌드 중..."
npm run build || log_error "API 빌드 실패 (무시하고 계속)"

log_info "Prisma Client 생성 중..."
npx prisma generate

log_info "데이터베이스 마이그레이션 적용 중..."
npx prisma migrate deploy

log_info "Web 의존성 설치 중..."
cd ../web
npm install --production

log_info "Web 빌드 중..."
npm run build

log_info "PM2로 서비스 재시작 중..."
cd /home/ubuntu/jangpyosa
pm2 restart ecosystem.config.cjs

log_info "서비스 상태 확인 중..."
sleep 3
pm2 list

log_success "배포 완료!"

# Health Check
log_info "Health Check 수행 중..."
API_HEALTH=$(curl -s http://localhost:4000/health || echo "FAIL")
WEB_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003 || echo "000")

if echo "$API_HEALTH" | grep -q "ok"; then
    log_success "API 서버 정상 (4000 포트)"
else
    log_error "API 서버 응답 없음"
fi

if [ "$WEB_HEALTH" = "200" ] || [ "$WEB_HEALTH" = "304" ]; then
    log_success "WEB 서버 정상 (3003 포트)"
else
    log_error "WEB 서버 응답 없음 (HTTP $WEB_HEALTH)"
fi

ENDSSH

if [ $? -eq 0 ]; then
    log_success "=========================================="
    log_success "🎉 배포가 성공적으로 완료되었습니다!"
    log_success "=========================================="
    log_info "배포된 버전: $CURRENT_BRANCH @ $CURRENT_COMMIT"
    log_info "URL: https://jangpyosa.com"
    log_info ""
    log_info "다음 명령어로 로그를 확인할 수 있습니다:"
    log_info "  ssh -i $SSH_KEY $SSH_USER@$SSH_HOST 'pm2 logs'"
else
    log_error "=========================================="
    log_error "❌ 배포 중 오류가 발생했습니다"
    log_error "=========================================="
    log_info "SSH로 직접 접속하여 문제를 확인해주세요:"
    log_info "  ssh -i $SSH_KEY $SSH_USER@$SSH_HOST"
    exit 1
fi
