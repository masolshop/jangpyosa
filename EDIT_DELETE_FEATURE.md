# 영업 관리 수정/삭제 기능 가이드

## 📋 개요

슈퍼어드민이 영업 관리 페이지에서 본부/지사의 정보를 수정하고 삭제할 수 있는 기능이 추가되었습니다.

## ✨ 새로운 기능

### 1. 본부/지사 수정 기능
- **대상**: 본부장, 지사장
- **수정 가능 항목**: 이름, 전화번호, 이메일
- **접근 방법**: 
  - 본부 카드의 `✏️ 수정` 버튼 클릭
  - 지사 카드의 `✏️ 수정` 버튼 클릭

### 2. 본부/지사 삭제 기능
- **소프트 삭제**: 실제 데이터는 유지하고 비활성화 처리
- **제약 조건**: 하위 조직이 있는 경우 삭제 불가
- **접근 방법**:
  - 본부 카드의 `🗑️ 삭제` 버튼 클릭
  - 지사 카드의 `🗑️ 삭제` 버튼 클릭

### 3. 본부 정보 표시 개선
- **변경 전**: `추천: N명 | 매출: ₩XXX`
- **변경 후**: `지사 N개 | 소속매니저 N명`
- **표시 내용**:
  - 지사 개수: 해당 본부 하위의 지사장(BRANCH_MANAGER) 수
  - 소속 매니저: 해당 본부 하위의 일반 매니저(MANAGER) 수

## 🔧 API 엔드포인트

### PUT /sales/people/:id
**영업 사원 정보 수정**

**요청**:
```json
{
  "name": "홍길동",
  "phone": "01012345678",
  "email": "hong@example.com"
}
```

**응답**:
```json
{
  "success": true,
  "message": "정보가 수정되었습니다",
  "salesPerson": {
    "id": "...",
    "name": "홍길동",
    "phone": "01012345678",
    "email": "hong@example.com",
    ...
  }
}
```

**검증**:
- ✅ 이름, 전화번호 필수
- ✅ 전화번호 중복 체크 (자신 제외)
- ✅ User 테이블도 함께 업데이트

### DELETE /sales/people/:id
**영업 사원 삭제 (소프트 삭제)**

**응답**:
```json
{
  "success": true,
  "message": "삭제되었습니다"
}
```

**에러 (하위 조직 존재)**:
```json
{
  "error": "하위 조직이 있어 삭제할 수 없습니다. 먼저 하위 조직을 재배치하거나 삭제해주세요.",
  "subordinatesCount": 3
}
```

**처리 내용**:
- ✅ SalesPerson.isActive = false
- ✅ SalesPerson.inactiveReason = "슈퍼어드민에 의해 삭제됨"
- ✅ SalesActivityLog에 삭제 기록
- ⚠️ 하위 조직(subordinates)이 있으면 삭제 거부

## 📱 UI 설명

### 조직도 보기 - 본부 카드

```
┌─────────────────────────────────────────┐
│ 🏢 서울 본부                             │
│ 📞 01012345678 | ✉️ seoul@example.com   │
│ 지사 2개 | 소속매니저 5명                │
│                                         │
│ [✏️ 수정] [+ 지사 생성] [🗑️ 삭제]       │
└─────────────────────────────────────────┘
```

**버튼 설명**:
- `✏️ 수정`: 본부장 정보 수정 모달 열기
- `+ 지사 생성`: 하위 지사 생성 모달 열기
- `🗑️ 삭제`: 본부 삭제 (하위 조직 없을 때만)

### 조직도 보기 - 지사 카드

```
  ┌─────────────────────────────────────────┐
  │ 🏪 강남 지사                             │
  │ 📞 01087654321 | ✉️ gangnam@example.com │
  │ 추천: 10명 | 매출: ₩5,000,000           │
  │                                         │
  │ [✏️ 수정] [비활성화] [🗑️ 삭제]          │
  └─────────────────────────────────────────┘
```

**버튼 설명**:
- `✏️ 수정`: 지사장 정보 수정 모달 열기
- `비활성화/활성화`: 상태 토글
- `🗑️ 삭제`: 지사 삭제

### 수정 모달

```
┌──────────────────────────────────────┐
│ ✏️ 정보 수정                    [X]  │
│ 홍길동의 정보를 수정합니다.           │
│                                      │
│ 이름 *                               │
│ [홍길동                     ]        │
│                                      │
│ 전화번호 *                           │
│ [01012345678               ]        │
│                                      │
│ 이메일                               │
│ [hong@example.com          ]        │
│                                      │
│                      [취소] [수정]   │
└──────────────────────────────────────┘
```

## 🔒 보안 및 검증

### 수정 시 검증
1. **필수 입력**: 이름, 전화번호
2. **전화번호 중복**: 자신을 제외한 다른 사용자와 중복 불가
3. **User 테이블 동기화**: SalesPerson과 User 테이블 모두 업데이트

### 삭제 시 검증
1. **하위 조직 체크**: subordinates가 있으면 삭제 거부
2. **소프트 삭제**: 데이터는 유지, isActive만 false
3. **활동 로그**: 삭제 이력 자동 기록

## 📊 데이터베이스 변경

