# 매니저 가입 이메일 알림 기능

## 📋 개요

매니저 가입 시 `jangpyosa@gmail.com`으로 자동 이메일 알림을 전송합니다.

## ✅ 구현 내용

### 1. 이메일 서비스 모듈
**파일**: `apps/api/src/services/email.ts`

#### 주요 기능
- **Gmail SMTP** 사용
- **HTML 템플릿** 이메일
- **비동기 전송** (실패해도 가입은 성공)
- **향후 확장**: 카카오 알림톡으로 전환 예정

#### 함수
```typescript
sendManagerSignupNotification({
  managerName: string,      // 매니저 이름
  managerPhone: string,     // 핸드폰 번호
  managerEmail?: string,    // 이메일 (선택)
  branchName?: string,      // 소속 지사 (선택)
  refCode?: string,         // 추천 코드 (선택)
  role?: string,            // 역할 (MANAGER, BRANCH_MANAGER, HEAD_MANAGER)
  organizationName?: string // 조직명 (선택)
})
```

### 2. 적용된 엔드포인트

#### POST /auth/signup/agent
**일반 매니저 회원가입**
```typescript
// User 생성 후
sendManagerSignupNotification({
  managerName: user.name,
  managerPhone: user.phone,
  managerEmail: user.email,
  branchName: user.branch?.name,
  refCode: user.refCode,
  role: 'MANAGER',
}).catch(err => console.error('이메일 알림 전송 실패:', err));
```

#### POST /sales/people/create
**슈퍼어드민이 매니저/본부장/지사장 생성**
```typescript
// SalesPerson 생성 후
sendManagerSignupNotification({
  managerName: salesPerson.name,
  managerPhone: salesPerson.phone,
  managerEmail: salesPerson.email,
  organizationName: salesPerson.organizationName,
  role: salesPerson.role,
}).catch(err => console.error('이메일 알림 전송 실패:', err));
```

### 3. 이메일 내용

#### 제목
```
[장표사] 새로운 매니저 가입 알림
[장표사] 새로운 지사장 가입 알림
[장표사] 새로운 본부장 가입 알림
```

#### 내용 (HTML)
- **헤더**: 역할 표시 (매니저/지사장/본부장)
- **가입 정보 테이블**:
  - 이름
  - 역할 (배지 스타일)
  - 핸드폰
  - 이메일
  - 소속 조직/지사
  - 추천 코드
  - 가입 일시 (한국 시간)
- **관리자 페이지 바로가기 버튼**
- **향후 알림 방식 안내** (카카오 알림톡 전환 예정)
- **푸터**: 장표사 정보

## 🔧 설정 방법

### 1. Gmail 앱 비밀번호 생성

#### Step 1: Google 계정 설정
1. https://myaccount.google.com/ 접속
2. 보안 > 2단계 인증 활성화

#### Step 2: 앱 비밀번호 생성
1. https://myaccount.google.com/apppasswords 접속
2. 앱 선택: **메일**
3. 기기 선택: **기타 (맞춤 이름)** → "장표사 API"
4. **생성** 클릭
5. **16자리 비밀번호** 복사 (예: `abcd efgh ijkl mnop`)

### 2. 환경 변수 설정

#### 프로덕션 서버 (ecosystem.config.js)
```javascript
// /home/ubuntu/jangpyosa/apps/api/ecosystem.config.js

module.exports = {
  apps: [{
    name: 'jangpyosa-api',
    script: 'dist/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
      
      // 이메일 설정 추가
      GMAIL_USER: 'jangpyosa@gmail.com',
      GMAIL_APP_PASSWORD: 'abcdefghijklmnop', // 앱 비밀번호 (공백 제거)
      
      // 기존 설정...
      DATABASE_URL: '...',
      JWT_SECRET: '...',
      // ...
    }
  }]
}
```

#### 로컬 개발 (.env)
```bash
# apps/api/.env

GMAIL_USER=jangpyosa@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

### 3. 배포

#### 프로덕션 서버
```bash
# 1. 코드 pull
cd /home/ubuntu/jangpyosa
git pull origin main

# 2. nodemailer 설치
cd apps/api
npm install

# 3. TypeScript 빌드
npm run build

# 4. PM2 재시작 (환경 변수 reload)
pm2 restart jangpyosa-api
```

## 📊 테스트 방법

### 1. 이메일 서비스 연결 테스트
```typescript
// apps/api/src/services/email.ts
import { testEmailService } from './services/email.js';

