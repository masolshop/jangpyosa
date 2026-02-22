#!/bin/bash

# ============================================
# DDoS 방어 시스템 자동 설치 스크립트
# 장표사닷컴 - Nginx + Fail2Ban + UFW
# ============================================

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  DDoS 방어 시스템 설치${NC}"
echo -e "${BLUE}  장표사닷컴 - 보안 강화${NC}"
echo -e "${BLUE}============================================${NC}\n"

# Root 권한 확인
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ 이 스크립트는 root 권한이 필요합니다.${NC}"
    echo "sudo ./setup-ddos-protection.sh 로 실행하세요."
    exit 1
fi

# ============================================
# 1. 패키지 업데이트 및 필수 도구 설치
# ============================================
echo -e "${YELLOW}[1/7] 패키지 업데이트 및 필수 도구 설치...${NC}"
apt-get update -qq
apt-get install -y -qq fail2ban ufw iptables-persistent net-tools curl

echo -e "${GREEN}✓ 완료${NC}\n"

# ============================================
# 2. Fail2Ban 설치 및 설정
# ============================================
echo -e "${YELLOW}[2/7] Fail2Ban 설정...${NC}"

# Filter 파일 복사
cp -f /home/ubuntu/jangpyosa/fail2ban/nginx-http-auth.conf /etc/fail2ban/filter.d/
cp -f /home/ubuntu/jangpyosa/fail2ban/nginx-limit-req.conf /etc/fail2ban/filter.d/
cp -f /home/ubuntu/jangpyosa/fail2ban/nginx-ddos.conf /etc/fail2ban/filter.d/

# Jail 설정 복사
cp -f /home/ubuntu/jangpyosa/fail2ban/jail.local /etc/fail2ban/

# Fail2Ban 재시작
systemctl enable fail2ban
systemctl restart fail2ban

echo -e "${GREEN}✓ Fail2Ban 설정 완료${NC}"
systemctl status fail2ban --no-pager | head -5
echo ""

# ============================================
# 3. Nginx Rate Limiting 설정
# ============================================
echo -e "${YELLOW}[3/7] Nginx Rate Limiting 설정...${NC}"

# 백업 생성
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup-$(date +%Y%m%d-%H%M%S)
cp /etc/nginx/sites-available/jangpyosa /etc/nginx/sites-available/jangpyosa.backup-$(date +%Y%m%d-%H%M%S)

# 새 설정 복사
cp -f /home/ubuntu/jangpyosa/nginx/nginx-ddos-protected.conf /etc/nginx/nginx.conf
cp -f /home/ubuntu/jangpyosa/nginx/jangpyosa-ddos-protected.conf /etc/nginx/sites-available/jangpyosa

# 429 에러 페이지 복사
cp -f /home/ubuntu/jangpyosa/nginx/429.html /usr/share/nginx/html/

# Nginx 설정 테스트
nginx -t

if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo -e "${GREEN}✓ Nginx Rate Limiting 설정 완료${NC}\n"
else
    echo -e "${RED}❌ Nginx 설정 오류! 백업에서 복원합니다.${NC}"
    cp /etc/nginx/nginx.conf.backup-$(date +%Y%m%d)* /etc/nginx/nginx.conf
    cp /etc/nginx/sites-available/jangpyosa.backup-$(date +%Y%m%d)* /etc/nginx/sites-available/jangpyosa
    systemctl reload nginx
    exit 1
fi

# ============================================
# 4. UFW 방화벽 설정
# ============================================
echo -e "${YELLOW}[4/7] UFW 방화벽 최적화...${NC}"

# UFW 리셋 (기존 규칙 제거)
echo "y" | ufw --force reset

# 기본 정책 설정
ufw default deny incoming
ufw default allow outgoing

# 필수 포트만 허용
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Rate Limiting 적용 (SSH 브루트포스 방어)
ufw limit 22/tcp comment 'SSH Rate Limit'

# UFW 활성화
echo "y" | ufw --force enable

echo -e "${GREEN}✓ UFW 방화벽 설정 완료${NC}"
ufw status numbered
echo ""

# ============================================
# 5. iptables 추가 규칙 설정
# ============================================
echo -e "${YELLOW}[5/7] iptables 추가 보안 규칙...${NC}"

