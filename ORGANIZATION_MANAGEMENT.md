# 영업 관리 페이지 - 본부/지사 생성 기능

## 📋 개요

슈퍼어드민이 본부와 지사를 생성하고 조직도 형태로 관리할 수 있는 기능이 추가되었습니다.

## 🔗 URL

- **영업 관리 페이지**: https://jangpyosa.com/admin/sales-management
- **슈퍼어드민 로그인**: https://jangpyosa.com/admin/login (ID: 01063529091, PW: admin123)

## ✨ 새로운 기능

### 1. 조직도 보기 모드
**전환 버튼**:
- 📋 **목록 보기**: 전체 영업 인원을 테이블로 표시
- 🏢 **조직도 보기**: 본부 → 지사 계층 구조로 표시

### 2. 본부 생성
**위치**: 페이지 상단 "**+ 본부 생성**" 버튼 (빨간색)

**생성 프로세스**:
1. "+ 본부 생성" 버튼 클릭
2. 모달 창 표시
3. 정보 입력:
   - 이름 * (필수)
   - 전화번호 * (필수, 예: 01012345678 또는 010-1234-5678)
   - 이메일 (선택)
   - 비밀번호 * (필수, 최소 6자)
4. "생성" 버튼 클릭
5. 본부장(HEAD_MANAGER) 생성 완료

**자동 처리**:
- User 계정 생성 (role: EMPLOYEE)
- SalesPerson 레코드 생성 (role: HEAD_MANAGER)
- 추천인 코드 및 링크 자동 생성
- 비밀번호 bcrypt 해싱
- 활동 로그 자동 기록

### 3. 지사 생성
**위치**: 조직도 보기에서 각 본부 카드의 "**+ 지사 생성**" 버튼 (주황색)

**생성 프로세스**:
1. 본부 카드에서 "+ 지사 생성" 버튼 클릭
2. 모달 창 표시 (소속 본부 자동 선택됨)
3. 정보 입력:
   - 소속 본부 * (자동 선택, 변경 가능)
   - 이름 * (필수)
   - 전화번호 * (필수)
   - 이메일 (선택)
   - 비밀번호 * (필수, 최소 6자)
4. "생성" 버튼 클릭
5. 지사장(BRANCH_MANAGER) 생성 완료

**자동 처리**:
- User 계정 생성 (role: EMPLOYEE)
- SalesPerson 레코드 생성 (role: BRANCH_MANAGER, managerId 설정)
- 상위 본부와 연결
- 추천인 코드 및 링크 자동 생성
- 비밀번호 bcrypt 해싱
- 활동 로그 자동 기록

## 🎨 조직도 UI

### 본부 카드 (빨간 배경)
```
🏢 홍길동 본부                           [+ 지사 생성]
📞 01012345678 | ✉️ hong@example.com
추천: 5명 | 매출: ₩10,000,000
```

### 지사 카드 (주황 배경)
```
  🏪 김철수 지사                         [비활성화]
  📞 01098765432 | ✉️ kim@example.com
  추천: 3명 | 매출: ₩5,000,000 | 커미션: ₩500,000
```

### 빈 상태 메시지
```
아직 본부가 없습니다. "+ 본부 생성" 버튼을 눌러 본부를 추가하세요.
```

```
아직 지사가 없습니다. "+ 지사 생성" 버튼을 눌러 지사를 추가하세요.
```

## 🔧 API 엔드포인트

### POST /sales/people/create
본부/지사 생성 (User + SalesPerson 동시 생성)

**권한**: SUPER_ADMIN

**Request Body**:
```json
{
  "name": "홍길동",
  "phone": "01012345678",
  "email": "hong@example.com",
  "password": "password123",
  "role": "HEAD_MANAGER",
  "managerId": null
}
```

**지사 생성 시**:
```json
{
  "name": "김철수",
  "phone": "01098765432",
  "email": "kim@example.com",
  "password": "password123",
  "role": "BRANCH_MANAGER",
  "managerId": "본부장_ID"
}
```

**Response**:
```json
{
  "success": true,
  "salesPerson": {
    "id": "...",
    "userId": "...",
    "name": "홍길동",
    "phone": "01012345678",
    "email": "hong@example.com",
    "role": "HEAD_MANAGER",
    "managerId": null,
    "manager": null,
    "referralCode": "1012345678",
    "referralLink": "https://jangpyosa.com/01012345678",
    "totalReferrals": 0,
    "activeReferrals": 0,
    "totalRevenue": 0,
    "commission": 0,
    "isActive": true,
    "createdAt": "2026-03-01T..."
  },
  "message": "본부장 생성이 완료되었습니다"
}
```

**자동 처리 사항**:
1. 전화번호 정규화 (하이픈, 공백 제거)
2. User 테이블에 계정 생성 (role: EMPLOYEE)
3. SalesPerson 테이블에 영업 사원 생성
4. 비밀번호 bcryptjs 해싱
5. 추천인 코드 생성 (전화번호 기반)
6. 추천인 링크 생성
7. SalesActivityLog 기록

**에러 응답**:
- 400: 이미 등록된 핸드폰번호
- 400: 비밀번호 6자 미만
- 400: 존재하지 않는 상위 관리자
- 500: 서버 에러

## 🧪 테스트 시나리오

### ✅ 시나리오 1: 본부 생성
1. 슈퍼어드민 로그인 (01063529091 / admin123)
2. 영업 관리 페이지 접속
3. "🏢 조직도 보기" 탭 클릭
4. "+ 본부 생성" 버튼 클릭
5. 정보 입력:
   - 이름: 서울본부
   - 전화번호: 01011112222
   - 이메일: seoul@jangpyosa.com
   - 비밀번호: seoul123
