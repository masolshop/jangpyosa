#!/bin/bash

# ============================================
# DDoS 실시간 모니터링 스크립트
# 장표사닷컴 - 공격 탐지 및 알림
# ============================================

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 파일
ACCESS_LOG="/var/log/nginx/access.log"
ERROR_LOG="/var/log/nginx/error.log"
REPORT_DIR="/var/log/ddos-reports"
REPORT_FILE="$REPORT_DIR/ddos-report-$(date +%Y%m%d-%H%M%S).txt"

# 임계값 설정
THRESHOLD_REQUESTS_PER_IP=100  # IP당 분당 요청 임계값
THRESHOLD_TOTAL_REQUESTS=5000  # 총 분당 요청 임계값
THRESHOLD_ERROR_RATE=10        # 에러율 임계값 (%)

# 리포트 디렉토리 생성
mkdir -p "$REPORT_DIR"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  DDoS 실시간 모니터링 - 장표사닷컴${NC}"
echo -e "${BLUE}  시작 시간: $(date)${NC}"
echo -e "${BLUE}============================================${NC}\n"

# ============================================
# 1. 상위 요청 IP 분석
# ============================================
echo -e "${YELLOW}[1/6] 상위 요청 IP 분석...${NC}"
echo "최근 1분간 가장 많은 요청을 보낸 상위 20개 IP:" | tee -a "$REPORT_FILE"
tail -n 10000 "$ACCESS_LOG" | awk '{print $1}' | sort | uniq -c | sort -rn | head -20 | tee -a "$REPORT_FILE"

# 임계값 초과 IP 탐지
SUSPICIOUS_IPS=$(tail -n 10000 "$ACCESS_LOG" | awk '{print $1}' | sort | uniq -c | sort -rn | awk -v threshold="$THRESHOLD_REQUESTS_PER_IP" '$1 > threshold {print $2}')

if [ -n "$SUSPICIOUS_IPS" ]; then
    echo -e "${RED}⚠️  경고: 임계값($THRESHOLD_REQUESTS_PER_IP)을 초과한 의심스러운 IP 발견!${NC}" | tee -a "$REPORT_FILE"
    echo "$SUSPICIOUS_IPS" | tee -a "$REPORT_FILE"
else
    echo -e "${GREEN}✓ 정상: 모든 IP가 임계값 이내입니다.${NC}" | tee -a "$REPORT_FILE"
fi
echo ""

# ============================================
# 2. HTTP 응답 코드 분석
# ============================================
echo -e "${YELLOW}[2/6] HTTP 응답 코드 분석...${NC}"
echo "HTTP 응답 코드 통계:" | tee -a "$REPORT_FILE"
tail -n 10000 "$ACCESS_LOG" | awk '{print $9}' | sort | uniq -c | sort -rn | tee -a "$REPORT_FILE"

# 429 (Rate Limit) 응답 분석
RATE_LIMIT_COUNT=$(tail -n 10000 "$ACCESS_LOG" | grep " 429 " | wc -l)
if [ "$RATE_LIMIT_COUNT" -gt 10 ]; then
    echo -e "${RED}⚠️  Rate Limit 차단: ${RATE_LIMIT_COUNT}개 요청 차단됨${NC}" | tee -a "$REPORT_FILE"
else
    echo -e "${GREEN}✓ Rate Limit: 정상${NC}" | tee -a "$REPORT_FILE"
fi
echo ""

# ============================================
# 3. User-Agent 분석 (봇 탐지)
# ============================================
echo -e "${YELLOW}[3/6] User-Agent 분석 (봇 탐지)...${NC}"
echo "상위 User-Agent:" | tee -a "$REPORT_FILE"
tail -n 10000 "$ACCESS_LOG" | awk -F'"' '{print $6}' | sort | uniq -c | sort -rn | head -10 | tee -a "$REPORT_FILE"

