# 구글 시트 실시간 동기화 시스템

## 📋 개요

매니저 가입, 승인, 역할 변경 시 구글 시트로 실시간 동기화하는 시스템입니다.

### 동기화 트리거 이벤트
- ✅ 매니저 가입 승인 (`POST /sales/people/:id/toggle-active`)
- ✅ 매니저 생성 (`POST /sales/people/create`)
- ✅ 역할 변경/등업 (`POST /sales/people/:id/promote`)
- ✅ 매니저 정보 수정 (`PUT /sales/people/:id`)

---

## 🔧 구현 내용

### 1. Google Sheets 서비스 모듈

**파일**: `apps/api/src/services/google-sheets.ts`

#### 주요 기능
- `initGoogleSheets()`: Google Sheets API 초기화
- `setupGoogleSheet()`: 시트 생성 및 헤더 설정
- `syncHeadquartersToSheet()`: 본부 데이터 동기화
- `syncBranchesToSheet()`: 지사 데이터 동기화
- `syncManagersToSheet()`: 매니저 데이터 동기화
- `syncToGoogleSheetRealtime()`: 실시간 전체 동기화

#### 시트 구조

##### 📊 본부 시트
| ID | 본부명 | 본부장 | 전화번호 | 이메일 | 활성상태 | 비고 | 생성일 | 수정일 |
|---|---|---|---|---|---|---|---|---|
| org_123 | 서울본부 | 김본부 | 01012345678 | kim@example.com | Y | - | 2026-01-01T00:00:00Z | 2026-01-01T00:00:00Z |

##### 📊 지사 시트
| ID | 지사명 | 지사장 | 전화번호 | 이메일 | 소속본부ID | 소속본부명 | 활성상태 | 비고 | 생성일 | 수정일 |
|---|---|---|---|---|---|---|---|---|---|---|
| branch_456 | 강남지사 | 이지사 | 01098765432 | lee@example.com | org_123 | 서울본부 | Y | - | 2026-01-05T00:00:00Z | 2026-01-05T00:00:00Z |

##### 📊 매니저 시트
| ID | 이름 | 전화번호 | 이메일 | 역할 | 소속조직ID | 소속조직명 | 상위매니저ID | 상위매니저명 | 추천코드 | 추천링크 | 총추천수 | 활성추천수 | 총매출 | 수수료 | 승인상태 | 활성상태 | 비고 | 생성일 | 수정일 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| mgr_789 | 박매니저 | 01011112222 | park@example.com | 매니저 | branch_456 | 강남지사 | - | - | 1011112222 | https://jangpyosa.com/01011112222 | 5 | 3 | 5000000 | 500000 | Y | Y | - | 2026-01-10T00:00:00Z | 2026-01-10T00:00:00Z |

##### 📊 동기화정보 시트
| 마지막 동기화 시간 |
|---|
| 2026-03-05T15:30:00.000Z |

---

### 2. API 라우트 수정

**파일**: `apps/api/src/routes/sales.ts`

#### 수정 내역
```typescript
import { syncToGoogleSheetRealtime } from '../services/google-sheets.js';

// 각 엔드포인트에 동기화 훅 추가
syncToGoogleSheetRealtime(prisma).catch(err => 
  console.error('구글 시트 동기화 실패:', err)
);
```

#### 적용 엔드포인트
1. **POST /sales/people/create** - 매니저 생성
2. **POST /sales/people/:id/toggle-active** - 승인/비활성화
3. **POST /sales/people/:id/promote** - 등업
4. **PUT /sales/people/:id** - 정보 수정

---

### 3. 서버 초기화

**파일**: `apps/api/src/index.ts`

```typescript
import { initGoogleSheets, setupGoogleSheet } from "./services/google-sheets.js";

// 서버 시작 시 Google Sheets 초기화
const googleSheetsConfig = {
  clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL || '',
  privateKey: process.env.GOOGLE_SHEETS_PRIVATE_KEY || '',
  spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '',
};

if (googleSheetsConfig.clientEmail && googleSheetsConfig.privateKey && googleSheetsConfig.spreadsheetId) {
  const initialized = initGoogleSheets(googleSheetsConfig);
  if (initialized) {
    await setupGoogleSheet();
    console.log('📊 Google Sheets: Configured ✅');
  }
}
```

