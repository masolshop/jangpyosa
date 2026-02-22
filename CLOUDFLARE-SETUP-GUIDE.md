# Cloudflare 설정 가이드

## 📋 Cloudflare CDN 적용 가이드

### 🎯 목표
- DDoS 자동 방어 (무제한)
- CDN 캐싱으로 속도 향상
- WAF (웹 방화벽) 자동 적용
- Rate Limiting 적용

---

## 1️⃣ Cloudflare 계정 생성 및 도메인 추가

### Step 1: 계정 생성
1. https://dash.cloudflare.com/sign-up 접속
2. 이메일 및 비밀번호 입력
3. 이메일 인증 완료

### Step 2: 도메인 추가
1. "Add a Site" 클릭
2. `jangpyosa.com` 입력
3. "Free" 플랜 선택 (무료)
4. "Continue" 클릭

---

## 2️⃣ DNS 레코드 확인 및 설정

### 현재 DNS 레코드 확인
```
A     @           [AWS EC2 IP]        (현재 도메인 등록 업체에서 확인 필요)
A     www         [AWS EC2 IP]
```

### Cloudflare에서 자동 스캔
- Cloudflare가 자동으로 기존 DNS 레코드를 스캔합니다
- 스캔 결과를 확인하고 누락된 레코드가 있으면 추가

### 추가할 DNS 레코드 (Cloudflare 대시보드)
```
Type    Name    Content             Proxy Status    TTL
A       @       [AWS EC2 IP]        Proxied (🟠)    Auto
A       www     [AWS EC2 IP]        Proxied (🟠)    Auto
```

**중요:** Proxy Status를 "Proxied" (주황색 구름)로 설정해야 Cloudflare CDN이 활성화됩니다!

---

## 3️⃣ 네임서버 변경

### Cloudflare 네임서버 확인
Cloudflare 대시보드에서 제공하는 네임서버 (예시):
```
ns1.cloudflare.com
ns2.cloudflare.com
```

### 도메인 등록 업체에서 네임서버 변경
**현재 도메인 등록 업체 확인:**
```bash
whois jangpyosa.com | grep "Registrar:"
```

**주요 등록 업체별 변경 방법:**

#### 1. 가비아 (Gabia)
1. https://www.gabia.com 로그인
2. "My가비아" → "서비스 관리" → "도메인"
3. jangpyosa.com 선택 → "관리"
4. "네임서버" 탭 → "네임서버 변경"
5. Cloudflare 네임서버 2개 입력
6. "적용" 클릭

#### 2. 후이즈 (Whois)
1. https://www.whois.co.kr 로그인
2. "도메인 관리" → jangpyosa.com 선택
3. "네임서버 관리" → "직접 입력"
4. Cloudflare 네임서버 2개 입력
5. "저장" 클릭

#### 3. AWS Route 53
1. AWS Console → Route 53
2. "Hosted zones" → jangpyosa.com
3. "NS" 레코드 수정
4. Cloudflare 네임서버로 변경

**변경 완료 후 전파 대기:** 5분 ~ 48시간 (평균 1~2시간)

---

## 4️⃣ SSL/TLS 설정

### Cloudflare 대시보드에서 설정

1. **SSL/TLS 탭** 클릭
2. **SSL/TLS encryption mode** 설정:
   ```
   ✅ Full (strict) 선택
   ```
   - Full (strict): Cloudflare ↔ Origin Server 간에도 유효한 SSL 인증서 사용
   - 현재 Let's Encrypt 인증서가 있으므로 이 모드 사용

3. **Always Use HTTPS** 활성화:
   ```
   SSL/TLS → Edge Certificates → Always Use HTTPS: ON
   ```

4. **Automatic HTTPS Rewrites** 활성화:
   ```
   SSL/TLS → Edge Certificates → Automatic HTTPS Rewrites: ON
   ```

5. **Minimum TLS Version** 설정:
   ```
   SSL/TLS → Edge Certificates → Minimum TLS Version: TLS 1.2
   ```

---

## 5️⃣ 보안 설정 (Security)

### 1. Security Level 설정
```
Security → Settings → Security Level: Medium
```

### 2. Bot Fight Mode 활성화 (무료 플랜)
```
Security → Bots → Bot Fight Mode: ON
```

### 3. Challenge Passage 설정
```
Security → Settings → Challenge Passage: 30 minutes
```

---

## 6️⃣ 방화벽 규칙 (Firewall Rules)

### 무료 플랜: 5개 규칙 사용 가능

#### Rule 1: 한국 외 로그인 차단
```
Field: Country
Operator: does not equal
Value: KR (South Korea)
Path: /api/auth/login

Action: Challenge (CAPTCHA)
```

#### Rule 2: 알려진 봇 차단
```
Field: Known Bots
Operator: equals
Value: On

Action: Block
```

#### Rule 3: 의심스러운 User-Agent 차단
```
Field: User Agent
Operator: contains
Value: sqlmap

Action: Block
```

---

## 7️⃣ 캐싱 규칙 (Caching)

### 1. Browser Cache TTL 설정
```
Caching → Configuration → Browser Cache TTL: 4 hours
```

### 2. Caching Level 설정
```
Caching → Configuration → Caching Level: Standard
```

### 3. Page Rules 설정 (무료: 3개 사용 가능)

