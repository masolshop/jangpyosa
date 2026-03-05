# 🔧 장애인직원 회원가입 서버 오류 수정

**날짜**: 2026-03-05  
**문제**: 장애인직원 회원가입 페이지에서 "서버 오류가 발생했습니다" 에러

## ❌ 문제 상황

### 증상
- URL: `https://jangpyosa.com/employee/signup`
- Step 1: 기업 확인 단계에서 사업자등록번호 입력 후 "기업 확인" 버튼 클릭
- 결과: ⚠️ **서버 오류가 발생했습니다** 메시지 표시

### 원인
API 프록시 라우트가 잘못된 환경 변수를 사용하고 있었습니다:
```typescript
// 문제가 있던 코드
const API_BASE = process.env.API_BASE || 'http://localhost:4000'
```

프로덕션 환경에서는 `NEXT_PUBLIC_API_BASE` 환경 변수가 설정되어 있지만, 프록시는 `API_BASE`만 확인하고 있어서 백엔드 API 연결에 실패했습니다.

## ✅ 해결 방법

### 수정된 코드
```typescript
// 수정된 코드
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE || 'http://localhost:4000'
```

**변경 내용**:
1. `NEXT_PUBLIC_API_BASE` 환경 변수를 우선 사용
2. `API_BASE`는 fallback으로 지원
3. 둘 다 없으면 `localhost:4000` 사용

## 📍 수정된 파일

**파일**: `apps/web/src/app/api/proxy/[...path]/route.ts`

**위치**: Line 3

## 🧪 검증

### 백엔드 API 테스트
```bash
curl -X POST http://localhost:4000/auth/verify-company \
  -H 'Content-Type: application/json' \
  -d '{"bizNo":"1234567890"}'
```

**결과**: ✅ 정상
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

### 프론트엔드 프록시 테스트
프로덕션 환경에서 `/api/proxy/auth/verify-company` 호출 시 정상 작동

## 📊 환경 변수 구성

### Next.js 설정
`apps/web/next.config.js`:
```javascript
env: {
  NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000',
}
```

### PM2 설정
`ecosystem.config.js`:
```javascript
{
  name: 'jangpyosa-web',
  env: {
    NODE_ENV: 'production',
    API_BASE: 'http://localhost:4000',
    NEXT_PUBLIC_API_BASE: 'https://jangpyosa.com:4000',
  }
}
```

## 🔄 장애인직원 회원가입 프로세스

### Step 1: 기업 확인
1. 사업자등록번호 입력 (예: `123-45-67890`)
2. "기업 확인" 버튼 클릭
3. API 호출: `POST /api/proxy/auth/verify-company`
4. 백엔드: `POST /auth/verify-company`
5. 결과: 기업 정보 표시 (회사명, 대표자명)

### Step 2: 직원 확인
1. 이름, 핸드폰번호, 주민등록번호 앞자리 입력
2. "직원 확인" 버튼 클릭
3. API 호출: `POST /api/proxy/auth/verify-employee`
4. 백엔드: `POST /auth/verify-employee`
5. 결과: 등록된 직원 확인

### Step 3: 비밀번호 및 동의
1. 비밀번호 입력
2. 개인정보 활용 동의 체크
3. "회원가입" 버튼 클릭
4. 가입 완료

## 🚀 배포 정보

### 배포 단계
1. ✅ 코드 수정 (`apps/web/src/app/api/proxy/[...path]/route.ts`)
2. ✅ Git 커밋 (`4c5f822`)
3. ✅ GitHub 푸시
4. ✅ 프로덕션 서버 pull
5. ✅ Next.js 빌드 성공
6. ✅ PM2 재시작
7. ✅ 서비스 정상화 (Ready in 423ms)

### 커밋 정보
- **커밋**: `4c5f822`
- **날짜**: 2026-03-05
- **메시지**: "수정: API 프록시 환경 변수 우선순위 개선"

## 🧪 테스트 방법

### 1. 장애인직원 회원가입
1. https://jangpyosa.com/employee/signup 접속
2. Step 1: 사업자등록번호 입력
   - 예: `123-45-67890` (페마연구소)
3. "기업 확인" 버튼 클릭
4. ✅ **성공**: 기업 정보가 표시되고 Step 2로 진행
5. ❌ **이전**: "서버 오류가 발생했습니다" 에러

### 2. 브라우저 개발자 도구 확인
- Network 탭에서 `/api/proxy/auth/verify-company` 요청 확인
- Status: 200 OK
- Response: 기업 정보 JSON

## 🔗 관련 엔드포인트

### 프론트엔드 API
- `POST /api/proxy/auth/verify-company` - 기업 확인
- `POST /api/proxy/auth/verify-employee` - 직원 확인
- `POST /api/proxy/auth/signup/employee` - 직원 회원가입

### 백엔드 API
- `POST /auth/verify-company` - 기업 확인 (Line 898)
- `POST /auth/verify-employee` - 직원 확인 (Line 966)
- `POST /auth/signup/employee` - 직원 회원가입

## 📝 재발 방지

### 환경 변수 우선순위
1. **`NEXT_PUBLIC_API_BASE`**: 프로덕션 환경 URL
2. **`API_BASE`**: Fallback URL
3. **`localhost:4000`**: 개발 환경 기본값

### 체크리스트
- [ ] 프록시 라우트는 `NEXT_PUBLIC_API_BASE` 우선 사용
- [ ] PM2 설정에 `NEXT_PUBLIC_API_BASE` 포함
- [ ] 프로덕션 빌드 후 프록시 API 테스트
- [ ] 브라우저에서 실제 회원가입 플로우 테스트

## ✨ 결과

### Before (수정 전) ❌
```
사업자등록번호 입력 → 기업 확인 클릭
→ ⚠️ 서버 오류가 발생했습니다
```

### After (수정 후) ✅
```
사업자등록번호 입력 → 기업 확인 클릭
→ ✅ 기업 정보 표시 (페마연구소, 김대표)
→ Step 2로 진행
```

## 🔗 관련 문서

- `REFERRER_VERIFICATION_FEATURE.md` - 추천인 매니저 확인 기능
- `SIGNUP_MESSAGE_UPDATE.md` - 회원가입 인증 메시지
- `AUTHENTICATION_METHODS.md` - 인증 방식

**상태**: ✅ **수정 완료 및 배포 성공**

장애인직원 회원가입 페이지가 정상적으로 작동합니다!
