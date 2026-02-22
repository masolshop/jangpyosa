#!/bin/bash

###############################################################################
# 서버 보안 상태 점검 스크립트
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
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_info "=========================================="
log_info "서버 보안 상태 점검 시작"
log_info "=========================================="

# 1. fail2ban 상태 확인
log_info "1. fail2ban 상태 확인..."
if systemctl is-active --quiet fail2ban; then
    log_success "fail2ban 실행 중"
    
    # Jail 상태 확인
    log_info "   활성화된 Jail 목록:"
    fail2ban-client status | grep "Jail list" || true
    
    # SSH Jail 상세 정보
    log_info "   SSH Jail 상태:"
    fail2ban-client status sshd || log_warning "   SSH Jail이 설정되지 않았습니다"
else
    log_error "fail2ban이 실행되고 있지 않습니다"
fi

echo ""

# 2. UFW 방화벽 상태
log_info "2. UFW 방화벽 상태 확인..."
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(ufw status | head -1)
    if echo "$UFW_STATUS" | grep -q "active"; then
        log_success "UFW 활성화됨"
        log_info "   현재 방화벽 규칙:"
        ufw status numbered | head -20
    else
        log_warning "UFW가 비활성화되어 있습니다"
    fi
else
    log_error "UFW가 설치되지 않았습니다"
fi

echo ""

# 3. 현재 연결 상태 분석
log_info "3. 현재 연결 상태 분석..."

log_info "   포트별 연결 수:"
netstat -an | grep ESTABLISHED | awk '{print $4}' | awk -F: '{print $NF}' | sort | uniq -c | sort -rn | head -10 || true

log_info "   IP별 연결 수 (상위 10개):"
netstat -an | grep ESTABLISHED | awk '{print $5}' | awk -F: '{print $1}' | sort | uniq -c | sort -rn | head -10 || true

echo ""

# 4. Nginx 설정 확인
log_info "4. Nginx 보안 설정 확인..."
if [ -f /etc/nginx/nginx.conf ]; then
    log_success "Nginx 설정 파일 존재"
    
    # Rate limiting 설정 확인
    if grep -q "limit_req_zone" /etc/nginx/nginx.conf; then
        log_success "   Rate limiting 설정됨"
    else
        log_warning "   Rate limiting이 설정되지 않았습니다"
    fi
    
    # Connection limiting 확인
    if grep -q "limit_conn_zone" /etc/nginx/nginx.conf; then
        log_success "   Connection limiting 설정됨"
    else
        log_warning "   Connection limiting이 설정되지 않았습니다"
    fi
else
    log_error "Nginx 설정 파일을 찾을 수 없습니다"
fi

echo ""

# 5. SSL/TLS 설정 확인
log_info "5. SSL/TLS 설정 확인..."
if [ -f /etc/nginx/sites-available/jangpyosa.com ]; then
    if grep -q "ssl_protocols" /etc/nginx/sites-available/jangpyosa.com; then
        log_success "SSL 프로토콜 설정됨"
        grep "ssl_protocols" /etc/nginx/sites-available/jangpyosa.com | head -1 || true
    fi
    
    if grep -q "ssl_ciphers" /etc/nginx/sites-available/jangpyosa.com; then
        log_success "SSL Ciphers 설정됨"
    fi
else
    log_warning "Nginx 사이트 설정 파일을 찾을 수 없습니다"
fi

echo ""

# 6. 시스템 리소스 상태
log_info "6. 시스템 리소스 상태..."
log_info "   메모리 사용량:"
free -h | grep -E "Mem|Swap"

log_info "   CPU 로드:"
uptime

log_info "   디스크 사용량:"
df -h / | tail -1

echo ""

# 7. 최근 로그인 시도 확인
log_info "7. 최근 실패한 로그인 시도 (최근 10개)..."
if [ -f /var/log/auth.log ]; then
    grep "Failed password" /var/log/auth.log | tail -10 || log_info "   실패한 로그인 시도 없음"
fi

echo ""

# 8. 보안 권장사항
log_info "=========================================="
log_info "보안 권장사항"
log_info "=========================================="

RECOMMENDATIONS=()

# fail2ban Nginx Jail 확인
if ! fail2ban-client status 2>/dev/null | grep -q "nginx"; then
    RECOMMENDATIONS+=("fail2ban에 Nginx Jail 추가 필요")
fi

# Rate limiting 확인
if ! grep -q "limit_req_zone" /etc/nginx/nginx.conf 2>/dev/null; then
    RECOMMENDATIONS+=("Nginx Rate Limiting 설정 필요")
fi

# Connection limiting 확인
if ! grep -q "limit_conn_zone" /etc/nginx/nginx.conf 2>/dev/null; then
    RECOMMENDATIONS+=("Nginx Connection Limiting 설정 필요")
fi

if [ ${#RECOMMENDATIONS[@]} -eq 0 ]; then
    log_success "모든 보안 설정이 올바르게 구성되었습니다!"
else
    log_warning "다음 보안 설정을 권장합니다:"
    for rec in "${RECOMMENDATIONS[@]}"; do
        echo "   - $rec"
    done
fi

echo ""
log_info "=========================================="
log_info "점검 완료"
log_info "=========================================="
