#!/bin/bash

###############################################################################
# AWS EC2 SSH 연결 문제 자동 진단 및 해결 스크립트
# 
# 이 스크립트는 SSH 연결 문제를 자동으로 진단하고 해결합니다.
###############################################################################

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 설정
TARGET_IP="43.201.0.129"
SSH_KEY="$HOME/.ssh/jangpyosa_new.pem"
SSH_USER="ubuntu"

echo "================================"
echo "🔍 AWS EC2 SSH 연결 문제 진단"
echo "================================"
echo "대상 IP: $TARGET_IP"
echo "SSH 키: $SSH_KEY"
echo "사용자: $SSH_USER"
echo "================================"

# 1. 핑 테스트
echo ""
log_info "1️⃣ 핑 테스트..."
if ping -c 3 -W 3 $TARGET_IP > /dev/null 2>&1; then
    log_success "핑 성공 - 서버 도달 가능"
else
    log_warning "핑 실패 - ICMP가 차단되었거나 네트워크 문제"
fi

# 2. SSH 포트 확인
echo ""
log_info "2️⃣ SSH 포트 (22) 확인..."
if command -v nc &> /dev/null; then
    if nc -zv -w 5 $TARGET_IP 22 2>&1 | grep -q "succeeded\|open"; then
        log_success "포트 22 열려있음"
        PORT_OPEN=true
    else
        log_error "포트 22 닫혀있거나 방화벽에 차단됨"
        PORT_OPEN=false
    fi
elif command -v telnet &> /dev/null; then
    if timeout 5 telnet $TARGET_IP 22 2>&1 | grep -q "Connected\|Escape"; then
        log_success "포트 22 열려있음"
        PORT_OPEN=true
    else
        log_error "포트 22 닫혀있거나 방화벽에 차단됨"
        PORT_OPEN=false
    fi
else
    log_warning "nc 또는 telnet 명령어 없음 - 포트 확인 불가"
    PORT_OPEN=unknown
fi

# 3. SSH 키 확인
echo ""
log_info "3️⃣ SSH 키 확인..."
if [ -f "$SSH_KEY" ]; then
    log_success "SSH 키 파일 존재"
    
    # 권한 확인
    if [ "$(uname)" = "Darwin" ]; then
        KEY_PERM=$(stat -f %A $SSH_KEY)
    else
        KEY_PERM=$(stat -c %a $SSH_KEY 2>/dev/null || echo "unknown")
    fi
    
    if [ "$KEY_PERM" = "600" ]; then
        log_success "SSH 키 권한 올바름 (600)"
    else
        log_warning "SSH 키 권한: $KEY_PERM (600으로 변경)"
        chmod 600 $SSH_KEY
        log_success "권한 수정 완료"
    fi
else
    log_error "SSH 키 파일 없음: $SSH_KEY"
    exit 1
fi

# 4. DNS 확인
echo ""
log_info "4️⃣ DNS 확인..."
RESOLVED_IP=$(dig +short $TARGET_IP 2>/dev/null || host $TARGET_IP 2>/dev/null | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}' | head -1 || echo $TARGET_IP)
if [ "$RESOLVED_IP" = "$TARGET_IP" ]; then
    log_success "IP 주소 사용 중 (DNS 문제 없음)"
else
    log_info "DNS 해석 결과: $RESOLVED_IP"
fi

