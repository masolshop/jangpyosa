# 장표사닷컴 AWS 서버 보안 점검 보고서

## 📅 점검 정보
- **점검 일시**: 2026년 2월 22일 13:20 (KST)
- **점검 대상**: AWS EC2 (jangpyosa.com)
- **OS**: Ubuntu 22.04 LTS (Kernel 6.8.0-1044-aws)
- **담당자**: AI Developer

---

## 📊 현재 보안 상태 요약

### ✅ **양호한 부분**
1. ✅ UFW 방화벽 활성화 (기본 거부 정책)
2. ✅ HTTPS 강제 리다이렉트 (HTTP → HTTPS)
3. ✅ Let's Encrypt SSL/TLS 인증서 적용
4. ✅ 보안 헤더 적용 (HSTS, X-Frame-Options 등)
5. ✅ SSH 키 기반 인증 사용
6. ✅ 최소 권한 포트만 개방

### ⚠️ **개선이 필요한 부분**
1. ⚠️ **Fail2ban 미설치** - 무차별 대입 공격 방어 부재
2. ⚠️ **Rate Limiting 미설정** - API/웹 요청 제한 없음
3. ⚠️ **DDoS 방어 미흡** - Cloudflare CDN 미사용
4. ⚠️ **포트 3000, 4000 외부 노출** - 내부 서비스 직접 노출
5. ⚠️ **데이터베이스 백업 암호화 미적용**
6. ⚠️ **보안 모니터링 부재** - 침입 탐지 시스템 없음
7. ⚠️ **TLS 1.0/1.1 허용** - 취약한 프로토콜 사용

---

## 🔍 상세 점검 결과

### 1. 네트워크 및 포트 상태

#### 열린 포트 목록
```
22/tcp    SSH (관리용)                ✅ 필수
80/tcp    HTTP (HTTPS 리다이렉트)     ✅ 필수
443/tcp   HTTPS (웹 서비스)           ✅ 필수
3000/tcp  Next.js (프론트엔드)         ⚠️ 외부 노출 불필요
4000/tcp  Express API (백엔드)        ⚠️ 외부 노출 불필요
5555/tcp  PM2 (프로세스 관리)         🚨 매우 위험
```

**문제점:**
- 포트 3000, 4000이 외부에 직접 노출되어 있음
- Nginx 리버스 프록시를 통해서만 접근해야 하는데 직접 접근 가능
- 포트 5555 (PM2)가 열려 있음 → 프로세스 제어 탈취 위험

**권장 사항:**
```bash
# 포트 3000, 4000, 5555를 외부에서 차단
sudo ufw delete allow 3000/tcp
sudo ufw delete allow 4000/tcp
sudo ufw delete allow 5555/tcp

# localhost에서만 접근 가능하도록 설정 (Nginx를 통해서만 접근)
```

---

### 2. 방화벽 (UFW) 상태

#### 현재 설정
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
3000/tcp                   ALLOW       Anywhere    ⚠️ 불필요
4000/tcp                   ALLOW       Anywhere    ⚠️ 불필요
```

**평가:** ⚠️ **부분적으로 양호**
- 기본 정책: DROP (기본 거부) ✅
- 필수 포트만 개방해야 하나 내부 서비스 포트도 개방됨 ⚠️

---

### 3. Fail2ban (무차별 대입 공격 방어)

**상태:** 🚨 **미설치**

**위험:**
- SSH 무차별 대입 공격에 취약
- 웹 로그인 페이지 무차별 대입 공격에 취약
- API 무차별 대입 공격에 취약

**권장 조치:**
```bash
# Fail2ban 설치
sudo apt-get install fail2ban -y

# SSH 보호 활성화
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

### 4. Nginx 보안 설정

#### 현재 적용된 보안 헤더 ✅
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

**평가:** ✅ **양호**

#### 추가 권장 헤더
```nginx
# CSP (Content Security Policy) - XSS 방어
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' https://cdn.jsdelivr.net; connect-src 'self' https://jangpyosa.com;" always;

# Referrer Policy - 정보 유출 방지
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Permissions Policy - 불필요한 브라우저 기능 차단
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

#### TLS 설정 개선 필요 ⚠️
**현재:**
```nginx
ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
```

**권장:**
```nginx
ssl_protocols TLSv1.2 TLSv1.3;  # TLS 1.0/1.1 제거
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers on;
```

---

### 5. Rate Limiting (요청 제한)

**상태:** 🚨 **미설정**

**위험:**
- API 무차별 대입 공격 가능
- DDoS 공격에 취약
- 서버 자원 고갈 위험

**권장 조치:**
```nginx
# Nginx에 Rate Limiting 추가

# /etc/nginx/nginx.conf의 http 블록에 추가
http {
    # IP당 초당 10개 요청 제한 (burst 20개)
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    
    # API 엔드포인트는 더 엄격하게 (초당 5개)
    limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;
    
    # 로그인 엔드포인트는 매우 엄격하게 (분당 5개)
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
}

