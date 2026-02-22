#!/bin/bash

###############################################################################
# AWS 서버 DDoS 방어 설정 배포 및 실행 스크립트
# 
# 로컬에서 실행하여 AWS 서버에 보안 설정을 적용합니다.
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

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# SSH 설정
SSH_KEY="$HOME/.ssh/jangpyosa.pem"
SSH_USER="ubuntu"
SSH_HOST="jangpyosa.com"
SSH_OPTIONS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

# 스크립트 경로
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log_info "=========================================="
log_info "AWS 서버 DDoS 방어 설정 배포"
log_info "=========================================="

# SSH 키 확인
if [ ! -f "$SSH_KEY" ]; then
    log_error "SSH 키를 찾을 수 없습니다: $SSH_KEY"
    exit 1
fi

chmod 600 "$SSH_KEY"
log_success "SSH 키 확인 완료"

# 작업 선택
echo ""
log_info "수행할 작업을 선택하세요:"
echo "  1) 보안 상태 점검만 실행"
echo "  2) DDoS 방어 설정 적용 (권장)"
echo "  3) 실시간 모니터링 시작"
echo "  4) 모두 실행 (점검 → 설정 → 모니터링)"
echo ""
read -p "선택 (1-4): " CHOICE

case $CHOICE in
    1)
        log_info "보안 상태 점검 실행 중..."
        
        # 스크립트 복사
        scp -i "$SSH_KEY" $SSH_OPTIONS "$SCRIPT_DIR/security-check.sh" "$SSH_USER@$SSH_HOST:/tmp/"
        
        # 실행
        ssh -i "$SSH_KEY" $SSH_OPTIONS "$SSH_USER@$SSH_HOST" "sudo bash /tmp/security-check.sh"
        
        log_success "보안 상태 점검 완료"
        ;;
        
    2)
        log_warning "=========================================="
        log_warning "주의: 이 작업은 서버 설정을 변경합니다"
        log_warning "=========================================="
        log_info "다음 작업이 수행됩니다:"
        log_info "  - fail2ban 설치 및 설정"
        log_info "  - Nginx Rate Limiting 설정"
        log_info "  - UFW 방화벽 강화"
        log_info "  - 커널 파라미터 최적화"
        log_info "  - 보안 헤더 추가"
        echo ""
        read -p "계속하시겠습니까? (y/N): " CONFIRM
        
        if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
            log_info "취소되었습니다"
            exit 0
        fi
        
        log_info "DDoS 방어 설정 배포 중..."
        
        # 스크립트 복사
        scp -i "$SSH_KEY" $SSH_OPTIONS "$SCRIPT_DIR/setup-ddos-protection.sh" "$SSH_USER@$SSH_HOST:/tmp/"
        
        # 실행
        ssh -i "$SSH_KEY" $SSH_OPTIONS "$SSH_USER@$SSH_HOST" "sudo bash /tmp/setup-ddos-protection.sh"
        
        log_success "=========================================="
        log_success "DDoS 방어 설정 완료!"
        log_success "=========================================="
        log_info ""
        log_info "다음 명령어로 상태를 확인할 수 있습니다:"
        log_info "  ssh -i $SSH_KEY $SSH_USER@$SSH_HOST"
        log_info "  sudo fail2ban-client status"
        log_info "  sudo ufw status"
        ;;
        
    3)
        log_info "실시간 모니터링 시작..."
        log_info "Ctrl+C로 종료할 수 있습니다"
        echo ""
        
        # 스크립트 복사
        scp -i "$SSH_KEY" $SSH_OPTIONS "$SCRIPT_DIR/monitor-security.sh" "$SSH_USER@$SSH_HOST:/tmp/"
        
        # 실행 (포그라운드)
        ssh -i "$SSH_KEY" $SSH_OPTIONS "$SSH_USER@$SSH_HOST" "sudo bash /tmp/monitor-security.sh"
        ;;
        
    4)
        log_info "전체 작업 실행 중..."
        
        # 1. 보안 점검
        log_info ""
        log_info "=========================================="
        log_info "Step 1/3: 보안 상태 점검"
        log_info "=========================================="
        scp -i "$SSH_KEY" $SSH_OPTIONS "$SCRIPT_DIR/security-check.sh" "$SSH_USER@$SSH_HOST:/tmp/"
        ssh -i "$SSH_KEY" $SSH_OPTIONS "$SSH_USER@$SSH_HOST" "sudo bash /tmp/security-check.sh"
        
        # 2. 설정 적용 확인
        log_info ""
        log_info "=========================================="
        log_info "Step 2/3: DDoS 방어 설정"
        log_info "=========================================="
        log_warning "서버 설정을 변경합니다"
        echo ""
        read -p "계속하시겠습니까? (y/N): " CONFIRM
        
        if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
            scp -i "$SSH_KEY" $SSH_OPTIONS "$SCRIPT_DIR/setup-ddos-protection.sh" "$SSH_USER@$SSH_HOST:/tmp/"
            ssh -i "$SSH_KEY" $SSH_OPTIONS "$SSH_USER@$SSH_HOST" "sudo bash /tmp/setup-ddos-protection.sh"
            log_success "설정 적용 완료"
        else
            log_warning "설정 적용 건너뜀"
        fi
        
        # 3. 모니터링
        log_info ""
        log_info "=========================================="
        log_info "Step 3/3: 실시간 모니터링"
        log_info "=========================================="
        read -p "실시간 모니터링을 시작하시겠습니까? (y/N): " MONITOR
        
        if [ "$MONITOR" = "y" ] || [ "$MONITOR" = "Y" ]; then
            scp -i "$SSH_KEY" $SSH_OPTIONS "$SCRIPT_DIR/monitor-security.sh" "$SSH_USER@$SSH_HOST:/tmp/"
            log_info "Ctrl+C로 종료할 수 있습니다"
            echo ""
            ssh -i "$SSH_KEY" $SSH_OPTIONS "$SSH_USER@$SSH_HOST" "sudo bash /tmp/monitor-security.sh"
        else
            log_info "모니터링 건너뜀"
        fi
        ;;
        
    *)
        log_error "잘못된 선택입니다"
        exit 1
        ;;
esac

log_info ""
log_success "=========================================="
log_success "작업 완료!"
log_success "=========================================="
