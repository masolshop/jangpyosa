# 🔒 APICK 설정 고정 - 변경 금지

**작성일**: 2026-03-05 07:45 KST  
**중요도**: 🔥🔥🔥 최고 (절대 변경 금지)

---

## ⚠️ 경고

**이 설정은 절대 변경하지 마십시오!**

실제 APICK API가 정상 작동하는 설정입니다.
Mock 모드로 변경하면 실제 사업자번호 인증이 불가능해집니다.

---

## 🔐 고정된 설정

### 1. ecosystem.config.js (프로덕션)

```javascript
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

**❌ 절대 변경 금지 항목:**
- `APICK_PROVIDER: "real"` → Mock으로 변경 금지
- `APICK_API_KEY: "41173030..."` → 삭제 또는 변경 금지

---

## 🛡️ 보호 조치

### 1. 서버 백업 생성 완료
```bash
# 백업 파일 목록
/home/ubuntu/jangpyosa/ecosystem.config.js.backup
/home/ubuntu/jangpyosa/ecosystem.config.js.backup-before-real-apick-*
```

### 2. Git 보호 설정

**로컬 저장소:**
```bash
cd /home/user/webapp

# ecosystem.config.js를 .gitignore에 추가 (민감 정보 보호)
echo "ecosystem.config.js" >> .gitignore

# 단, 템플릿은 커밋
cp ecosystem.config.js ecosystem.config.template.js
# API 키를 템플릿에서 제거
```

### 3. 서버 설정 고정

**서버에서 파일 보호:**
```bash
# 읽기 전용으로 설정 (선택사항)
sudo chattr +i /home/ubuntu/jangpyosa/ecosystem.config.js

# 해제 방법 (필요시):
# sudo chattr -i /home/ubuntu/jangpyosa/ecosystem.config.js
```

---

## 📋 변경 금지 체크리스트

배포 전 반드시 확인:

- [ ] `APICK_PROVIDER`가 "real"인가?
- [ ] `APICK_API_KEY`가 "41173030f4fc1055778b2f97ce9659b5"인가?
- [ ] Mock 관련 코드가 없는가?
- [ ] `apps/api/src/services/apick.ts`에 Mock 로직이 없는가?
- [ ] `apps/api/src/config.ts`에 `apickProvider` 변수가 없는가?

---

## 🔍 확인 방법

### 1. 서버에서 확인
```bash
# ecosystem.config.js 확인
cat /home/ubuntu/jangpyosa/ecosystem.config.js | grep -A 5 APICK

# PM2 환경 변수 확인
pm2 env 7 | grep APICK

# 실제 API 테스트
curl 'http://localhost:4000/apick/bizno/1208800767' | python3 -m json.tool | head -5
```

### 2. 정상 응답 예시
```json
{
  "success": true,
  "bizNo": "1208800767",
  "companyName": "쿠팡 주식회사",
  "ceoName": "ROGERS HAROLD LYNN(로저스해럴드린)"
}
```

### 3. 비정상 응답 (Mock 모드)
```json
{
  "companyName": "MOCK_COMPANY_12087",  // ❌ Mock 데이터
  "ceoName": "홍길동"  // ❌ Mock 데이터
}
```

---

## 🚨 문제 발생 시 복구 방법

### 빠른 복구 (Git History)
```bash
cd /home/ubuntu/jangpyosa

# 1. 원본 커밋에서 복구
git show 8b57393:ecosystem.config.js > ecosystem.config.js

# 2. PM2 재시작
pm2 restart ecosystem.config.js --update-env
pm2 save
```

### 백업에서 복구
```bash
cd /home/ubuntu/jangpyosa

# 1. 최신 백업 복사
cp ecosystem.config.js.backup-before-real-apick-* ecosystem.config.js

# 2. PM2 재시작
pm2 restart ecosystem.config.js --update-env
pm2 save
```

---

## 📝 변경 이력

| 날짜 | 작업 | 상태 |
|------|------|------|
| 2026-02-28 | 실제 APICK API 키 최초 적용 | ✅ 정상 |
| 2026-03-05 | Mock 모드로 잘못 변경됨 | ❌ 문제 |
| 2026-03-05 07:15 | 실제 API로 복구 | ✅ 정상 |
| 2026-03-05 07:45 | 설정 고정 문서 작성 | 🔒 보호 |

---

## 💡 개발자 노트

### Mock 모드는 언제 사용하나?

**절대 사용 금지 환경:**
- ❌ 프로덕션 (jangpyosa.com)
- ❌ 스테이징 서버

**사용 가능 환경:**
- ✅ 로컬 개발 환경 (localhost)
- ✅ 테스트 환경 (APICK API 호출 비용 절감)

### 로컬 개발 시
```javascript
// .env.local (로컬 개발용)
APICK_PROVIDER="mock"  // 로컬에서만 사용
APICK_API_KEY=""
```

### 프로덕션/스테이징
```javascript
// ecosystem.config.js (절대 변경 금지)
APICK_PROVIDER: "real",
APICK_API_KEY: "41173030f4fc1055778b2f97ce9659b5"
```

---

## 🔗 관련 문서

- `APICK_MOCK_REMOVAL.md` - Mock 제거 및 복구 과정
- `APICK_FIX_DEPLOYMENT.md` - 초기 문제 해결
- Git 커밋: `8b57393` (실제 API 키 최초 적용)
- Git 커밋: `2be0c54` (Mock 제거 및 복구)

---

**최종 확인**: 2026-03-05 07:45 KST  
**상태**: 🔒 실제 APICK API 고정 완료  
**테스트**: ✅ https://jangpyosa.com/signup 정상 작동
