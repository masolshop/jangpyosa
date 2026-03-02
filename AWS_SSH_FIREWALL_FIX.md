# AWS EC2 SSH 방화벽 문제 해결 가이드

## 🔍 문제 진단

현재 상황:
- Public IP: 43.201.0.129
- SSH 포트 22가 타임아웃
- AWS Console에서는 "모든 IPv4 주소" 허용으로 보이지만 실제 연결 안 됨

## 🛠️ 해결 방법

### 1️⃣ AWS CLI로 보안 그룹 확인 및 수정

```bash
# AWS CLI 설치 (로컬에서)
pip install awscli

# AWS 자격증명 설정
aws configure
# AWS Access Key ID: [입력]
# AWS Secret Access Key: [입력]
# Default region name: ap-northeast-2
# Default output format: json

# 인스턴스 정보 조회
aws ec2 describe-instances \
  --filters "Name=ip-address,Values=43.201.0.129" \
  --query 'Reservations[*].Instances[*].[InstanceId,SecurityGroups[*].GroupId]' \
  --output table

# 보안 그룹 ID 확인 (위 명령 결과에서)
SECURITY_GROUP_ID="sg-xxxxxxxxx"  # 실제 보안 그룹 ID로 변경

# 현재 보안 그룹 규칙 확인
aws ec2 describe-security-groups \
  --group-ids $SECURITY_GROUP_ID \
  --query 'SecurityGroups[*].IpPermissions[]' \
  --output table

# SSH 규칙 추가/수정 (모든 IP 허용)
aws ec2 authorize-security-group-ingress \
  --group-id $SECURITY_GROUP_ID \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

# 특정 IP만 허용하려면
MY_IP=$(curl -s https://checkip.amazonaws.com)
aws ec2 authorize-security-group-ingress \
  --group-id $SECURITY_GROUP_ID \
  --protocol tcp \
  --port 22 \
  --cidr ${MY_IP}/32
```

### 2️⃣ EC2 인스턴스 내부 방화벽 확인 (서버에서 실행)

```bash
# SSH가 이미 연결되어 있다면 EC2 내부에서 실행

# UFW (Ubuntu Firewall) 상태 확인
sudo ufw status

# UFW가 활성화되어 있고 SSH가 차단된 경우
sudo ufw allow 22/tcp
sudo ufw allow OpenSSH
sudo ufw reload

# 또는 UFW 비활성화 (비권장)
sudo ufw disable

# iptables 확인
sudo iptables -L -n -v

# iptables에서 SSH 차단 여부 확인
sudo iptables -L INPUT -v -n | grep :22

# iptables에서 SSH 허용 규칙 추가
sudo iptables -I INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables-save | sudo tee /etc/iptables/rules.v4

# fail2ban 확인 (과도한 접속 시도로 차단되었을 수 있음)
sudo fail2ban-client status
sudo fail2ban-client status sshd

# IP가 차단되었다면 해제
sudo fail2ban-client set sshd unbanip YOUR_IP_ADDRESS

# sshd 서비스 상태 확인
sudo systemctl status sshd
sudo systemctl restart sshd

# SSH 설정 확인
sudo cat /etc/ssh/sshd_config | grep -E "^Port|^PermitRootLogin|^PubkeyAuthentication|^PasswordAuthentication"

# 포트 22가 열려있는지 확인
sudo netstat -tlnp | grep :22
# 또는
sudo ss -tlnp | grep :22
```

### 3️⃣ Network ACL 확인 (AWS Console 또는 CLI)

```bash
# VPC Network ACL 확인
INSTANCE_ID="i-xxxxxxxxx"  # 실제 인스턴스 ID로 변경

# 인스턴스의 서브넷 ID 가져오기
SUBNET_ID=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].SubnetId' \
  --output text)

echo "Subnet ID: $SUBNET_ID"

# 서브넷의 Network ACL 확인
aws ec2 describe-network-acls \
  --filters "Name=association.subnet-id,Values=$SUBNET_ID" \
  --query 'NetworkAcls[*].Entries[]' \
  --output table

# Network ACL에서 SSH (포트 22) 인바운드 규칙 추가
NACL_ID=$(aws ec2 describe-network-acls \
  --filters "Name=association.subnet-id,Values=$SUBNET_ID" \
  --query 'NetworkAcls[0].NetworkAclId' \
  --output text)

echo "Network ACL ID: $NACL_ID"

# SSH 인바운드 허용 규칙 추가
aws ec2 create-network-acl-entry \
  --network-acl-id $NACL_ID \
  --ingress \
  --rule-number 100 \
  --protocol tcp \
  --port-range From=22,To=22 \
  --cidr-block 0.0.0.0/0 \
  --rule-action allow
```

### 4️⃣ SSH 키 권한 확인 (로컬에서)

