#!/bin/bash

###############################################################################
# 실시간 보안 모니터링 스크립트
# 
# 의심스러운 활동을 실시간으로 감지하고 알림
###############################################################################

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_alert() {
    echo -e "${RED}[ALERT $(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING $(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK $(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_info "=========================================="
log_info "실시간 보안 모니터링 시작"
log_info "=========================================="
log_info "Ctrl+C로 종료"
log_info ""

# 임계값 설정
MAX_CONN_PER_IP=50        # IP당 최대 동시 연결 수
MAX_FAILED_LOGIN=5        # 최대 로그인 실패 횟수
CHECK_INTERVAL=30         # 점검 간격 (초)

# 이전 로그 라인 수 추적
LAST_AUTH_LINE=0
LAST_NGINX_ERROR_LINE=0

while true; do
    log_info "보안 점검 실행 중..."
    
    # 1. 비정상적인 연결 수 확인
    log_info "1. 비정상적인 연결 수 확인..."
    
    SUSPICIOUS_IPS=$(netstat -an | grep ESTABLISHED | awk '{print $5}' | awk -F: '{print $1}' | sort | uniq -c | sort -rn | awk -v max=$MAX_CONN_PER_IP '$1 > max {print $2" ("$1" connections)"}')
    
    if [ -n "$SUSPICIOUS_IPS" ]; then
        log_alert "의심스러운 IP 발견 (연결 수 초과):"
        echo "$SUSPICIOUS_IPS" | while read line; do
            log_alert "   $line"
        done
        
        # 자동 차단 (선택사항)
        # echo "$SUSPICIOUS_IPS" | awk '{print $1}' | while read ip; do
        #     log_warning "   IP $ip 차단 중..."
        #     ufw deny from $ip 2>/dev/null
        # done
    else
        log_success "   정상: 모든 IP의 연결 수가 정상 범위 내"
    fi
    
    echo ""
    
    # 2. 실패한 로그인 시도 확인
    log_info "2. 실패한 로그인 시도 확인..."
    
    if [ -f /var/log/auth.log ]; then
        CURRENT_AUTH_LINE=$(wc -l < /var/log/auth.log)
        
        if [ $LAST_AUTH_LINE -gt 0 ]; then
            NEW_FAILED=$(tail -n +$LAST_AUTH_LINE /var/log/auth.log | grep "Failed password" | wc -l)
            
            if [ $NEW_FAILED -gt 0 ]; then
                log_warning "   새로운 로그인 실패 $NEW_FAILED건 발견"
                
                # 실패 시도가 많은 IP 목록
                FAILED_IPS=$(tail -n +$LAST_AUTH_LINE /var/log/auth.log | grep "Failed password" | grep -oE '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' | sort | uniq -c | sort -rn | head -5)
                
                if [ -n "$FAILED_IPS" ]; then
                    log_alert "   로그인 실패가 많은 IP:"
                    echo "$FAILED_IPS" | while read count ip; do
                        if [ $count -ge $MAX_FAILED_LOGIN ]; then
                            log_alert "   $ip ($count회) - 임계값 초과!"
                        else
                            log_warning "   $ip ($count회)"
                        fi
                    done
                fi
            else
                log_success "   정상: 새로운 로그인 실패 없음"
            fi
        fi
        
        LAST_AUTH_LINE=$CURRENT_AUTH_LINE
    fi
    
    echo ""
    
    # 3. Nginx 오류 확인
    log_info "3. Nginx 오류 로그 확인..."
    
    if [ -f /var/log/nginx/error.log ]; then
        CURRENT_NGINX_ERROR_LINE=$(wc -l < /var/log/nginx/error.log)
        
        if [ $LAST_NGINX_ERROR_LINE -gt 0 ]; then
            # Rate limiting 위반 확인
            RATE_LIMIT_VIOLATIONS=$(tail -n +$LAST_NGINX_ERROR_LINE /var/log/nginx/error.log | grep "limiting requests" | wc -l)
            
            if [ $RATE_LIMIT_VIOLATIONS -gt 0 ]; then
                log_warning "   Rate limiting 위반 ${RATE_LIMIT_VIOLATIONS}건 발견"
                
                # 위반이 많은 IP
                VIOLATING_IPS=$(tail -n +$LAST_NGINX_ERROR_LINE /var/log/nginx/error.log | grep "limiting requests" | grep -oE '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' | sort | uniq -c | sort -rn | head -5)
                
                if [ -n "$VIOLATING_IPS" ]; then
                    log_alert "   Rate limiting 위반 IP:"
                    echo "$VIOLATING_IPS" | while read count ip; do
                        log_alert "   $ip ($count회)"
                    done
                fi
            else
                log_success "   정상: Rate limiting 위반 없음"
            fi
        fi
        
        LAST_NGINX_ERROR_LINE=$CURRENT_NGINX_ERROR_LINE
    fi
    
    echo ""
    
    # 4. 시스템 리소스 확인
    log_info "4. 시스템 리소스 확인..."
    
    # CPU 로드 확인
    CPU_LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    CPU_LOAD_INT=$(echo "$CPU_LOAD" | awk '{print int($1)}')
    
    if [ $CPU_LOAD_INT -gt 4 ]; then
        log_alert "   CPU 로드가 높습니다: $CPU_LOAD"
    else
        log_success "   CPU 로드 정상: $CPU_LOAD"
    fi
    
    # 메모리 사용률 확인
    MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
    
    if [ $MEM_USAGE -gt 90 ]; then
        log_alert "   메모리 사용률이 높습니다: ${MEM_USAGE}%"
    elif [ $MEM_USAGE -gt 80 ]; then
        log_warning "   메모리 사용률: ${MEM_USAGE}%"
    else
        log_success "   메모리 사용률 정상: ${MEM_USAGE}%"
    fi
    
    echo ""
    
    # 5. fail2ban 상태 확인
    log_info "5. fail2ban 차단 상태..."
    
    if systemctl is-active --quiet fail2ban; then
        BANNED_COUNT=$(fail2ban-client status sshd 2>/dev/null | grep "Currently banned" | awk '{print $NF}')
        
        if [ -n "$BANNED_COUNT" ] && [ $BANNED_COUNT -gt 0 ]; then
            log_warning "   현재 차단된 IP: ${BANNED_COUNT}개"
            fail2ban-client status sshd | grep "Banned IP list" || true
        else
            log_success "   차단된 IP 없음"
        fi
    else
        log_alert "   fail2ban이 실행되고 있지 않습니다!"
    fi
    
    echo ""
    log_info "=========================================="
    log_info "다음 점검: ${CHECK_INTERVAL}초 후"
    log_info "=========================================="
    echo ""
    
    sleep $CHECK_INTERVAL
done