# /etc/nginx/sites-enabled/jangpyosa에 적용
location /api/ {
    limit_req zone=api burst=10 nodelay;
    limit_req_status 429;
    ...
}

location /api/auth/login {
    limit_req zone=login burst=3 nodelay;
    limit_req_status 429;
    ...
}
```

---

### 6. DDoS 방어

**현재 상태:** 🚨 **매우 취약**

**위험:**
- 대규모 트래픽 공격 시 서버 다운
- 대역폭 고갈
- 서비스 가용성 저하

**권장 조치 (우선순위 순):**

#### 1단계: Cloudflare CDN 적용 (무료 플랜 가능)
```
✅ DDoS 자동 방어 (무제한)
✅ Rate Limiting (100,000 요청/월)
✅ CDN 캐싱 (대역폭 절감)
✅ SSL/TLS (무료 인증서)
✅ WAF (웹 방화벽)
```

**설정 방법:**
1. Cloudflare 가입 (cloudflare.com)
2. 도메인 추가 (jangpyosa.com)
3. DNS 네임서버 변경
4. SSL/TLS 모드를 "Full (strict)"로 설정
5. Page Rules 설정 (캐싱 규칙)

#### 2단계: Nginx Connection Limiting
```nginx
# /etc/nginx/nginx.conf
http {
    # IP당 최대 동시 연결 수 제한
    limit_conn_zone $binary_remote_addr zone=addr:10m;
    
    server {
        # IP당 최대 10개 동시 연결
        limit_conn addr 10;
    }
}
```

#### 3단계: iptables SYN Flood 방어
```bash
# SYN Flood 공격 방어
sudo iptables -A INPUT -p tcp --syn -m limit --limit 1/s --limit-burst 3 -j ACCEPT
sudo iptables -A INPUT -p tcp --syn -j DROP

# 설정 저장
sudo iptables-save > /etc/iptables/rules.v4
```

---

### 7. SSH 보안

**현재 상태:** ✅ **양호**
- SSH 키 기반 인증 사용 ✅
- 포트 22 사용 (기본 포트)

**추가 권장 조치:**
```bash
# /etc/ssh/sshd_config 수정
PasswordAuthentication no      # 비밀번호 로그인 완전 차단
PermitRootLogin no             # root 직접 로그인 차단
MaxAuthTries 3                 # 인증 시도 3회 제한
ClientAliveInterval 300        # 유휴 세션 5분 후 종료
ClientAliveCountMax 2

# SSH 포트 변경 (선택사항, 보안성 향상)
Port 2222  # 22 → 2222로 변경

# 적용
sudo systemctl restart sshd
```

---

### 8. 데이터베이스 보안

**현재 상태:** ⚠️ **개선 필요**
- SQLite 파일 기반 (파일 권한으로만 보호) ⚠️
- 백업 파일 암호화 없음 🚨

**권장 조치:**
```bash
# 1. DB 파일 권한 강화
sudo chmod 600 /home/ubuntu/jangpyosa/apps/api/prisma/dev.db
sudo chown ubuntu:ubuntu /home/ubuntu/jangpyosa/apps/api/prisma/dev.db

# 2. 백업 파일 암호화
# backup-db.sh 수정
gpg --symmetric --cipher-algo AES256 "$BACKUP_FILE.gz"
rm "$BACKUP_FILE.gz"  # 암호화된 파일만 보관
```

---

### 9. 애플리케이션 보안

#### 현재 적용된 보안 기능 ✅
- JWT 토큰 기반 인증 ✅
- 비밀번호 해싱 (bcrypt) ✅
- 입력 검증 (Zod) ✅
- CORS 설정 ✅
- SQL Injection 방지 (Prisma ORM) ✅

#### 추가 권장 조치
```typescript
// 1. Rate Limiting (Express 미들웨어)
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 최대 100개 요청
  message: '너무 많은 요청입니다. 잠시 후 다시 시도하세요.'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 로그인은 15분에 5번
  message: '로그인 시도가 너무 많습니다. 15분 후 다시 시도하세요.'
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);

// 2. Helmet (보안 헤더)
import helmet from 'helmet';
app.use(helmet());

// 3. 민감 정보 로깅 방지
// 비밀번호, 토큰 등은 로그에서 제외
```

---

### 10. 로그 및 모니터링

**현재 상태:** 🚨 **매우 부족**
- 침입 탐지 시스템 없음
- 실시간 모니터링 없음
- 로그 분석 자동화 없음

**권장 조치:**

#### 1단계: 로그 중앙화
```bash
# 1. Nginx 로그 포맷 개선
log_format detailed '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    '$request_time $upstream_response_time';

access_log /var/log/nginx/access.log detailed;

# 2. 로그 로테이션 설정
sudo nano /etc/logrotate.d/nginx
# 일일 로테이션, 30일 보관
```

#### 2단계: 침입 탐지 (AIDE)
```bash
# AIDE 설치 (파일 무결성 검사)
sudo apt-get install aide -y
sudo aideinit
sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db