#### Page Rule 1: 정적 파일 캐싱
```
URL: jangpyosa.com/_next/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 month
```

#### Page Rule 2: API 캐싱 비활성화
```
URL: jangpyosa.com/api/*
Settings:
  - Cache Level: Bypass
```

#### Page Rule 3: HTML 캐싱 (선택)
```
URL: jangpyosa.com/*
Settings:
  - Cache Level: Standard
  - Browser Cache TTL: 4 hours
```

---

## 8️⃣ Rate Limiting (무료 플랜 제한)

### 무료 플랜: 월 100,000 요청 제한

#### Rule 1: API 로그인 보호
```
If incoming requests match:
  - URL Path: /api/auth/login
  - HTTP Method: POST

Then:
  - Rate: 5 requests per minute
  - Action: Block for 10 minutes
```

#### Rule 2: API 일반 엔드포인트
```
If incoming requests match:
  - URL Path: /api/*
  - HTTP Method: ANY

Then:
  - Rate: 100 requests per minute
  - Action: Block for 1 minute
```

---

## 9️⃣ Nginx 설정 업데이트

### Cloudflare 적용 후 Nginx 설정 변경 필요

```nginx
# /etc/nginx/sites-enabled/jangpyosa

server {
    listen 443 ssl http2;
    server_name jangpyosa.com www.jangpyosa.com;

    # SSL 인증서 (기존 Let's Encrypt 유지)
    ssl_certificate /etc/letsencrypt/live/jangpyosa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jangpyosa.com/privkey.pem;

    # Cloudflare 실제 IP 복원
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 2400:cb00::/32;
    set_real_ip_from 2606:4700::/32;
    set_real_ip_from 2803:f800::/32;
    set_real_ip_from 2405:b500::/32;
    set_real_ip_from 2405:8100::/32;
    set_real_ip_from 2c0f:f248::/32;
    set_real_ip_from 2a06:98c0::/29;
    
    real_ip_header CF-Connecting-IP;
    
    # 기존 설정 유지...
}
```

**Nginx 재시작:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔟 검증 및 테스트

### 1. DNS 전파 확인
```bash
# 네임서버 확인
dig jangpyosa.com NS +short

# Cloudflare 네임서버가 나오면 성공
# ns1.cloudflare.com
# ns2.cloudflare.com
```

### 2. Cloudflare 프록시 확인
```bash
# Cloudflare 헤더 확인
curl -I https://jangpyosa.com

# 응답에 다음 헤더가 있으면 성공
# cf-ray: ...
# cf-cache-status: ...
# server: cloudflare
```

### 3. SSL 인증서 확인
```bash
openssl s_client -connect jangpyosa.com:443 -servername jangpyosa.com < /dev/null 2>/dev/null | grep "subject="

# Let's Encrypt 인증서가 보이면 성공
```

### 4. 캐싱 테스트
```bash
# 정적 파일 캐싱 확인
curl -I https://jangpyosa.com/_next/static/...

# 응답 헤더에 다음이 있으면 성공
# cf-cache-status: HIT
```

### 5. Rate Limiting 테스트
```bash
# 로그인 엔드포인트 반복 요청 (5회 이상)
for i in {1..10}; do
  curl -X POST https://jangpyosa.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}' \
    -w "\n%{http_code}\n"
  sleep 1
done

# 6번째 요청부터 429 (Too Many Requests) 응답
```

---

## 📊 예상 개선 효과

### 보안
- 🛡️ **DDoS 방어**: 자동 완화 (무제한 트래픽)
- 🔒 **WAF**: 일반적인 웹 공격 차단
- 🚫 **Bot 차단**: 악성 봇 자동 차단
- ⏱️ **Rate Limiting**: API 무차별 대입 차단

### 성능
- 🚀 **페이지 로딩 속도**: 30-50% 향상
- 💰 **서버 대역폭 절감**: 60-80% 절감
- 📉 **서버 부하 감소**: 40-60% 감소

### 보안 점수
```
현재: 75/100
Cloudflare 적용 후: 85-90/100 (+10~15점)
```

---

## ⚠️ 주의사항

### 1. DNS 전파 시간
- 변경 후 최대 48시간 소요 (평균 1~2시간)
- 전파 중에는 일부 사용자가 접속 불가할 수 있음

### 2. SSL 인증서
- "Full (strict)" 모드 사용 필수
- Origin Server (AWS)에 유효한 인증서 필요 (현재 Let's Encrypt 사용 중)

### 3. IP 주소 노출
- Cloudflare 사용 시 실제 서버 IP가 숨겨짐
- 하지만 DNS 기록, 이메일 서버 등에서 IP가 노출될 수 있음

### 4. 무료 플랜 제한
- Page Rules: 3개
- Firewall Rules: 5개
- Rate Limiting: 월 100,000 요청
- Advanced DDoS Protection: 제한적

---

## 📞 도움이 필요한 경우

### Cloudflare 지원
- 문서: https://developers.cloudflare.com/
- 커뮤니티: https://community.cloudflare.com/
- 지원: https://dash.cloudflare.com/support

### 도메인 등록 업체
- 가비아: 02-1588-1900
- 후이즈: 02-2186-3000
- AWS: https://console.aws.amazon.com/support/

---

**작성일**: 2026-02-22  
**작성자**: AI Developer  
**예상 소요 시간**: 30분 ~ 2시간 (DNS 전파 시간 포함)