---

## ⚙️ 환경 변수 설정

### 필수 환경 변수

`.env.production` 또는 `ecosystem.config.js`에 추가:

```bash
# Google Sheets 설정 (선택 사항)
GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account@project-id.iam.gserviceaccount.com"
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID="your-spreadsheet-id"
```

---

## 🚀 Google Cloud 설정 가이드

### 1. Google Cloud 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성: **장표사 관리 시스템**
3. 프로젝트 선택

### 2. Google Sheets API 활성화

1. **API 및 서비스 > 라이브러리** 이동
2. "Google Sheets API" 검색
3. **사용 설정** 클릭

### 3. 서비스 계정 생성

1. **IAM 및 관리자 > 서비스 계정** 이동
2. **서비스 계정 만들기** 클릭
3. 서비스 계정 세부정보:
   - **이름**: `jangpyosa-sheets-sync`
   - **설명**: `장표사 구글 시트 동기화 서비스 계정`
4. **역할 부여**:
   - `편집자` 역할 선택 (또는 최소 권한: `Google Sheets API 사용자`)
5. **완료** 클릭

### 4. 서비스 계정 키 생성

1. 생성된 서비스 계정 클릭
2. **키** 탭 이동
3. **키 추가 > 새 키 만들기**
4. **JSON** 형식 선택
5. 다운로드된 JSON 파일 확인:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "jangpyosa-sheets-sync@your-project-id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

### 5. 구글 시트 생성 및 공유