### SalesPerson 테이블
```sql
-- 수정 시
UPDATE SalesPerson SET
  name = '홍길동',
  phone = '01012345678',
  email = 'hong@example.com'
WHERE id = 'xxx';

-- 삭제 시
UPDATE SalesPerson SET
  isActive = false,
  inactiveReason = '슈퍼어드민에 의해 삭제됨'
WHERE id = 'xxx';
```

### User 테이블
```sql
-- 수정 시 User도 함께 업데이트
UPDATE User SET
  name = '홍길동',
  phone = '01012345678',
  email = 'hong@example.com'
WHERE id = 'userId';
```

### SalesActivityLog 테이블
```sql
-- 삭제 시 로그 기록
INSERT INTO SalesActivityLog (
  salesPersonId,
  adminUserId,
  action,
  fromValue,
  toValue,
  reason,
  notes
) VALUES (
  'xxx',
  'admin-id',
  'STATUS_CHANGE',
  'ACTIVE',
  'DELETED',
  '슈퍼어드민에 의해 삭제됨',
  '영업 사원 삭제: 홍길동'
);
```

## 🧪 테스트 시나리오

### 시나리오 1: 본부장 정보 수정
1. 슈퍼어드민으로 로그인 (01063529091 / admin123)
2. https://jangpyosa.com/admin/sales-management 접속
3. 조직도 보기 탭 선택
4. 본부 카드의 `✏️ 수정` 버튼 클릭
5. 이름, 전화번호, 이메일 수정
6. `수정` 버튼 클릭
7. ✅ 성공 메시지 표시
8. ✅ 카드 정보 즉시 업데이트

### 시나리오 2: 지사장 삭제 (성공)
1. 하위 조직이 없는 지사 카드 선택
2. `🗑️ 삭제` 버튼 클릭
3. 확인 다이얼로그 표시
4. `확인` 클릭
5. ✅ 삭제 성공 메시지
6. ✅ 해당 지사 카드 사라짐

### 시나리오 3: 본부장 삭제 (실패 - 하위 조직 존재)
1. 하위 지사가 있는 본부 카드 선택
2. `🗑️ 삭제` 버튼 클릭
3. 확인 다이얼로그 표시
4. `확인` 클릭
5. ❌ 에러 메시지: "하위 조직이 있어 삭제할 수 없습니다..."
6. ✅ 본부는 그대로 유지

### 시나리오 4: 전화번호 중복 체크
1. 지사장 수정 모달 열기
2. 다른 사용자가 사용 중인 전화번호 입력
3. `수정` 버튼 클릭
4. ❌ 에러 메시지: "이미 사용 중인 전화번호입니다"
5. ✅ 수정 실패

### 시나리오 5: 본부 정보 표시 확인
1. 조직도 보기에서 본부 카드 확인
2. ✅ `지사 2개 | 소속매니저 5명` 형식으로 표시
3. 지사 추가 후 새로고침
4. ✅ `지사 3개 | 소속매니저 5명`으로 업데이트

## 📝 관련 파일

### 백엔드
- `apps/api/src/routes/sales.ts`: API 엔드포인트 추가
  - PUT /sales/people/:id
  - DELETE /sales/people/:id

### 프론트엔드
- `apps/web/src/app/admin/sales-management/page.tsx`: UI 및 기능 구현
  - 수정 모달 추가
  - 수정/삭제 핸들러 추가
  - 본부 정보 표시 변경

## 🚀 배포 방법

### 서버에서 직접 배포
```bash
cd /home/ubuntu/jangpyosa
git pull origin main

# API 빌드
cd apps/api
npm run build

# Web 빌드
cd ../web
npm run build

# PM2 재시작
pm2 restart jangpyosa-api
pm2 restart jangpyosa-web
pm2 list
```

## 🌐 관련 URL

- **슈퍼어드민 로그인**: https://jangpyosa.com/admin/login
- **슈퍼어드민 대시보드**: https://jangpyosa.com/admin
- **영업 관리**: https://jangpyosa.com/admin/sales-management
- **매니저 로그인**: https://jangpyosa.com/admin/sales

## 📌 주의사항

1. **삭제는 소프트 삭제**: 데이터는 DB에 남아있고 isActive만 false로 변경
2. **하위 조직 체크**: 하위 조직이 있으면 삭제 불가
3. **User 테이블 동기화**: 수정 시 User 테이블도 함께 업데이트
4. **활동 로그**: 모든 변경 사항은 SalesActivityLog에 기록
5. **전화번호 형식**: 하이픈(-) 자동 제거하여 저장

## ✅ 완료된 항목

- ✅ PUT /sales/people/:id API 엔드포인트
- ✅ DELETE /sales/people/:id API 엔드포인트
- ✅ 수정 모달 UI (X 닫기 버튼 포함)
- ✅ 본부 카드에 수정/삭제 버튼
- ✅ 지사 카드에 수정/삭제 버튼
- ✅ 본부 정보 표시: 지사 N개 | 소속매니저 N명
- ✅ 전화번호 중복 체크
- ✅ 하위 조직 삭제 방지
- ✅ 활동 로그 기록
- ✅ User 테이블 동기화

## 🔄 커밋 정보

- **커밋 ID**: b5e35a9
- **메시지**: ✏️ 영업 관리 수정/삭제 기능 추가 및 본부 정보 표시 개선
- **변경 파일**: 3개 (449 insertions, 17 deletions)
