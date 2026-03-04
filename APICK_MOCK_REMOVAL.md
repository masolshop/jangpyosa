# APICK Mock 모드 완전 제거 및 실제 API 복구 

**작업 일시**: 2026-03-05 07:15 KST  
**작업자**: AI Assistant  
**중요도**: 🔥 긴급 (실제 서비스 복구)

---

## 🚨 문제 상황

사용자의 요청으로 APICK Mock 모드를 조사한 결과:
- **이전에 정상 작동하던 실제 APICK API 설정이 Mock 모드로 교체됨**
- 실제 기업 데이터 대신 테스트 데이터(MOCK_COMPANY_12345, 홍길동)가 반환됨
- 회원가입 시 실제 기업 인증이 불가능한 상태

---

## 🔍 원인 분석

### Git History 조사
```bash
git log --all -S 'APICK_API_KEY' --pretty=format:'%h %ad %s' --date=short

결과:
8b57393 2026-02-28 🔑 설정: 실제 APICK API 키 적용
```

**2026-02-28 커밋에서 실제 APICK API 키 발견:**
- `APICK_PROVIDER: "real"`
- `APICK_API_KEY: "41173030f4fc1055778b2f97ce9659b5"`

### 이후 Mock 모드로 변경된 경위
- 최근 작업 중 Mock 모드가 실수로 설정됨
- 실제 API 키 정보가 유실됨

---

## 🔧 복구 작업

### 1. 실제 APICK API 키 복구
**파일**: `ecosystem.config.js`

```javascript
// 복구 전 (Mock 모드)
env: {
  NODE_ENV: "production",
  PORT: 4000,
  APICK_PROVIDER: "mock",
  APICK_API_KEY: ""
}

// 복구 후 (실제 API)
env: {
  NODE_ENV: "production",
  PORT: 4000,
  CORS_ORIGIN: "https://jangpyosa.com",
  DATABASE_URL: "postgresql://jp:jp_pw@localhost:5432/jangpyosa?schema=public",
  JWT_SECRET: "change_me_super_secret_jangpyosa_2026",
  JWT_REFRESH_SECRET: "change_me_refresh_secret_jangpyosa_2026",
  APICK_PROVIDER: "real",
  APICK_API_KEY: "41173030f4fc1055778b2f97ce9659b5"
}
```

### 2. Mock 코드 완전 제거

#### apps/api/src/services/apick.ts
```typescript
// 제거된 코드 (58-73줄)
if (config.apickProvider === "mock") {
  return {
    ok: true,
    name: "MOCK_COMPANY_" + cleanBizNo.slice(0, 5),
    representative: "홍길동",
    data: {
      회사명: "MOCK_COMPANY_" + cleanBizNo.slice(0, 5),
      사업자등록번호: cleanBizNo,
      사업자상태: "계속사업자",
      과세유형: "부가가치세 일반과세자",
      대표명: "홍길동",
      success: 1,
    },
  };
}
```

#### apps/api/src/config.ts
```typescript
// 제거된 코드
apickProvider: (process.env.APICK_PROVIDER ?? "real") as "mock" | "real",

// 최종 config
export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET ?? "dev_secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "dev_refresh",
  apickApiKey: process.env.APICK_API_KEY ?? "",
};
```

#### apps/api/src/index.ts
```typescript
// 변경 전
console.log(`🔐 APICK Provider: ${config.apickProvider}`);

// 변경 후  
console.log(`🔐 APICK API: ${config.apickApiKey ? 'Configured ✅' : 'Not configured ❌'}`);
```

### 3. 환경 변수 예제 파일 정리
**파일**: `.env.example`

```bash
# 제거
APICK_PROVIDER="mock"
APICK_API_KEY=""

# 추가
APICK_API_KEY="your_actual_apick_api_key_here"
```

---

## 🚀 배포 절차

```bash
# 1. 서버 백업
cd /home/ubuntu/jangpyosa
cp ecosystem.config.js ecosystem.config.js.backup-before-real-apick-$(date +%Y%m%d-%H%M%S)

# 2. 변경사항 취소 및 최신 코드 가져오기
git checkout -- ecosystem.config.js
git pull

# 3. PM2 재시작 (환경 변수 업데이트)
pm2 restart ecosystem.config.js --update-env
pm2 save

# 4. 로그 확인
pm2 logs jangpyosa-api --lines 20
```

