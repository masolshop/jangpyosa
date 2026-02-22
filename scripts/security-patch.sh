#!/bin/bash
##############################################
# 장표사닷컴 긴급 보안 패치 스크립트
# 작성일: 2026-02-22
# 설명: 즉시 적용 가능한 보안 강화 조치
##############################################

set -e

echo "========================================="
echo "🔒 장표사닷컴 긴급 보안 패치"
echo "========================================="

# 관리자 권한 확인
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  이 스크립트는 root 권한이 필요합니다."
    echo "sudo ./security-patch.sh 로 실행하세요."
    exit 1
fi

# 1. 불필요한 포트 차단
echo ""
echo "🔒 1. 불필요한 포트 차단 중..."
ufw delete allow 3000/tcp 2>/dev/null || echo "포트 3000은 이미 차단되어 있습니다"
ufw delete allow 4000/tcp 2>/dev/null || echo "포트 4000은 이미 차단되어 있습니다"
ufw reload
echo "✅ 포트 3000, 4000 외부 차단 완료"

# 2. Fail2ban 설치
echo ""
echo "🛡️  2. Fail2ban 설치 중..."
if ! command -v fail2ban-client &> /dev/null; then
    apt-get update -qq
    apt-get install fail2ban -y
    echo "✅ Fail2ban 설치 완료"
else
    echo "ℹ️  Fail2ban이 이미 설치되어 있습니다"
fi

# 3. Fail2ban SSH 보호 설정
echo ""
echo "🔐 3. Fail2ban SSH 보호 설정 중..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
destemail = admin@jangpyosa.com
sendername = Fail2ban

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
findtime = 60
bantime = 600
EOF

systemctl enable fail2ban
systemctl restart fail2ban
echo "✅ Fail2ban 설정 완료"

# 4. TLS 1.0/1.1 비활성화
echo ""
echo "🔒 4. TLS 1.0/1.1 비활성화 중..."
if [ -f /etc/nginx/nginx.conf ]; then
    # TLS 1.0, 1.1 제거
    sed -i 's/ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;/ssl_protocols TLSv1.2 TLSv1.3;/g' /etc/nginx/nginx.conf
    sed -i 's/ssl_protocols TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE/ssl_protocols TLSv1.2 TLSv1.3;/g' /etc/nginx/nginx.conf
    
    # Nginx 설정 검증
    if nginx -t > /dev/null 2>&1; then
        systemctl reload nginx
        echo "✅ TLS 1.0/1.1 비활성화 완료"
    else
        echo "⚠️  Nginx 설정 오류 - TLS 설정 롤백"
        sed -i 's/ssl_protocols TLSv1.2 TLSv1.3;/ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;/g' /etc/nginx/nginx.conf
    fi
else
    echo "⚠️  Nginx 설정 파일을 찾을 수 없습니다"
fi

# 5. DB 파일 권한 강화
echo ""
echo "🔒 5. 데이터베이스 파일 권한 강화 중..."
DB_PATH="/home/ubuntu/jangpyosa/apps/api/prisma/dev.db"
if [ -f "$DB_PATH" ]; then
    chmod 600 "$DB_PATH"
    chown ubuntu:ubuntu "$DB_PATH"
    echo "✅ DB 파일 권한 강화 완료 (600)"
else
    echo "⚠️  DB 파일을 찾을 수 없습니다: $DB_PATH"
fi

# 6. SSH 보안 강화
echo ""
echo "🔐 6. SSH 보안 설정 강화 중..."
SSH_CONFIG="/etc/ssh/sshd_config"
if [ -f "$SSH_CONFIG" ]; then
    # 백업
    cp "$SSH_CONFIG" "${SSH_CONFIG}.backup-$(date +%Y%m%d-%H%M%S)"
    
    # 설정 변경
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' "$SSH_CONFIG"
    sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' "$SSH_CONFIG"
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' "$SSH_CONFIG"
    sed -i 's/PermitRootLogin yes/PermitRootLogin no/' "$SSH_CONFIG"
    
    # 새로운 설정 추가 (없으면)
    grep -q "MaxAuthTries" "$SSH_CONFIG" || echo "MaxAuthTries 3" >> "$SSH_CONFIG"
    grep -q "ClientAliveInterval" "$SSH_CONFIG" || echo "ClientAliveInterval 300" >> "$SSH_CONFIG"
    grep -q "ClientAliveCountMax" "$SSH_CONFIG" || echo "ClientAliveCountMax 2" >> "$SSH_CONFIG"
    
    systemctl restart sshd
    echo "✅ SSH 보안 강화 완료"
else
    echo "⚠️  SSH 설정 파일을 찾을 수 없습니다"
fi

# 7. 보안 상태 확인
echo ""
echo "========================================="
echo "📊 보안 패치 결과"
echo "========================================="
echo ""
echo "✅ 완료된 작업:"
echo "   - 포트 3000, 4000 외부 차단"
echo "   - Fail2ban 설치 및 활성화"
echo "   - TLS 1.0/1.1 비활성화"
echo "   - DB 파일 권한 강화 (600)"
echo "   - SSH 보안 설정 강화"
echo ""
echo "🔍 현재 보안 상태:"
echo ""

# UFW 상태
echo "방화벽 (UFW):"
ufw status | grep -E "Status|22/tcp|80/tcp|443/tcp"
echo ""

# Fail2ban 상태
echo "Fail2ban:"
fail2ban-client status | head -2
echo ""

# 열린 포트
echo "외부 노출 포트:"
ss -tuln | grep LISTEN | grep -E ":22|:80|:443|:3000|:4000" | awk '{print $5}' | sort -u
echo ""

# DB 파일 권한
echo "DB 파일 권한:"
ls -l "$DB_PATH" 2>/dev/null || echo "DB 파일 없음"
echo ""

echo "========================================="
echo "✅ 긴급 보안 패치 완료"
echo "========================================="
echo ""
echo "📋 다음 단계 권장사항:"
echo "   1. Cloudflare CDN 적용 (DDoS 방어)"
echo "   2. Nginx Rate Limiting 설정"
echo "   3. 보안 헤더 추가 (CSP 등)"
echo "   4. DB 백업 암호화"
echo ""
echo "📖 상세 내용: SECURITY-AUDIT-REPORT.md"
echo ""

exit 0
