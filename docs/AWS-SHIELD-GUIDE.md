# AWS Shield 및 DDoS 방어 가이드

## 📋 목차
1. [AWS Shield 개요](#aws-shield-개요)
2. [AWS Security Group 설정](#aws-security-group-설정)
3. [AWS WAF 설정](#aws-waf-설정)
4. [CloudWatch 모니터링](#cloudwatch-모니터링)
5. [Route 53 DNS 보호](#route-53-dns-보호)
6. [예산별 권장 사항](#예산별-권장-사항)

---

## AWS Shield 개요

### AWS Shield Standard (무료)
- **자동 활성화**: 모든 AWS 계정에 기본 제공
- **보호 대상**: Layer 3/4 DDoS 공격 방어
- **보호 서비스**: ELB, CloudFront, Route 53
- **적용 방법**: 별도 설정 불필요 (자동 적용)

### AWS Shield Advanced (월 $3,000)
- **고급 DDoS 방어**: Layer 7 애플리케이션 계층 보호
- **24/7 DRT 지원**: DDoS Response Team 지원
- **비용 보호**: DDoS 공격 시 발생하는 추가 AWS 요금 환불
- **실시간 알림**: CloudWatch 통합 모니터링
- **권장 대상**: 대규모 비즈니스, 금융/의료 서비스

**현재 장표사닷컴**: Shield Standard로 충분 (비용 대비 효과)

---

## AWS Security Group 설정

### 현재 설정 확인
```bash
# EC2 인스턴스의 Security Group 확인
aws ec2 describe-security-groups \
  --region ap-northeast-2 \
  --filters "Name=group-name,Values=jangpyosa-sg"
```

### 권장 Security Group 규칙

#### Inbound Rules (최소 권한 원칙)
```
Type        Protocol  Port Range  Source          Description
--------------------------------------------------------------------
SSH         TCP       22          YOUR_IP/32      관리자 IP만 허용
HTTP        TCP       80          0.0.0.0/0       웹 트래픽
HTTPS       TCP       443         0.0.0.0/0       웹 트래픽 (SSL)
```

#### Outbound Rules (기본 설정)
```
Type        Protocol  Port Range  Destination     Description
--------------------------------------------------------------------
All Traffic All       All         0.0.0.0/0       외부 통신 허용
```

### AWS CLI로 Security Group 업데이트

#### 1. SSH 접근 제한 (관리자 IP만)
```bash
# 기존 SSH 규칙 제거
aws ec2 revoke-security-group-ingress \
  --region ap-northeast-2 \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

# 특정 IP만 SSH 허용
aws ec2 authorize-security-group-ingress \
  --region ap-northeast-2 \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP/32 \
  --description "Admin SSH access only"
```

#### 2. Rate Limiting (연결 추적)
```bash
# 동일 IP에서 초당 80개 연결 제한
# (AWS Security Group은 stateful이므로 자동 추적)
```

---

## AWS WAF 설정 (선택 사항)

### 비용
- **요금제**: 
  - WebACL: $5/월
  - Rule: $1/월 per rule
  - 요청: $0.60 per 1M requests
- **예상 비용**: 월 $10-50 (트래픽에 따라 변동)

### WAF Rules (권장)

#### 1. Rate-based Rule (DDoS 방어)
```json
{
  "Name": "RateLimitRule",
  "Priority": 1,
  "Statement": {
    "RateBasedStatement": {
      "Limit": 2000,
      "AggregateKeyType": "IP"
    }
  },
  "Action": {
    "Block": {}
  }
}
```

#### 2. SQL Injection 방어
```json
{
  "Name": "SQLInjectionRule",
  "Priority": 2,
  "Statement": {
    "SqliMatchStatement": {
      "FieldToMatch": {
        "AllQueryArguments": {}
      },
      "TextTransformations": [
        {
          "Priority": 0,
          "Type": "URL_DECODE"
        }
      ]
    }
  },
  "Action": {
    "Block": {}
  }
}
```

#### 3. XSS 방어
```json
{
  "Name": "XSSRule",
  "Priority": 3,
  "Statement": {
    "XssMatchStatement": {
      "FieldToMatch": {
        "Body": {}
      },
      "TextTransformations": [
        {
          "Priority": 0,
          "Type": "HTML_ENTITY_DECODE"
        }
      ]
    }
  },
  "Action": {
    "Block": {}
  }
}
```

#### 4. 지역 차단 (선택)
```json
{
  "Name": "GeoBlockRule",
  "Priority": 4,
  "Statement": {
    "GeoMatchStatement": {
      "CountryCodes": ["CN", "RU", "KP"]
    }
  },
  "Action": {
    "Block": {}
  }
}
```

### WAF 적용 방법

#### AWS CLI로 WAF 생성
```bash
# 1. WebACL 생성
aws wafv2 create-web-acl \
  --region ap-northeast-2 \
  --name jangpyosa-waf \
  --scope REGIONAL \
  --default-action Allow={} \
  --description "Jangpyosa DDoS Protection" \
  --rules file://waf-rules.json

# 2. EC2에 연결 (ALB 사용 시)
aws wafv2 associate-web-acl \
  --web-acl-arn arn:aws:wafv2:ap-northeast-2:ACCOUNT_ID:regional/webacl/jangpyosa-waf/xxxxx \
  --resource-arn arn:aws:elasticloadbalancing:ap-northeast-2:ACCOUNT_ID:loadbalancer/app/jangpyosa-alb/xxxxx
```

---

## CloudWatch 모니터링

### 1. DDoS 공격 감지 알림 설정

#### CloudWatch Alarm 생성
```bash
# HTTP 요청 수 모니터링
aws cloudwatch put-metric-alarm \
  --alarm-name "High-HTTP-Requests" \
  --alarm-description "Alert on high HTTP request rate" \
  --metric-name RequestCount \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 10000 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:ap-northeast-2:ACCOUNT_ID:ddos-alerts
```

### 2. 주요 모니터링 지표

#### Network In/Out
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name NetworkIn \
  --dimensions Name=InstanceId,Value=i-xxxxx \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 300 \
  --statistics Sum
```

#### CPU Utilization
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-xxxxx \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 300 \
  --statistics Average
```

### 3. SNS 알림 설정
```bash
# SNS Topic 생성
aws sns create-topic \
  --name ddos-alerts \
  --region ap-northeast-2

# 이메일 구독 추가
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-northeast-2:ACCOUNT_ID:ddos-alerts \
  --protocol email \
  --notification-endpoint admin@jangpyosa.com
```

---

## Route 53 DNS 보호

### 1. DNSSEC 활성화 (DNS Spoofing 방어)
```bash
# DNSSEC 서명 활성화
aws route53 enable-hosted-zone-dnssec \
  --hosted-zone-id Z1234567890ABC
```

### 2. Health Check 설정 (DDoS 시 자동 Failover)
```bash
# Health Check 생성
aws route53 create-health-check \
  --caller-reference $(date +%s) \
  --health-check-config \
    IPAddress=43.201.0.129,\
    Port=443,\
    Type=HTTPS,\
    ResourcePath=/,\
    RequestInterval=30,\
    FailureThreshold=3
```

---

## 예산별 권장 사항

### 무료 옵션 (현재 적용)
✅ **구현 완료**
- AWS Shield Standard (무료, 자동 적용)
- Security Group 최소 권한 설정
- Nginx Rate Limiting
- Fail2Ban 자동 차단
- UFW 방화벽
- CloudWatch 기본 모니터링

**예상 비용**: $0/월

### 저예산 옵션 ($10-50/월)
- ✅ 무료 옵션 전체
- AWS WAF 기본 규칙 (Rate-based, SQLi, XSS)
- CloudWatch 상세 모니터링
- SNS 이메일 알림

**예상 비용**: $10-50/월

### 중급 옵션 ($50-500/월)
- ✅ 저예산 옵션 전체
- CloudFront CDN (정적 파일 캐싱 + DDoS 방어)
- Application Load Balancer (고가용성)
- AWS WAF 고급 규칙 (Managed Rule Groups)
- Route 53 Health Check + Failover

**예상 비용**: $50-500/월

### 엔터프라이즈 옵션 ($3,000+/월)
- ✅ 중급 옵션 전체
- AWS Shield Advanced ($3,000/월)
- 24/7 DDoS Response Team
- 실시간 공격 분석 대시보드
- 멀티 리전 배포 (재해 복구)

**예상 비용**: $3,000+/월

---

## 현재 장표사닷컴 권장 사항

### 단계별 적용 계획

#### Phase 1: 무료 방어 (현재)
✅ **완료**
- Nginx Rate Limiting
- Fail2Ban 자동 차단
- UFW 방화벽
- Security Group 최소 권한

**효과**: 중소규모 DDoS 공격 방어 가능

#### Phase 2: 저비용 강화 (선택)
- AWS WAF Rate-based Rule 추가
- CloudWatch 알림 설정
- 모니터링 대시보드 구축

**예상 비용**: $10-30/월  
**효과**: Layer 7 공격 방어 강화

#### Phase 3: 확장 (트래픽 증가 시)
- CloudFront CDN 도입
- ALB 고가용성 구성
- 멀티 AZ 배포

**예상 비용**: $50-200/월  
**효과**: 대규모 공격 방어 + 성능 향상

---

## 추가 보안 체크리스트

### 서버 레벨
- [x] Nginx Rate Limiting
- [x] Fail2Ban 설정
- [x] UFW 방화벽
- [x] SSH 키 기반 인증
- [x] 불필요한 포트 차단

### AWS 레벨
- [x] Security Group 최소 권한
- [x] Shield Standard 자동 적용
- [ ] WAF 설정 (선택)
- [ ] CloudWatch 알림
- [ ] VPC Flow Logs

### 애플리케이션 레벨
- [x] HTTPS 강제 적용
- [x] JWT 토큰 인증
- [x] SQL Injection 방어 (Prisma)
- [x] XSS 방어 (React)
- [ ] CSRF 토큰 (추천)

---

## 긴급 대응 매뉴얼

### DDoS 공격 발생 시

#### 1. 즉시 확인
```bash
# 모니터링 스크립트 실행
sudo /home/ubuntu/jangpyosa/scripts/monitor-ddos.sh

# 실시간 로그 확인
tail -f /var/log/nginx/access.log

# Fail2Ban 상태 확인
sudo fail2ban-client status
```

#### 2. 공격 IP 수동 차단
```bash
# 특정 IP 차단
sudo fail2ban-client set nginx-limit-req banip 1.2.3.4

# IP 대역 차단
sudo iptables -A INPUT -s 1.2.3.0/24 -j DROP
sudo netfilter-persistent save
```

#### 3. 임시 Rate Limit 강화
```nginx
# /etc/nginx/nginx.conf
limit_req_zone $binary_remote_addr zone=emergency:10m rate=1r/s;

# 사이트 설정에 적용
location / {
    limit_req zone=emergency burst=5 nodelay;
    # ...
}
```

#### 4. AWS WAF 긴급 적용
```bash
# 모든 트래픽 일시 차단 (최후의 수단)
aws wafv2 update-web-acl \
  --id xxxxx \
  --default-action Block={}
```

---

## 참고 자료

- [AWS Shield 공식 문서](https://docs.aws.amazon.com/shield/)
- [AWS WAF 개발자 가이드](https://docs.aws.amazon.com/waf/)
- [Nginx Rate Limiting 가이드](https://www.nginx.com/blog/rate-limiting-nginx/)
- [Fail2Ban 공식 문서](https://www.fail2ban.org/)

---

**마지막 업데이트**: 2026-02-22  
**작성자**: 장표사닷컴 보안팀