# SYN Flood 공격 방어
iptables -A INPUT -p tcp --syn -m limit --limit 1/s --limit-burst 3 -j ACCEPT
iptables -A INPUT -p tcp --syn -j DROP

# ICMP Flood 방어 (ping)
iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 1/s -j ACCEPT
iptables -A INPUT -p icmp --icmp-type echo-request -j DROP

# Invalid 패킷 차단
iptables -A INPUT -m state --state INVALID -j DROP

# 규칙 저장
netfilter-persistent save

echo -e "${GREEN}✓ iptables 규칙 설정 완료${NC}\n"

# ============================================
# 6. 커널 파라미터 최적화 (sysctl)
# ============================================
echo -e "${YELLOW}[6/7] 커널 파라미터 최적화...${NC}"

cat >> /etc/sysctl.conf << 'EOF'

# ============================================
# DDoS 방어를 위한 커널 파라미터
# ============================================

# SYN Flood 방어
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_syn_retries = 2
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_max_syn_backlog = 4096

# IP Spoofing 방어
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# ICMP Redirect 차단
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0

# Source Routing 비활성화
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0

# TCP 연결 제한
net.ipv4.tcp_max_tw_buckets = 1440000
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15

# 로그 설정
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1

# 파일 디스크립터 증가
fs.file-max = 65535

# 네트워크 버퍼 크기
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
EOF

# 설정 적용
sysctl -p

echo -e "${GREEN}✓ 커널 파라미터 최적화 완료${NC}\n"

# ============================================
# 7. 모니터링 스크립트 설정
# ============================================
echo -e "${YELLOW}[7/7] DDoS 모니터링 스크립트 설정...${NC}"

# 스크립트 실행 권한 부여
chmod +x /home/ubuntu/jangpyosa/scripts/monitor-ddos.sh

# Cron Job 등록 (5분마다 실행)
CRON_JOB="*/5 * * * * /home/ubuntu/jangpyosa/scripts/monitor-ddos.sh >> /var/log/ddos-monitor.log 2>&1"
(crontab -l 2>/dev/null | grep -v "monitor-ddos.sh"; echo "$CRON_JOB") | crontab -

echo -e "${GREEN}✓ 모니터링 스크립트 설정 완료${NC}\n"

# ============================================
# 최종 확인 및 요약
# ============================================
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  DDoS 방어 시스템 설치 완료!${NC}"
echo -e "${BLUE}============================================${NC}\n"

echo -e "${GREEN}✓ 설치 완료 항목:${NC}"
echo "  1. Fail2Ban - SSH, Nginx 공격 차단"
echo "  2. Nginx Rate Limiting - API, 페이지, 로그인 제한"
echo "  3. UFW 방화벽 - 필수 포트만 개방"
echo "  4. iptables 규칙 - SYN/ICMP Flood 방어"
echo "  5. 커널 파라미터 최적화"
echo "  6. 자동 모니터링 (5분마다)"
echo ""

echo -e "${YELLOW}📊 현재 상태 확인:${NC}"
echo ""
echo "Nginx 상태:"
systemctl status nginx --no-pager | head -3
echo ""
echo "Fail2Ban 상태:"
systemctl status fail2ban --no-pager | head -3
echo ""
echo "UFW 상태:"
ufw status | head -5
echo ""

echo -e "${GREEN}✓ 모든 설정이 완료되었습니다!${NC}"
echo ""
echo -e "${YELLOW}📝 유용한 명령어:${NC}"
echo "  - Fail2Ban 상태: sudo fail2ban-client status"
echo "  - Nginx 재시작: sudo systemctl reload nginx"
echo "  - 차단된 IP 확인: sudo fail2ban-client status nginx-limit-req"
echo "  - DDoS 모니터링: sudo /home/ubuntu/jangpyosa/scripts/monitor-ddos.sh"
echo "  - 로그 확인: tail -f /var/log/nginx/access.log"
echo ""

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  서버를 재부팅하여 모든 설정을 적용하세요:${NC}"
echo -e "${BLUE}  sudo reboot${NC}"
echo -e "${BLUE}============================================${NC}"

exit 0