1. [Google Sheets](https://sheets.google.com) 접속
2. **새 스프레드시트 만들기**
3. 이름: **장표사 매니저 관리**
4. URL에서 스프레드시트 ID 확인:
   ```
   https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   ```
5. **공유** 버튼 클릭
6. 서비스 계정 이메일 추가:
   - `jangpyosa-sheets-sync@your-project-id.iam.gserviceaccount.com`
   - **편집자** 권한 부여
7. **완료**

### 6. 서버에 환경 변수 설정

#### ecosystem.config.js 수정
```javascript
{
  name: 'jangpyosa-api',
  env: {
    // ... 기존 환경 변수
    GOOGLE_SHEETS_CLIENT_EMAIL: 'jangpyosa-sheets-sync@your-project-id.iam.gserviceaccount.com',
    GOOGLE_SHEETS_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n',
    GOOGLE_SHEETS_SPREADSHEET_ID: 'your-spreadsheet-id',
  }
}
```

**⚠️ 주의**: `GOOGLE_SHEETS_PRIVATE_KEY`의 `\n`은 **실제 줄바꿈이 아닌 문자열 `\n`**으로 입력해야 합니다.

---

## 🧪 테스트

### 1. 서버 재시작 후 로그 확인

```bash
pm2 restart jangpyosa-api
pm2 logs jangpyosa-api --lines 100
```

**기대 로그**:
```
✅ Google Sheets 서비스 초기화 완료
✅ 시트 생성: 본부
✅ 시트 생성: 지사
✅ 시트 생성: 매니저
✅ 시트 생성: 동기화정보
✅ 구글 시트 초기 설정 완료
📊 Google Sheets: Configured ✅
```

### 2. 매니저 생성 테스트

```bash
curl -X POST https://jangpyosa.com/api/sales/people/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "테스트매니저",
    "phone": "010-1234-5678",
    "password": "test1234",
    "email": "test@test.com",
    "role": "MANAGER"
  }'
```

**기대 로그**:
```
🔄 실시간 구글 시트 동기화 시작...
✅ 본부 0개 동기화 완료
✅ 지사 0개 동기화 완료
✅ 매니저 1개 동기화 완료
✅ 실시간 동기화 완료
```

### 3. 구글 시트 확인

1. [Google Sheets](https://sheets.google.com) 접속
2. **장표사 매니저 관리** 스프레드시트 열기
3. **매니저** 시트 확인 → 새로운 매니저 데이터가 추가됨
4. **동기화정보** 시트 확인 → 최신 동기화 시간 업데이트됨

---

## 🔍 트러블슈팅

### 문제 1: "Google Sheets 서비스가 초기화되지 않았습니다"

**원인**: 환경 변수 미설정

**해결**:
```bash
# ecosystem.config.js 확인
cat /home/ubuntu/jangpyosa/ecosystem.config.js | grep GOOGLE_SHEETS

# PM2 환경 변수 확인
pm2 env 0 | grep GOOGLE_SHEETS
```

### 문제 2: "Permission denied"

**원인**: 서비스 계정에 시트 공유 안 됨

**해결**:
1. Google Sheets 열기
2. **공유** 클릭
3. 서비스 계정 이메일 추가 및 **편집자** 권한 부여

### 문제 3: "Invalid credentials"

**원인**: Private Key 형식 오류

**해결**:
- JSON 파일에서 `private_key` 값을 **그대로** 복사
- `\n`은 문자열로 유지 (실제 줄바꿈 X)
- PM2 재시작: `pm2 restart jangpyosa-api`

### 문제 4: 동기화는 성공하지만 시트에 반영 안 됨

**원인**: 스프레드시트 ID 오류

**해결**:
```bash
# 시트 URL에서 ID 재확인
https://docs.google.com/spreadsheets/d/{이_부분이_ID}/edit
```

---

## 📊 동기화 흐름도

```
매니저 가입/승인/수정
    ↓
API 엔드포인트 호출
    ↓
DB 업데이트 (Prisma)
    ↓
syncToGoogleSheetRealtime() 실행 (비동기)
    ↓
전체 데이터 조회 (본부/지사/매니저)
    ↓
Google Sheets API 호출
    ↓
각 시트 업데이트:
  - 본부 시트
  - 지사 시트
  - 매니저 시트
  - 동기화정보 시트 (타임스탬프)
    ↓
✅ 동기화 완료 (실패 시 로그만 출력, 메인 로직 영향 없음)
```

---

## 🎯 특징

### 1. 비동기 처리
- 메인 비즈니스 로직과 독립적으로 실행
- 동기화 실패해도 API 응답에 영향 없음

### 2. 선택적 기능
- 환경 변수 미설정 시 자동 스킵
- "Google Sheets: Not configured (선택 기능)" 로그 출력

### 3. 전체 동기화
- 매번 전체 데이터를 새로 쓰기 (덮어쓰기)
- 데이터 정합성 보장

### 4. 실시간 업데이트
- 매니저 생성/수정/승인 즉시 반영
- 관리자는 구글 시트에서 실시간으로 확인 가능

---

## 🚀 배포 정보

- **커밋 해시**: 구현 완료 후 생성
- **날짜**: 2026-03-05
- **브랜치**: `main`
- **변경 파일**:
  - `apps/api/src/services/google-sheets.ts` (신규)
  - `apps/api/src/routes/sales.ts` (수정)
  - `apps/api/src/index.ts` (수정)
  - `.env.production.example` (수정)
  - `GOOGLE_SHEETS_SYNC.md` (신규)

---

## 📝 추후 개선 사항

1. **양방향 동기화**
   - 구글 시트에서 수정 → DB 반영
   - Apps Script 웹훅 활용

2. **선택적 동기화**
   - 변경된 레코드만 업데이트
   - 성능 최적화

3. **알림 기능**
   - Slack/Discord 웹훅으로 동기화 완료 알림
   - 실패 시 관리자에게 이메일 알림

4. **동기화 로그 테이블**
   - Prisma 모델로 동기화 이력 관리
   - 실패 원인 추적

---

## 🔗 관련 문서

- [Google Sheets API 문서](https://developers.google.com/sheets/api)
- [Google Cloud 서비스 계정 가이드](https://cloud.google.com/iam/docs/service-accounts)
- [PM2 환경 변수 설정](https://pm2.keymetrics.io/docs/usage/environment/)

---

**문의**: 개발팀
**최종 업데이트**: 2026-03-05
