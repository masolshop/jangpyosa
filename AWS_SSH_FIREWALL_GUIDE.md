# AWS EC2 SSH 방화벽 해결 가이드

## 🔥 문제: SSH 연결 타임아웃

```
ssh: connect to host 43.201.0.129 port 22: Connection timed out
```

## ✅ 해결 방법: AWS 보안 그룹 설정

### 1️⃣ AWS Console에서 보안 그룹 수정

1. **AWS EC2 Console** 접속
   - https://ap-northeast-2.console.aws.amazon.com/ec2/

2. **인스턴스 선택**
   - 왼쪽 메뉴에서 "인스턴스" 클릭
   - 해당 인스턴스 선택 (IP: 43.201.0.129)

3. **보안 그룹 확인**
   - 하단 탭에서 "보안" 탭 클릭
   - "보안 그룹" 링크 클릭 (예: sg-xxxxx)

4. **인바운드 규칙 편집**
   - "인바운드 규칙 편집" 버튼 클릭
   - SSH 규칙 확인

### 2️⃣ SSH 규칙 수정

현재 SSH 규칙이 다음과 같이 되어 있을 것입니다:

```
Type: SSH
Protocol: TCP
Port: 22
Source: 특정 IP 또는 제한된 범위
```

**다음 중 하나로 수정하세요:**

#### 옵션 A: 모든 IP 허용 (간편하지만 보안 약함)
```
Type: SSH
Protocol: TCP
Port: 22
Source: 0.0.0.0/0
Description: Allow SSH from anywhere
```

#### 옵션 B: 특정 IP 범위 허용 (권장)
```
Type: SSH
Protocol: TCP
Port: 22
Source: 현재 작업 중인 IP/32
Description: Allow SSH from my IP
```

현재 IP 확인: https://whatismyipaddress.com/

#### 옵션 C: 여러 IP 허용
규칙을 여러 개 추가하여 여러 IP에서 접근 가능하게 설정

### 3️⃣ 규칙 저장 및 확인

1. **"규칙 저장" 버튼** 클릭
2. 즉시 적용됨 (재시작 불필요)
3. SSH 연결 테스트

```bash
ssh -i ~/.ssh/jangpyosa_new.pem ubuntu@43.201.0.129
```

## 🚀 빠른 해결 방법 (스크린샷 참고)

현재 보안 그룹에 이미 SSH 규칙이 있는 것으로 보입니다:

```
SSH    TCP    22    Any IPv4 address
```

하지만 "Lightsail browser SSH" 설명이 있어서 특정 소스로 제한되어 있을 수 있습니다.

### 해결 단계:

1. EC2 Console → 보안 그룹
2. 인바운드 규칙 편집
3. SSH 규칙의 "소스" 를 `0.0.0.0/0` 으로 변경
4. 저장

## 🔒 보안 권장사항

프로덕션 환경에서는:

1. **특정 IP만 허용**
   - 사무실 IP
   - VPN IP
   - 관리자 IP

2. **SSH 포트 변경** (선택사항)
   ```bash
   # /etc/ssh/sshd_config
   Port 2222  # 22 대신 다른 포트
   ```

3. **SSH Key 기반 인증만 허용**
   ```bash
   # /etc/ssh/sshd_config
   PasswordAuthentication no
   ```

4. **Fail2Ban 설치** (무차별 대입 공격 방지)
   ```bash
   sudo apt-get install fail2ban
   ```

## 📝 참고

저번에도 같은 문제가 있었다면, 보안 그룹 설정이 다시 변경되었을 가능성이 있습니다.

매번 설정하기 번거롭다면:
- AWS Systems Manager Session Manager 사용
- AWS Lightsail 사용
- Bastion Host 설정