```bash
# SSH 키 권한 확인
ls -la ~/.ssh/jangpyosa_new.pem

# 권한이 600이 아니면 변경
chmod 600 ~/.ssh/jangpyosa_new.pem

# SSH 연결 테스트 (자세한 로그 출력)
ssh -vvv -i ~/.ssh/jangpyosa_new.pem ubuntu@43.201.0.129

# SSH config 파일 생성
cat > ~/.ssh/config_jangpyosa << 'EOF'
Host jangpyosa
    HostName 43.201.0.129
    User ubuntu
    IdentityFile ~/.ssh/jangpyosa_new.pem
    StrictHostKeyChecking no
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 10
EOF

# SSH config 사용하여 연결
ssh -F ~/.ssh/config_jangpyosa jangpyosa
```

### 5️⃣ 통합 진단 스크립트

```bash
#!/bin/bash
# AWS EC2 SSH 연결 문제 진단 스크립트

TARGET_IP="43.201.0.129"
SSH_KEY="~/.ssh/jangpyosa_new.pem"

echo "================================"
echo "🔍 SSH 연결 문제 진단"
echo "================================"

# 1. 핑 테스트
echo ""
echo "1️⃣ 핑 테스트..."
if ping -c 3 $TARGET_IP > /dev/null 2>&1; then
    echo "✅ 핑 성공 - 서버 도달 가능"
else
    echo "❌ 핑 실패 - 네트워크 문제 또는 ICMP 차단됨"
fi

# 2. SSH 포트 확인
echo ""
echo "2️⃣ SSH 포트 (22) 확인..."
if timeout 5 bash -c "cat < /dev/null > /dev/tcp/$TARGET_IP/22" 2>/dev/null; then
    echo "✅ 포트 22 열려있음"
else
    echo "❌ 포트 22 닫혀있거나 방화벽에 차단됨"
fi

# 3. SSH 키 권한 확인
echo ""
echo "3️⃣ SSH 키 권한 확인..."
KEY_PERM=$(stat -c %a $SSH_KEY 2>/dev/null || stat -f %A $SSH_KEY 2>/dev/null)
if [ "$KEY_PERM" = "600" ]; then
    echo "✅ SSH 키 권한 올바름 (600)"
else
    echo "⚠️  SSH 키 권한: $KEY_PERM (600으로 변경 권장)"
    chmod 600 $SSH_KEY
    echo "✅ 권한 수정 완료"
fi

# 4. traceroute
echo ""
echo "4️⃣ 경로 추적..."
traceroute -m 10 $TARGET_IP 2>/dev/null | head -5 || echo "traceroute 명령어 없음"

# 5. nmap 포트 스캔 (있는 경우)
echo ""
echo "5️⃣ 포트 스캔..."
if command -v nmap &> /dev/null; then
    nmap -p 22 $TARGET_IP
else
    echo "nmap 없음 (선택사항)"
fi

echo ""
echo "================================"
echo "💡 권장 조치사항"
echo "================================"
echo "1. AWS Console에서 보안 그룹 인바운드 규칙 확인"
echo "2. Network ACL 확인"
echo "3. EC2 Instance Connect 또는 Session Manager 사용"
echo "4. 다른 네트워크/VPN에서 시도"
```

### 6️⃣ AWS Session Manager 사용 (방화벽 우회)

```bash
# Session Manager 플러그인 설치 (로컬)
# macOS
brew install --cask session-manager-plugin

# Ubuntu/Debian
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb" -o "session-manager-plugin.deb"
sudo dpkg -i session-manager-plugin.deb

# Session Manager로 연결 (SSH 필요 없음)
aws ssm start-session --target i-xxxxxxxxx  # 실제 인스턴스 ID

# SSM을 통한 포트 포워딩
aws ssm start-session \
  --target i-xxxxxxxxx \
  --document-name AWS-StartPortForwardingSession \
  --parameters '{"portNumber":["22"],"localPortNumber":["9999"]}'

# 그 다음 로컬 포트로 SSH 연결
ssh -i ~/.ssh/jangpyosa_new.pem ubuntu@localhost -p 9999
```

## 🎯 가장 가능성 높은 원인

1. **Network ACL 문제**: 보안 그룹은 허용하지만 Network ACL에서 차단
2. **Lightsail에서 마이그레이션**: Lightsail의 방화벽 규칙이 EC2로 완전히 옮겨지지 않음
3. **인스턴스 내부 방화벽**: UFW 또는 iptables에서 차단
4. **fail2ban**: 과도한 SSH 시도로 IP 차단

## 📞 즉시 해결 방법

**AWS Console에서 직접:**
1. EC2 → 인스턴스 선택
2. "연결(Connect)" 버튼 클릭
3. "EC2 Instance Connect" 탭
4. "연결" 클릭
5. 브라우저 터미널에서 배포 명령 실행

이 방법이 가장 빠르고 확실합니다! 🚀
