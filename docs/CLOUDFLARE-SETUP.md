# Cloudflare DDoS 방어 연동 가이드

## 📋 개요

Cloudflare를 활용하면 다음과 같은 강력한 DDoS 방어 기능을 사용할 수 있습니다:

- **자동 DDoS 방어**: Layer 3, 4, 7 공격 자동 차단
- **WAF (Web Application Firewall)**: SQL Injection, XSS 등 웹 공격 방어
- **Rate Limiting**: IP/국가/ASN 기반 요청 제한
- **Bot Management**: 악성 봇 차단, 정상 봇 허용
- **CDN**: 전 세계 200+ 데이터센터에서 콘텐츠 캐싱
- **SSL/TLS**: 무료 SSL 인증서 및 자동 갱신

---

## 🚀 Cloudflare 설정 방법

### 1️⃣ Cloudflare 계정 생성 및 도메인 추가

1. **Cloudflare 회원가입**
   - https://dash.cloudflare.com/sign-up
   - 무료 플랜으로 시작 가능

2. **도메인 추가**
   - `Add a Site` 클릭
   - `jangpyosa.com` 입력
   - 무료 플랜 선택

3. **DNS 레코드 확인**
   - Cloudflare가 기존 DNS 레코드를 자동으로 스캔
   - 필요한 레코드 확인 (A, CNAME, MX 등)

### 2️⃣ 네임서버 변경

**현재 (Cafe24 DNS):**
```
ns1.cafe24.com
ns2.cafe24.com
```

**변경 후 (Cloudflare DNS):**
```
ashley.ns.cloudflare.com
cam.ns.cloudflare.com
```

**변경 방법:**
1. Cafe24 도메인 관리 페이지 접속
2. 네임서버 설정 변경
3. Cloudflare에서 제공한 네임서버 2개 입력
4. 저장 (전파 시간: 최대 24~48시간)

### 3️⃣ DNS 레코드 설정

Cloudflare 대시보드에서 다음 레코드 설정:

```
Type    Name              Content                 Proxy Status
A       jangpyosa.com     43.201.0.129           Proxied (🟠)
A       www               43.201.0.129           Proxied (🟠)
```

**⚠️ 중요**: Proxy Status를 **"Proxied"** (🟠 주황색 구름)로 설정해야 Cloudflare 보호 기능이 활성화됩니다.

### 4️⃣ SSL/TLS 설정

1. **SSL/TLS > Overview**
   - Encryption mode: `Full (strict)` 선택
   - 이유: 이미 Let's Encrypt SSL 인증서가 있으므로

2. **Edge Certificates**
   - Always Use HTTPS: `On`
   - Minimum TLS Version: `TLS 1.2`
   - Automatic HTTPS Rewrites: `On`

### 5️⃣ 방화벽 규칙 (WAF)

**Security > WAF**

1. **Managed Rules** (Free 플랜 포함)
   - Cloudflare Managed Ruleset: `On`
   - OWASP Core Ruleset: `On`

2. **Custom Rules** (예시)
   ```
   Rule 1: Block Known Bad IPs
   - Expression: (ip.src in $known_bad_ips)
   - Action: Block
   
   Rule 2: Rate Limit API
   - Expression: (http.request.uri.path contains "/api/")
   - Action: Rate Limit (10 requests per 10 seconds)
   
   Rule 3: Block Non-Korea Traffic (선택사항)
   - Expression: (ip.geoip.country ne "KR")
   - Action: Challenge (CAPTCHA)
   ```

### 6️⃣ Rate Limiting (Pro 플랜 이상)

무료 플랜에서는 제한적이지만, Pro 플랜($20/월)부터 다음 기능 사용 가능:

```yaml
API 엔드포인트:
  - Path: /api/*
  - Requests: 100/minute per IP
  - Action: Block

로그인 페이지:
  - Path: /auth/login
  - Requests: 5/minute per IP
  - Action: Challenge
```