// 서버 시작 시 자동 테스트
testEmailService();
```

**출력**:
```
✅ 이메일 서비스 연결 성공
```

**실패 시**:
```
❌ 이메일 서비스 연결 실패: Invalid login: 535-5.7.8 ...
```

### 2. 매니저 가입 테스트

#### 회원가입 페이지
```
URL: https://jangpyosa.com/signup
1. 회원 유형: 장애인 전담 영업 매니저 선택
2. 정보 입력 (이름, 핸드폰, 이메일, 지사)
3. 가입 완료
```

#### 슈퍼어드민 페이지
```
URL: https://jangpyosa.com/admin/sales-management
1. "영업 인원 생성" 버튼 클릭
2. 정보 입력 (조직명, 이름, 핸드폰, 역할)
3. 생성 완료
```

### 3. 이메일 수신 확인
```
수신: jangpyosa@gmail.com
제목: [장표사] 새로운 매니저 가입 알림
내용: 가입자 정보 + 관리자 페이지 링크
```

## 🔍 로그 확인

### 성공 로그
```bash
pm2 logs jangpyosa-api --lines 50

# 출력:
✅ 매니저 가입 알림 이메일 전송 성공: 김매니저 (010-9999-8888)
   Message ID: <abc123@gmail.com>
```

### 실패 로그
```bash
# 출력:
❌ 매니저 가입 알림 이메일 전송 실패: Invalid login
이메일 알림 전송 실패: Error: Invalid login: ...
```

**주의**: 이메일 전송 실패해도 **가입은 성공**합니다!

## 📈 이메일 템플릿 예시

### HTML 미리보기
```html
┌─────────────────────────────────────┐
│   🎉 새로운 매니저 가입             │
│   (파란색 헤더)                     │
└─────────────────────────────────────┘

가입 정보
─────────────────────────────────────
이름      김매니저
역할      [매니저] (파란 배지)
핸드폰    010-9999-8888
이메일    manager@test.com
소속 지사  페마연지사
추천 코드  01099998888
가입 일시  2026-03-05 12:34:56
─────────────────────────────────────

┌─────────────────────────────────────┐
│  장표사 관리자 페이지에서 확인하세요 │
│  [관리자 페이지 바로가기] (버튼)     │
│  (하늘색 배경)                       │
└─────────────────────────────────────┘

💡 향후 알림 방식: 카카오 알림톡으로 전환 예정

─────────────────────────────────────
장애인표준사업장 알선 플랫폼
© 2026 장표사 (jangpyosa.com)
```

## 🚀 향후 계획

### 1. 카카오 알림톡 전환
```typescript
// apps/api/src/services/kakao.ts

export async function sendKakaoNotification({
  phone: string,
  templateCode: string,
  params: object
}) {
  // 카카오 비즈니스 API 연동
}
```

### 2. 추가 알림 이벤트
- 매니저 승인/거부
- 매니저 등급 변경 (매니저 → 지사장 → 본부장)
- 매니저 비활성화
- 추천 고객 가입
- 실적 달성

### 3. 알림 설정
- 관리자 알림 ON/OFF
- 수신 이메일 추가/변경
- 알림 템플릿 커스터마이징

## ⚠️ 주의사항

### 1. Gmail 보안
- **앱 비밀번호** 사용 (일반 비밀번호 X)
- 2단계 인증 필수
- 비밀번호 환경 변수로 관리
- `.env` 파일 Git에 커밋 금지

### 2. 전송 제한
- Gmail 일일 전송 제한: 500통
- 매니저 가입 많을 경우 다른 서비스 고려
  - SendGrid
  - AWS SES
  - 네이버 클라우드 Simple & Easy Notification Service (SENS)

### 3. 에러 처리
- 이메일 실패해도 가입은 성공
- 로그로 실패 원인 확인
- 재시도 로직 없음 (수동 확인)

## ✅ 체크리스트

배포 전 확인:
- [ ] Gmail 앱 비밀번호 생성
- [ ] ecosystem.config.js에 환경 변수 추가
- [ ] 코드 pull 및 npm install
- [ ] TypeScript 빌드
- [ ] PM2 재시작
- [ ] 테스트 가입으로 이메일 수신 확인
- [ ] 로그 확인

---

**작성일**: 2026-03-05  
**작성자**: AI Assistant  
**관련 커밋**: d4fffab