---

## ✅ 복구 확인

### 백엔드 API 테스트 (실제 사업자번호: 쿠팡)
```bash
curl 'http://localhost:4000/apick/bizno/1208800767' | python3 -m json.tool

# 응답 (성공 ✅)
{
  "success": true,
  "bizNo": "1208800767",
  "companyName": "쿠팡 주식회사",
  "ceoName": "ROGERS HAROLD LYNN(로저스해럴드린)",
  "data": {
    "회사명": "쿠팡 주식회사",
    "사업자등록번호": "1208800767",
    "사업자상태": "계속사업자",
    "과세유형": "부가가치세 일반과세자",
    "대표명": "ROGERS HAROLD LYNN(로저스해럴드린)",
    "설립일": "2013-07-16",
    "업종": "도소매",
    "업태": "통신판매업",
    "전화번호": "02-1577-7011",
    "직원수": "12155",
    ...
  }
}
```

### 프론트엔드 API 프록시 테스트
```bash
curl 'http://localhost:3003/api/apick/bizno/1208800767'

# 응답 (성공 ✅) - 동일한 실제 기업 데이터 반환
```

### APICK API 응답 로그 확인
```
📋 APICK API Response: {
  "data": { ... 실제 기업 정보 ... },
  "api": {
    "success": true,
    "cost": 40,
    "ms": 280,
    "pl_id": 25746178
  }
}
```

---

## 📊 복구 결과

| 항목 | 복구 전 (Mock) | 복구 후 (Real) |
|------|---------------|----------------|
| APICK_PROVIDER | mock | real |
| APICK_API_KEY | "" (없음) | 41173030... ✅ |
| 반환 데이터 | MOCK_COMPANY_12345 | 실제 기업명 (예: 쿠팡 주식회사) |
| 대표자명 | 홍길동 (Mock) | 실제 대표자명 |
| API 호출 | 하지 않음 | APICK 실제 API 호출 |
| 사업자번호 검증 | ❌ 불가능 | ✅ 가능 |

---

## 🛡️ 재발 방지 대책

### 1. 환경 변수 백업 생성
```bash
# 서버에서 현재 설정 백업
cd /home/ubuntu/jangpyosa
cp ecosystem.config.js ecosystem.config.js.backup-$(date +%Y%m%d)

# 백업 목록 확인
ls -la ecosystem.config.js.backup-*
```

### 2. Git History 보존
- 실제 API 키가 적용된 커밋: `8b57393`
- 향후 참조를 위해 보존 필요
- `git show 8b57393:ecosystem.config.js` 명령으로 언제든 복구 가능

### 3. 환경 변수 문서화
- `APICK_API_KEY`: APICK 사업자번호 인증 API 키
- 실제 서비스에서는 항상 "real" 모드만 사용
- Mock 모드는 개발/테스트 환경에서만 사용 (프로덕션 사용 금지)

### 4. 배포 체크리스트
- [ ] ecosystem.config.js에 APICK_API_KEY 설정 확인
- [ ] `APICK_PROVIDER: "real"` 또는 APICK_PROVIDER 자체를 제거
- [ ] 배포 후 실제 사업자번호로 테스트
- [ ] PM2 로그에서 "APICK API: Configured ✅" 확인

---

## 🔗 관련 커밋

- `2be0c54` - 🔥 중요: APICK Mock 모드 완전 제거 및 실제 API 키 복구
- `8b57393` - 🔑 설정: 실제 APICK API 키 적용 (2026-02-28)

---

## 📝 주요 변경 파일

### 수정된 파일
1. `ecosystem.config.js` - 실제 APICK API 키 복구
2. `apps/api/src/services/apick.ts` - Mock 코드 제거
3. `apps/api/src/config.ts` - apickProvider 설정 제거
4. `apps/api/src/index.ts` - 로그 메시지 변경
5. `.env.example` - Mock 관련 설정 제거

### 생성된 파일
- `.env.production.example` - 프로덕션 환경 변수 예제

---

**복구 완료**: 2026-03-05 07:15 KST  
**서비스 상태**: ✅ 실제 APICK API 정상 작동  
**데이터 품질**: ✅ 실제 기업 데이터 반환  
**회원가입**: ✅ 실제 사업자번호 인증 가능
