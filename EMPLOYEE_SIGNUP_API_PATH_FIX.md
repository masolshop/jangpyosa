# 장애인직원 회원가입 API 경로 수정

## 📋 개요

장애인직원 회원가입 페이지(`/employee/signup`)에서 발생하던 "서버 오류"를 해결했습니다.

## 🎯 문제점

### 증상
- 사업자등록번호 입력 후 "기업 확인" 버튼 클릭 시 "서버 오류" 발생
- 브라우저 콘솔에 404 Not Found 오류

### 원인 분석

1. **프론트엔드 요청 경로**
   ```typescript
   const API_BASE = "/api/proxy";
   // 요청: /api/proxy/auth/verify-company
   ```

2. **nginx 프록시 처리**
   ```nginx
   location /api/ {
       proxy_pass http://localhost:4000/;
   }
   ```
   - `/api/proxy/auth/verify-company` → `http://localhost:4000/proxy/auth/verify-company`

3. **백엔드 라우팅**
   - 백엔드는 `/auth/verify-company` 엔드포인트만 처리
   - `/proxy/auth/verify-company` 경로는 존재하지 않음
   - 결과: **404 Not Found**

### 문제의 핵심

**이중 프록시 문제**: 
- Next.js API Routes 프록시 (`/api/proxy`) 사용 시도
- 하지만 nginx가 `/api/` 요청을 이미 백엔드로 프록시
- 결과적으로 불필요한 `/proxy/` 경로가 추가됨

## ✅ 해결 방법

### 코드 수정

**변경 전:**
```typescript
// Next.js 프록시를 통해 백엔드 API 호출
const API_BASE = "/api/proxy";
```

**변경 후:**
```typescript
// nginx 프록시를 통해 백엔드 API 직접 호출
const API_BASE = "/api";
```

### 처리 흐름

#### 이전 (잘못된 흐름)
```
프론트엔드: /api/proxy/auth/verify-company
    ↓
nginx: /api/ → http://localhost:4000/
    ↓
백엔드 요청: http://localhost:4000/proxy/auth/verify-company
    ↓
결과: 404 Not Found (존재하지 않는 경로)
```

#### 현재 (올바른 흐름)
```
프론트엔드: /api/auth/verify-company
    ↓
nginx: /api/ → http://localhost:4000/
    ↓
백엔드 요청: http://localhost:4000/auth/verify-company
    ↓
결과: ✅ 성공
```

## 🔧 nginx 설정

### 현재 nginx 설정 (`/etc/nginx/sites-enabled/jangpyosa`)

```nginx
# API 서버 라우팅 (port 4000)
location /api/ {
    proxy_pass http://localhost:4000/;
    proxy_http_version 1.0;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Connection "";
    proxy_read_timeout 90s;
}
```

### 주요 포인트

1. **`location /api/`**: `/api/`로 시작하는 모든 요청 처리
2. **`proxy_pass http://localhost:4000/`**: 백엔드 4000 포트로 프록시
3. **경로 변환**: `/api/` 제거 후 백엔드로 전달
   - 예: `/api/auth/verify-company` → `http://localhost:4000/auth/verify-company`

## 📊 테스트 결과

### 1. API 직접 테스트
```bash
curl -X POST https://jangpyosa.com/api/auth/verify-company \
  -H "Content-Type: application/json" \
  -d '{"bizNo":"1234567890"}'
```

**응답:**
```json
{
  "company": {
    "id": "cmm6cv8y5000410imtpl8dyus",
    "name": "페마연구소",
    "bizNo": "1234567890",
    "representative": "김대표",
    "buyerProfileId": "cmm6e8dpk0001q3sbx0jao9pu"
  }
}
```

✅ **성공!**

### 2. 브라우저 테스트
1. https://jangpyosa.com/employee/signup 접속
2. 사업자등록번호 입력: `123-45-6789`
3. "기업 확인" 버튼 클릭
4. ✅ 회사 정보 정상 표시

## 🔍 다른 페이지는?

### Next.js API Routes 프록시를 사용하는 경우

일부 페이지는 여전히 `/api/proxy` 경로를 사용할 수 있습니다:

```typescript
// /api/proxy/[...path]/route.ts 활용
const API_BASE = "/api/proxy";
```

이는 다음과 같은 경우에 유용합니다:
- 추가 인증 로직이 필요한 경우
- 요청/응답 가공이 필요한 경우
- CORS 문제 해결이 필요한 경우

### nginx 직접 프록시를 사용하는 경우

간단한 API 호출은 nginx 프록시를 직접 사용하는 것이 더 효율적입니다:

```typescript
// nginx가 직접 프록시
const API_BASE = "/api";
```

**장점:**
- 더 빠른 응답 속도 (Next.js를 거치지 않음)
- 단순한 구조
- 네트워크 홉 감소

## 📝 수정된 파일

### 프론트엔드
- `apps/web/src/app/employee/signup/page.tsx`
  - `API_BASE` 상수를 `/api/proxy`에서 `/api`로 변경

## 🌐 배포 정보

- **커밋**: `2ca8435`
- **날짜**: 2026-03-05
- **브랜치**: `main`

### 배포 단계
1. ✅ 코드 수정 완료
2. ✅ Git 커밋 및 푸시
3. ✅ 프로덕션 서버 배포
4. ✅ Next.js 빌드 (v14.2.35)
5. ✅ PM2 재시작 완료
6. ✅ API 테스트 성공
7. ✅ 브라우저 테스트 성공

## 🎓 교훈

### 1. 이중 프록시 주의
- Next.js API Routes와 nginx 프록시를 동시에 사용할 때 주의
- 경로가 중복되거나 불필요하게 추가될 수 있음

### 2. 직접 프록시 우선
- 간단한 API 호출은 nginx 직접 프록시가 더 효율적
- Next.js API Routes는 복잡한 로직이 필요할 때만 사용

### 3. 경로 매핑 이해
- nginx `location`과 `proxy_pass` 설정 이해 필요
- 경로 변환 규칙을 정확히 파악

### 4. 테스트 방법
- 프론트엔드 테스트 전에 curl로 API 직접 테스트
- 네트워크 탭에서 실제 요청 URL 확인

## ✅ 검증 완료

- [x] API 경로 수정 완료
- [x] nginx 설정 확인
- [x] curl 테스트 성공
- [x] 브라우저 테스트 성공
- [x] 프로덕션 배포 완료
- [x] 문서화 완료

---

**작성일**: 2026-03-05  
**작성자**: AI Assistant  
**관련 커밋**: 2ca8435
