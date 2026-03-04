# APICK 사업자번호 인증 수정 사항

**날짜**: 2026-03-05  
**작업자**: AI Assistant  
**이슈**: https://jangpyosa.com/signup에서 기업회원가입 시 APICK 사업자번호 인증이 작동하지 않는 문제

## 문제 원인

1. **프론트엔드 API 경로 설정 문제**
   - `/apps/web/src/app/api/apick/bizno/[bizNo]/route.ts`에서 프로덕션 환경의 백엔드 API URL이 설정되지 않음
   - `NEXT_PUBLIC_API_BASE` 환경변수가 설정되지 않아 기본값 `localhost:4000` 사용
   - 프로덕션에서는 `https://jangpyosa.com:4000`으로 접근해야 함

2. **PM2 Ecosystem 설정 문제**
   - APICK 관련 환경변수(`APICK_PROVIDER`, `APICK_API_KEY`)가 설정되지 않음
   - API 서버가 npm을 통해 시작되지 않고 지속적으로 재시작되는 문제

3. **API 서버 시작 스크립트 문제**
   - PM2 ecosystem config에서 `args: "start"`로 설정되어 npm이 "start" 패키지를 찾으려 함
   - 실제로는 `args: "run start"`이어야 하나, 더 나은 방법은 `dist/index.js`를 직접 실행

## 적용된 수정 사항

### 1. 프론트엔드 API 경로 수정

**파일**: `/apps/web/src/app/api/apick/bizno/[bizNo]/route.ts`

```typescript
// 백엔드 API 서버 호출
// 프로덕션: https://jangpyosa.com:4000, 개발: http://localhost:4000
const apiUrl = process.env.NEXT_PUBLIC_API_BASE || 
               (process.env.NODE_ENV === 'production' ? 'https://jangpyosa.com:4000' : 'http://localhost:4000');
const backendUrl = `${apiUrl}/apick/bizno/${cleanBizNo}`;
```

**변경 내용**:
- NODE_ENV가 `production`일 때 자동으로 `https://jangpyosa.com:4000` 사용
- 개발 환경에서는 `localhost:4000` 유지
- 환경 변수 `NEXT_PUBLIC_API_BASE`로 오버라이드 가능

### 2. PM2 Ecosystem 설정 수정

**파일**: `/home/ubuntu/jangpyosa/ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    {
      name: "jangpyosa-api",
      cwd: "/home/ubuntu/jangpyosa/apps/api",
      script: "dist/index.js",           // ✅ 직접 실행
      interpreter: "node",                 // ✅ node 인터프리터 명시
      env: {
        NODE_ENV: "production",
        PORT: 4000,
        APICK_PROVIDER: "mock",           // ✅ 추가됨
        APICK_API_KEY: ""                 // ✅ 추가됨 (실제 API 키로 교체 필요)
      },
      max_memory_restart: "500M",
      error_file: "/home/ubuntu/.pm2/logs/jangpyosa-api-error.log",
      out_file: "/home/ubuntu/.pm2/logs/jangpyosa-api-out.log"
    },
    {
      name: "jangpyosa-web",
      cwd: "/home/ubuntu/jangpyosa/apps/web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3003",
      env: {
        NODE_ENV: "production",
        API_BASE: "http://localhost:4000",
        NEXT_PUBLIC_API_BASE: "https://jangpyosa.com:4000"  // ✅ 추가됨
      },
      max_memory_restart: "500M",
      error_file: "/home/ubuntu/.pm2/logs/jangpyosa-web-error.log",
      out_file: "/home/ubuntu/.pm2/logs/jangpyosa-web-out.log"
    }
  ]
};
```

**주요 변경 사항**:
1. **API 서버**: `dist/index.js`를 직접 실행 (npm 사용하지 않음)
2. **APICK 환경변수 추가**: `APICK_PROVIDER: "mock"`, `APICK_API_KEY: ""`
3. **Frontend API URL**: `NEXT_PUBLIC_API_BASE: "https://jangpyosa.com:4000"` 추가

### 3. 배포 단계

```bash
# 1. 코드 업데이트
cd /home/ubuntu/jangpyosa
git pull

# 2. 프론트엔드 빌드
cd apps/web
npm run build

# 3. PM2 재시작
cd /home/ubuntu/jangpyosa
pm2 delete jangpyosa-api
pm2 start ecosystem.config.js --only jangpyosa-api
pm2 restart jangpyosa-web --update-env

# 4. PM2 설정 저장
pm2 save
```

## 테스트 결과

### 1. 백엔드 API 테스트

```bash
$ curl 'http://localhost:4000/apick/bizno/1234567890'
{
  "success": true,
  "bizNo": "1234567890",
  "companyName": "MOCK_COMPANY_12345",
  "ceoName": "홍길동",
  "data": {
    "회사명": "MOCK_COMPANY_12345",
    "사업자등록번호": "1234567890",
    "사업자상태": "계속사업자",
    "과세유형": "부가가치세 일반과세자",
    "대표명": "홍길동",
    "success": 1
  },
  "message": "사업자번호 인증 완료"
}
```

✅ **성공**: 백엔드 API가 정상적으로 작동

### 2. 프론트엔드 API 라우트 테스트

```bash
$ curl 'http://localhost:3003/api/apick/bizno/1234567890'
{
  "success": true,
  "bizNo": "1234567890",
  "companyName": "MOCK_COMPANY_12345",
  "ceoName": "홍길동",
  ...
}
```

✅ **성공**: 프론트엔드 API 라우트가 백엔드를 정상적으로 호출

### 3. 브라우저 테스트

1. https://jangpyosa.com/signup 접속
2. 회원가입 유형 선택: "기업회원가입 (고용부담금 구매 기업)"
3. 사업자번호 입력: `1234567890`
4. "사업자번호 조회" 버튼 클릭
5. **예상 결과**: "✅ 사업자번호 인증 완료" 메시지와 함께 회사명, 대표자명 자동 입력

## 현재 상태

- ✅ **Mock 모드**: APICK API는 현재 Mock 모드로 작동 중
- ⚠️ **실제 API**: 실제 APICK API 키가 설정되지 않음

## 실제 APICK API 사용 시 설정

실제 APICK API를 사용하려면:

1. **APICK API 키 발급** (https://apick.app 에서)
2. **PM2 Ecosystem 설정 수정**:
```javascript
env: {
  NODE_ENV: "production",
  PORT: 4000,
  APICK_PROVIDER: "real",              // ✅ mock → real로 변경
  APICK_API_KEY: "YOUR_APICK_API_KEY"  // ✅ 실제 API 키 입력
}
```
3. **PM2 재시작**:
```bash
pm2 restart jangpyosa-api --update-env
pm2 save
```

## 관련 파일

- `/apps/web/src/app/api/apick/bizno/[bizNo]/route.ts` - 프론트엔드 API 라우트
- `/apps/api/src/routes/apick.ts` - 백엔드 API 라우트
- `/apps/api/src/services/apick.ts` - APICK 서비스 (실제 API 호출)
- `/home/ubuntu/jangpyosa/ecosystem.config.js` - PM2 설정 (프로덕션 서버)

## 커밋 정보

**Repository**: https://github.com/masolshop/jangpyosa  
**Commit**: b9b5933  
**Message**: "수정: APICK API 프로덕션 URL 설정 추가"

---

**작성일**: 2026-03-05 06:50 KST