# 5. 내 공인 IP 확인
echo ""
log_info "5️⃣ 내 공인 IP 확인..."
MY_IP=$(curl -s https://checkip.amazonaws.com 2>/dev/null || curl -s https://ifconfig.me 2>/dev/null || echo "unknown")
log_info "내 공인 IP: $MY_IP"

# 6. SSH 연결 테스트
echo ""
log_info "6️⃣ SSH 연결 테스트..."
SSH_TEST=$(timeout 10 ssh -i "$SSH_KEY" \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    -o ConnectTimeout=5 \
    -o BatchMode=yes \
    "$SSH_USER@$TARGET_IP" "echo connected" 2>&1)

if echo "$SSH_TEST" | grep -q "connected"; then
    log_success "SSH 연결 성공!"
    SSH_WORKS=true
else
    log_error "SSH 연결 실패"
    log_info "에러 메시지: $SSH_TEST"
    SSH_WORKS=false
fi

# 7. traceroute (선택적)
echo ""
log_info "7️⃣ 경로 추적 (선택사항)..."
if command -v traceroute &> /dev/null; then
    log_info "처음 5 홉:"
    traceroute -m 5 -w 2 $TARGET_IP 2>/dev/null | head -6 || log_warning "traceroute 실패"
else
    log_info "traceroute 명령어 없음 (선택사항)"
fi

# 8. 진단 결과 요약
echo ""
echo "================================"
echo "📊 진단 결과 요약"
echo "================================"

if [ "$PORT_OPEN" = "true" ] && [ "$SSH_WORKS" = "true" ]; then
    log_success "✅ SSH 연결 정상 작동!"
elif [ "$PORT_OPEN" = "false" ]; then
    log_error "❌ 포트 22가 차단되어 있습니다"
    echo ""
    echo "💡 해결 방법:"
    echo "1. AWS Console → EC2 → 보안 그룹"
    echo "2. 인바운드 규칙에서 SSH (포트 22) 확인"
    echo "3. 소스를 '0.0.0.0/0' 또는 '내 IP ($MY_IP/32)'로 설정"
    echo ""
    echo "4. Network ACL도 확인:"
    echo "   VPC → Network ACLs → 인바운드 규칙"
    echo "   포트 22 TCP 허용 여부 확인"
elif [ "$SSH_WORKS" = "false" ]; then
    log_error "❌ 포트는 열려있지만 SSH 인증 실패"
    echo ""
    echo "💡 해결 방법:"
    echo "1. SSH 키가 올바른지 확인"
    echo "2. EC2 인스턴스에 올바른 키페어가 연결되어 있는지 확인"
    echo "3. 사용자명이 'ubuntu'가 맞는지 확인 (Amazon Linux는 'ec2-user')"
else
    log_warning "⚠️  포트 확인 불가 - 수동 확인 필요"
fi

echo ""
echo "================================"
echo "🛠️ 대안 방법"
echo "================================"
echo "1. AWS Console에서 EC2 Instance Connect 사용"
echo "   EC2 → 인스턴스 선택 → 연결 버튼"
echo ""
echo "2. AWS Systems Manager Session Manager 사용"
echo "   aws ssm start-session --target <instance-id>"
echo ""
echo "3. 다른 네트워크에서 시도 (VPN, 다른 WiFi 등)"
echo ""

# 9. AWS CLI를 통한 자동 수정 제안 (선택사항)
if command -v aws &> /dev/null; then
    echo "================================"
    echo "🔧 AWS CLI로 자동 수정 (선택사항)"
    echo "================================"
    echo ""
    echo "다음 명령어를 실행하여 자동으로 보안 그룹을 수정할 수 있습니다:"
    echo ""
    echo "# 인스턴스 ID 찾기"
    echo "aws ec2 describe-instances --filters \"Name=ip-address,Values=$TARGET_IP\" --query 'Reservations[*].Instances[*].[InstanceId,SecurityGroups[*].GroupId]' --output table"
    echo ""
    echo "# 보안 그룹에 SSH 규칙 추가 (내 IP만)"
    echo "aws ec2 authorize-security-group-ingress --group-id <security-group-id> --protocol tcp --port 22 --cidr $MY_IP/32"
    echo ""
    echo "# 또는 모든 IP 허용 (비권장)"
    echo "aws ec2 authorize-security-group-ingress --group-id <security-group-id> --protocol tcp --port 22 --cidr 0.0.0.0/0"
    echo ""
fi

echo "================================"
echo "✅ 진단 완료"
echo "================================"