# 매일 자동 검사 (cron)
echo "0 5 * * * /usr/bin/aide --check" | sudo crontab -
```

#### 3단계: 실시간 모니터링
```bash
# Prometheus + Grafana (선택사항)
# 또는 AWS CloudWatch 연동
```

---

## 🚨 긴급 조치 사항 (즉시 적용 권장)

### 우선순위 1 (즉시)
```bash
# 1. 불필요한 포트 차단
sudo ufw delete allow 3000/tcp
sudo ufw delete allow 4000/tcp
sudo ufw reload

# 2. Fail2ban 설치
sudo apt-get update
sudo apt-get install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 3. TLS 1.0/1.1 비활성화
sudo sed -i 's/ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;/ssl_protocols TLSv1.2 TLSv1.3;/' /etc/nginx/nginx.conf
sudo nginx -t && sudo systemctl reload nginx
```

### 우선순위 2 (24시간 내)
```bash
# 4. Rate Limiting 설정
# Nginx 설정 파일 수정 (위 예시 참고)

# 5. DB 파일 권한 강화
sudo chmod 600 /home/ubuntu/jangpyosa/apps/api/prisma/dev.db

# 6. 백업 암호화 스크립트 수정
# backup-db.sh에 GPG 암호화 추가
```

### 우선순위 3 (1주일 내)
```bash
# 7. Cloudflare CDN 적용
# cloudflare.com에서 도메인 추가 및 DNS 설정

# 8. 보안 헤더 추가
# Nginx 설정에 CSP, Referrer-Policy 추가

# 9. AIDE 침입 탐지 설정
sudo apt-get install aide -y
```

---

## 📊 보안 점수

### 현재 상태
```
🔒 방화벽:         ⭐⭐⭐⭐☆ (80/100)  - UFW 활성화, 포트 관리 개선 필요
🔐 인증/인가:      ⭐⭐⭐⭐⭐ (95/100)  - JWT, SSH 키 인증 양호
🌐 네트워크:       ⭐⭐⭐☆☆ (60/100)  - 내부 포트 노출, Rate Limiting 없음
🛡️ DDoS 방어:     ⭐⭐☆☆☆ (40/100)  - Cloudflare 미사용
🔒 데이터 보호:    ⭐⭐⭐☆☆ (65/100)  - 백업 암호화 없음
📊 모니터링:       ⭐⭐☆☆☆ (40/100)  - 침입 탐지 없음
🚨 침입 차단:      ⭐⭐☆☆☆ (40/100)  - Fail2ban 없음

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
전체 보안 점수:    ⭐⭐⭐☆☆ (60/100)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 개선 후 예상 점수
```
🔒 방화벽:         ⭐⭐⭐⭐⭐ (95/100)
🔐 인증/인가:      ⭐⭐⭐⭐⭐ (95/100)
🌐 네트워크:       ⭐⭐⭐⭐⭐ (90/100)
🛡️ DDoS 방어:     ⭐⭐⭐⭐⭐ (95/100)  ← Cloudflare 적용
🔒 데이터 보호:    ⭐⭐⭐⭐☆ (85/100)  ← 암호화 적용
📊 모니터링:       ⭐⭐⭐⭐☆ (80/100)  ← AIDE 적용
🚨 침입 차단:      ⭐⭐⭐⭐⭐ (90/100)  ← Fail2ban 적용

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
전체 보안 점수:    ⭐⭐⭐⭐⭐ (90/100)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📝 권장 조치 요약

### 즉시 (오늘)
- [ ] 포트 3000, 4000 외부 차단
- [ ] Fail2ban 설치 및 활성화
- [ ] TLS 1.0/1.1 비활성화

### 단기 (1주일)
- [ ] Cloudflare CDN 적용 (DDoS 방어)
- [ ] Nginx Rate Limiting 설정
- [ ] 보안 헤더 추가 (CSP 등)
- [ ] DB 백업 암호화
- [ ] AIDE 침입 탐지 설정

### 중기 (1개월)
- [ ] Express Rate Limiting 미들웨어
- [ ] 로그 중앙화 및 분석 자동화
- [ ] 모니터링 대시보드 구축
- [ ] 정기 보안 감사 스케줄

### 장기 (3개월)
- [ ] WAF (Web Application Firewall) 구축
- [ ] IDS/IPS (침입 탐지/방어) 시스템
- [ ] SOC (보안 관제) 또는 외부 보안 서비스
- [ ] 정기 침투 테스트

---

## 🔗 관련 문서
- [BACKUP-STRATEGY.md](./BACKUP-STRATEGY.md) - 백업 전략
- [WORK-ORDER-DEPLOYMENT-REPORT.md](./WORK-ORDER-DEPLOYMENT-REPORT.md) - 업무지시 시스템 보고서

---

**작성일**: 2026-02-22  
**작성자**: AI Developer  
**최종 검증**: 2026-02-22 13:20 (KST)  
**보안 등급**: ⚠️ **보통** (개선 필요)