# 악의적인 봇 탐지
BAD_BOTS=$(tail -n 10000 "$ACCESS_LOG" | grep -iE "bot|crawler|spider|scraper|nikto|sqlmap|havij|scan" | wc -l)
if [ "$BAD_BOTS" -gt 0 ]; then
    echo -e "${RED}⚠️  의심스러운 봇 활동: ${BAD_BOTS}개 요청 감지${NC}" | tee -a "$REPORT_FILE"
else
    echo -e "${GREEN}✓ 봇 활동: 정상${NC}" | tee -a "$REPORT_FILE"
fi
echo ""

# ============================================
# 4. 요청 URI 분석
# ============================================
echo -e "${YELLOW}[4/6] 가장 많이 요청된 URI...${NC}"
echo "상위 요청 URI:" | tee -a "$REPORT_FILE"
tail -n 10000 "$ACCESS_LOG" | awk '{print $7}' | sort | uniq -c | sort -rn | head -20 | tee -a "$REPORT_FILE"
echo ""

# ============================================
# 5. Fail2Ban 차단 현황
# ============================================
echo -e "${YELLOW}[5/6] Fail2Ban 차단 현황...${NC}"
if command -v fail2ban-client &> /dev/null; then
    echo "Fail2Ban 상태:" | tee -a "$REPORT_FILE"
    sudo fail2ban-client status 2>/dev/null | tee -a "$REPORT_FILE" || echo "Fail2Ban이 실행되지 않았습니다." | tee -a "$REPORT_FILE"
    
    # 각 Jail별 차단 IP 수
    for jail in sshd nginx-http-auth nginx-limit-req nginx-ddos; do
        if sudo fail2ban-client status "$jail" &> /dev/null; then
            BANNED_COUNT=$(sudo fail2ban-client status "$jail" 2>/dev/null | grep "Currently banned" | awk '{print $4}')
            echo "$jail: ${BANNED_COUNT}개 IP 차단 중" | tee -a "$REPORT_FILE"
        fi
    done
else
    echo -e "${YELLOW}⚠️  Fail2Ban이 설치되지 않았습니다.${NC}" | tee -a "$REPORT_FILE"
fi
echo ""

# ============================================
# 6. 시스템 리소스 상태
# ============================================
echo -e "${YELLOW}[6/6] 시스템 리소스 상태...${NC}"
echo "CPU 및 메모리 사용률:" | tee -a "$REPORT_FILE"
top -bn1 | grep "Cpu(s)" | tee -a "$REPORT_FILE"
free -h | tee -a "$REPORT_FILE"

echo "네트워크 연결 수:" | tee -a "$REPORT_FILE"
netstat -an | grep ESTABLISHED | wc -l | awk '{print "ESTABLISHED: " $1}' | tee -a "$REPORT_FILE"
netstat -an | grep TIME_WAIT | wc -l | awk '{print "TIME_WAIT: " $1}' | tee -a "$REPORT_FILE"
echo ""

# ============================================
# 최종 리포트
# ============================================
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  모니터링 완료${NC}"
echo -e "${BLUE}  종료 시간: $(date)${NC}"
echo -e "${BLUE}  리포트 저장: $REPORT_FILE${NC}"
echo -e "${BLUE}============================================${NC}"

# 요약 출력
echo -e "\n${GREEN}✓ DDoS 모니터링 요약:${NC}"
echo "  - 의심스러운 IP: $(echo "$SUSPICIOUS_IPS" | wc -w)개"
echo "  - Rate Limit 차단: ${RATE_LIMIT_COUNT}개"
echo "  - 봇 활동 감지: ${BAD_BOTS}개"

# 심각한 공격 탐지 시 알림
TOTAL_SUSPICIOUS=$(($(echo "$SUSPICIOUS_IPS" | wc -w) + RATE_LIMIT_COUNT + BAD_BOTS))
if [ "$TOTAL_SUSPICIOUS" -gt 50 ]; then
    echo -e "\n${RED}🚨 경고: DDoS 공격 가능성 높음! 즉시 확인 필요!${NC}"
    echo "상세 리포트: $REPORT_FILE"
fi

exit 0