### 7️⃣ Bot Fight Mode

**Security > Bots**
- Bot Fight Mode: `On` (Free 플랜)
- 악성 봇 자동 차단

---

## 🔧 서버 측 설정 변경

### Nginx 설정 업데이트

Cloudflare를 사용하면 실제 클라이언트 IP가 `CF-Connecting-IP` 헤더에 전달됩니다.

```bash
# Nginx에서 실제 IP 복원
sudo nano /etc/nginx/nginx.conf
```

```nginx
http {
    # Cloudflare IP 범위 설정
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 131.0.72.0/22;
    
    # Cloudflare 헤더에서 실제 IP 가져오기
    real_ip_header CF-Connecting-IP;
}
```

```bash
# 설정 테스트 및 재시작
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📊 모니터링

### Cloudflare 대시보드

**Analytics > Traffic**
- 실시간 트래픽 모니터링
- 차단된 요청 통계
- 국가별 트래픽 분포

**Security > Events**
- 차단된 요청 로그
- WAF 규칙 트리거 내역
- Rate limiting 위반 기록

---

## ⚠️ 주의사항

### Cloudflare 사용 시 고려사항

1. **Origin IP 보호**
   - Cloudflare를 우회하여 직접 서버 IP 접근 차단 필요
   - AWS Security Group에서 Cloudflare IP만 허용

2. **웹소켓/SSE 지원**
   - Cloudflare는 WebSocket 및 SSE 지원
   - 추가 설정 불필요 (Free 플랜도 지원)

3. **캐싱 설정**
   - 동적 콘텐츠는 캐싱하지 않도록 설정
   - API 응답은 `Cache-Control: no-cache` 헤더 추가

---

## 💰 비용

| 플랜 | 월 비용 | 주요 기능 |
|------|---------|-----------|
| Free | $0 | 기본 DDoS 방어, SSL, WAF 기본 |
| Pro | $20 | 고급 Rate Limiting, 이미지 최적화 |
| Business | $200 | 우선 지원, 고급 보안 |
| Enterprise | 협의 | 전담 지원, 맞춤형 보안 |

**권장**: 현재는 **Free 플랜**으로 충분하며, 트래픽 증가 시 Pro 플랜 고려

---

## 🔄 전환 계획

### 단계별 전환 가이드

**Phase 1: 준비 (1일)**
1. Cloudflare 계정 생성 및 도메인 추가
2. DNS 레코드 확인
3. Nginx 실제 IP 복원 설정 적용

**Phase 2: 네임서버 전환 (2일)**
1. Cafe24에서 네임서버 변경
2. DNS 전파 대기 (24~48시간)
3. `dig jangpyosa.com` 명령으로 확인

**Phase 3: 보안 설정 (1일)**
1. SSL/TLS 설정
2. WAF 규칙 활성화
3. Rate Limiting 설정

**Phase 4: 모니터링 및 최적화 (지속)**
1. 트래픽 패턴 분석
2. 필요 시 규칙 조정
3. 공격 발생 시 대응

---

## 📞 지원

- **Cloudflare 문서**: https://developers.cloudflare.com/
- **커뮤니티**: https://community.cloudflare.com/
- **지원 티켓**: 대시보드에서 직접 문의

---

## ✅ 체크리스트

- [ ] Cloudflare 계정 생성
- [ ] 도메인 추가 및 DNS 레코드 확인
- [ ] 네임서버 변경 (Cafe24)
- [ ] DNS 전파 확인 (24~48시간)
- [ ] SSL/TLS 설정 (Full Strict)
- [ ] WAF 규칙 활성화
- [ ] Nginx 실제 IP 복원 설정
- [ ] Rate Limiting 설정 (선택)
- [ ] 모니터링 대시보드 확인
- [ ] Origin IP 보호 (AWS Security Group)

---

**🎯 완료 시점**: 네임서버 전환 후 Cloudflare 대시보드에서 `Active` 상태 확인