6. "생성" 버튼 클릭
7. 성공 메시지 확인
8. 조직도에 "🏢 서울본부 본부" 카드 표시

### ✅ 시나리오 2: 지사 생성
1. 조직도 보기에서 "서울본부" 찾기
2. 본부 카드의 "+ 지사 생성" 버튼 클릭
3. 모달에서 "소속 본부"가 "서울본부 본부"로 자동 선택됨 확인
4. 정보 입력:
   - 이름: 강남지사
   - 전화번호: 01033334444
   - 이메일: gangnam@jangpyosa.com
   - 비밀번호: gangnam123
5. "생성" 버튼 클릭
6. 성공 메시지 확인
7. 서울본부 하위에 "🏪 강남지사 지사" 카드 표시

### ✅ 시나리오 3: 여러 지사 생성
1. 같은 본부에 여러 지사 추가:
   - 강남지사
   - 강북지사
   - 강서지사
2. 조직도에서 계층 구조 확인:
   ```
   🏢 서울본부 본부
     🏪 강남지사 지사
     🏪 강북지사 지사
     🏪 강서지사 지사
   ```

### ✅ 시나리오 4: 여러 본부 생성
1. 본부 여러 개 생성:
   - 서울본부
   - 부산본부
   - 대구본부
2. 각 본부마다 지사 추가
3. 조직도에서 전체 구조 확인

### ✅ 시나리오 5: 생성된 계정으로 로그인
1. 로그아웃
2. 매니저 로그인 페이지 접속: https://jangpyosa.com/admin/sales
3. 생성한 계정으로 로그인:
   - ID: 01011112222
   - PW: seoul123
4. 매니저 대시보드 접속 확인

## 📊 데이터 흐름

### 본부 생성 시
```
슈퍼어드민
  ↓
[+ 본부 생성 버튼]
  ↓
[모달: 이름, 전화번호, 이메일, 비밀번호]
  ↓
POST /sales/people/create
  ↓
┌─────────────────────────────┐
│ 1. User 생성                 │
│    - role: EMPLOYEE          │
│    - passwordHash: bcrypt    │
│ 2. SalesPerson 생성          │
│    - role: HEAD_MANAGER      │
│    - managerId: null         │
│ 3. 추천 링크 생성            │
│ 4. 활동 로그 기록            │
└─────────────────────────────┘
  ↓
본부장 생성 완료
  ↓
조직도에 표시
```

### 지사 생성 시
```
슈퍼어드민
  ↓
[본부 카드 → + 지사 생성 버튼]
  ↓
[모달: 소속 본부(자동), 이름, 전화번호, 이메일, 비밀번호]
  ↓
POST /sales/people/create
  ↓
┌─────────────────────────────┐
│ 1. User 생성                 │
│    - role: EMPLOYEE          │
│    - passwordHash: bcrypt    │
│ 2. SalesPerson 생성          │
│    - role: BRANCH_MANAGER    │
│    - managerId: 본부장 ID    │
│ 3. 추천 링크 생성            │
│ 4. 활동 로그 기록            │
└─────────────────────────────┘
  ↓
지사장 생성 완료
  ↓
본부 하위에 표시
```

## 🔐 보안 사항

1. **비밀번호 해싱**: bcryptjs로 안전하게 해싱 (salt rounds: 10)
2. **전화번호 중복 체크**: User와 SalesPerson 테이블 모두 확인
3. **권한 체크**: requireAuth, requireRole('SUPER_ADMIN')
4. **입력 검증**:
   - 필수 필드 확인 (이름, 전화번호, 비밀번호)
   - 비밀번호 최소 길이 (6자)
   - managerId 유효성 확인
5. **SQL 인젝션 방지**: Prisma ORM 사용

## 📁 관련 파일

**프론트엔드**:
- `/apps/web/src/app/admin/sales-management/page.tsx`
  - 조직도 보기 모드 추가
  - 본부/지사 생성 모달
  - 계층 구조 UI

**백엔드**:
- `/apps/api/src/routes/sales.ts`
  - POST /sales/people/create 엔드포인트
  - bcryptjs import
  - User + SalesPerson 동시 생성 로직

## 🚀 배포 정보

**커밋**: 9f05ef0 - "🏢 본부/지사 생성 기능 추가"

**변경 사항**:
- 3 files changed
- 739 insertions
- 179 deletions

**PM2 재시작**:
- jangpyosa-api: 37번째 재시작
- jangpyosa-web: 36번째 재시작

## 📝 주요 특징

1. **User + SalesPerson 동시 생성**: 하나의 API 호출로 모든 필요한 데이터 생성
2. **자동 계층 연결**: managerId를 통해 본부-지사 관계 자동 설정
3. **추천 링크 자동 생성**: 전화번호 기반 고유 추천 링크
4. **활동 로그 기록**: 모든 생성 활동 자동 기록
5. **실시간 업데이트**: 생성 후 즉시 목록 새로고침
6. **사용자 친화적 UI**: 모달, 버튼 색상, 계층 구조 시각화

## 🎉 결과

**슈퍼어드민이 영업 관리 페이지에서:**
1. ✅ 본부를 생성할 수 있습니다
2. ✅ 각 본부 하위에 지사를 생성할 수 있습니다
3. ✅ 조직도 형태로 계층 구조를 확인할 수 있습니다
4. ✅ 생성된 계정으로 즉시 로그인 가능합니다

**테스트**: 지금 https://jangpyosa.com/admin/sales-management 에서 확인해보세요!
- ID: `01063529091`
- PW: `admin123`
- "🏢 조직도 보기" 탭 → "+ 본부 생성" 버튼
