# 배포 완료 요약 - 본부장 지사 관리 UI 추가

## 📅 배포 일시
- **날짜**: 2026-03-02
- **커밋**: 80026a9
- **브랜치**: main

## ✨ 구현된 기능

### 1. 본부장 대시보드에 지사 관리 버튼 추가

본부 대시보드 상단에 3개의 관리 버튼이 추가되었습니다:

#### 🏢 지사 생성
- 새로운 지사를 생성할 수 있는 모달 폼
- 입력 필드:
  - 지사명
  - 지사장 이름
  - 전화번호 (하이픈 자동 포맷팅)
  - 이메일
  - 메모
- POST `/api/sales/branches` API 호출

#### ✏️ 지사 수정
- 기존 지사 정보를 수정할 수 있는 모달 폼
- 지사 선택 드롭다운에서 수정할 지사 선택
- 기존 정보가 자동으로 입력됨
- PATCH `/api/sales/branches/:id` API 호출

#### 🗑️ 지사 삭제
- 지사 삭제 확인 모달
- 지사 선택 드롭다운
- 삭제 전 확인 메시지
- 매니저가 소속된 지사는 삭제 불가 (서버에서 검증)
- DELETE `/api/sales/branches/:id` API 호출

### 2. 기존 기능 (이전에 구현됨)

#### 📊 지사별 매니저 목록
- 지사 행 클릭 시 해당 지사 소속 매니저 리스트 표시
- 매니저별 추천 기업 통계:
  - 민간기업 수
  - 공공기관 수
  - 정부교육기관 수
  - 합계

#### 🔄 매니저 지사 이동
- API: PATCH `/api/sales/managers/:id/transfer`
- Body: `{ "targetBranchId": "지사ID" }`
- 본부 내에서만 이동 가능

## 🔐 권한 체계

### HEAD_MANAGER (본부장)
✅ 지사 생성/수정/삭제  
✅ 소속 본부의 지사 관리  
✅ 본부 소속 매니저 지사 이동  
✅ 지사별 매니저 목록 및 통계 조회  
❌ 다른 본부의 지사/매니저 관리 불가

### BRANCH_MANAGER (지사장)
✅ 소속 지사 매니저 목록 조회  
✅ 소속 지사 통계 조회  
❌ 지사 생성/수정/삭제 불가  
❌ 매니저 지사 이동 불가

### MANAGER (매니저)
✅ 본인의 추천 기업 관리  
✅ 본인의 추천 링크 공유  
❌ 지사 관리 불가  
❌ 다른 매니저 정보 조회 불가

## 📝 테스트 계정

| 역할 | 아이디 | 비밀번호 | 로그인 URL |
|------|--------|----------|------------|
| 슈퍼어드민 | 01063529091 | 01063529091 | https://jangpyosa.com/admin/login |
| 본부장 (김본부) | 01011112222 | test1234 | https://jangpyosa.com/admin/sales |
| 지사장 (박지사) | 01022223333 | test1234 | https://jangpyosa.com/admin/sales |
| 매니저 (이매니저) | 01033334444 | test1234 | https://jangpyosa.com/admin/sales |

## 🎯 테스트 시나리오

### 1. 본부장 로그인 (01011112222 / test1234)
1. ✅ 본부 대시보드 접근
2. ✅ 상단에 "지사 생성", "지사 수정", "지사 삭제" 버튼 확인
3. ✅ 지사 생성 버튼 클릭 → 폼 입력 → 지사 생성
4. ✅ 지사 수정 버튼 클릭 → 지사 선택 → 정보 수정
5. ✅ 지사 행 클릭 → 소속 매니저 목록 및 통계 확인
6. ✅ 지사 삭제 버튼 클릭 → 지사 선택 → 삭제 확인

### 2. 지사장 로그인 (01022223333 / test1234)
1. ✅ 지사 대시보드 접근
2. ❌ 지사 생성/수정/삭제 버튼 없음 (권한 없음)
3. ✅ 소속 지사 매니저 목록 및 통계 조회 가능

### 3. 매니저 로그인 (01033334444 / test1234)
1. ✅ 매니저 대시보드 접근
2. ✅ 본인의 추천 기업 관리
3. ❌ 지사 관리 기능 없음

## 🌐 API 엔드포인트

### 지사 관리
```bash
# 지사 생성
POST /api/sales/branches
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "강남지사",
  "leaderName": "박지사",
  "phone": "010-2222-3333",
  "email": "branch@test.com",
  "notes": "메모"
}

# 지사 수정
PATCH /api/sales/branches/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "수정된 지사명",
  "leaderName": "수정된 지사장명",
  "phone": "010-2222-3333",
  "email": "updated@test.com"
}

# 지사 삭제
DELETE /api/sales/branches/:id
Authorization: Bearer {token}

# 지사별 매니저 목록 조회
GET /api/sales/branches/:id/managers
Authorization: Bearer {token}
```

### 매니저 이동
```bash
# 매니저 지사 이동
PATCH /api/sales/managers/:id/transfer
Authorization: Bearer {token}
Content-Type: application/json

{
  "targetBranchId": "지사ID"
}
```

## 📦 변경된 파일

### Frontend (apps/web)
```
apps/web/src/app/admin/sales/dashboard/page.tsx
  - HeadquartersDashboard 컴포넌트에 지사 관리 버튼 3개 추가
  - 지사 생성 모달 구현
  - 지사 수정 모달 구현
  - 지사 삭제 모달 구현
  - 각 모달에 대한 상태 관리 추가
  - API 호출 로직 추가
```

### Backend (apps/api)
```
apps/api/src/routes/sales.ts
  - POST /sales/branches (지사 생성) - 이미 구현됨
  - PATCH /sales/branches/:id (지사 수정) - 이미 구현됨
  - DELETE /sales/branches/:id (지사 삭제) - 이미 구현됨
  - GET /sales/branches/:id/managers (지사별 매니저 조회) - 이미 구현됨
  - PATCH /sales/managers/:id/transfer (매니저 이동) - 이미 구현됨
```

## 🚀 배포 상태

### GitHub
- ✅ 커밋 완료: 80026a9
- ✅ 푸시 완료: main 브랜치

### 서버 배포
**⚠️ 주의**: SSH 연결 문제로 자동 배포가 실패했습니다.

#### 수동 배포 필요
서버 관리자가 다음 명령어로 수동 배포를 수행해야 합니다:

```bash
# SSH 접속
ssh -i ~/.ssh/jangpyosa.pem ubuntu@jangpyosa.com

# 프로젝트 디렉토리로 이동
cd ~/jangpyosa

# 최신 코드 가져오기
git fetch origin main
git reset --hard origin/main

# 의존성 설치 (필요시)
cd apps/web
npm install

# Next.js 빌드
npm run build

# PM2로 웹 서비스 재시작
cd ~/jangpyosa
pm2 restart jangpyosa-web

# 서비스 상태 확인
pm2 status
pm2 logs jangpyosa-web --nostream
```

## ✅ 완료 체크리스트

- [x] 지사 생성 버튼 및 모달 구현
- [x] 지사 수정 버튼 및 모달 구현
- [x] 지사 삭제 버튼 및 모달 구현
- [x] 전화번호 자동 하이픈 포맷팅
- [x] API 연동 및 에러 처리
- [x] 권한 검증 (HEAD_MANAGER만 접근 가능)
- [x] 코드 커밋 및 GitHub 푸시
- [ ] 서버 배포 (수동 배포 필요)
- [ ] 실제 환경에서 테스트

## 🔍 이슈 및 해결

### 문제: 본부장 대시보드에 지사 관리 메뉴가 안 보임
**원인**: UI에 버튼이 구현되지 않았음  
**해결**: HeadquartersDashboard 컴포넌트에 3개 버튼 추가

### 문제: SSH 연결 실패로 자동 배포 불가
**원인**: SSH 키 인증 문제  
**해결**: 수동 배포 가이드 제공

## 📞 문의사항

배포 후 문제가 발생하면 다음을 확인해주세요:

1. **버튼이 안 보이는 경우**
   - 브라우저 캐시 클리어 (Ctrl + Shift + R)
   - 로그인한 계정이 HEAD_MANAGER 역할인지 확인
   - 콘솔 에러 확인

2. **API 에러가 발생하는 경우**
   - 네트워크 탭에서 API 응답 확인
   - 서버 로그 확인: `pm2 logs jangpyosa-api`
   - 토큰 만료 여부 확인 (다시 로그인)

3. **지사 삭제가 안 되는 경우**
   - 해당 지사에 소속 매니저가 있는지 확인
   - 매니저를 다른 지사로 이동 후 삭제

## 🎉 완료!

본부장 권한에 지사 관리 기능(생성/수정/삭제)이 성공적으로 추가되었습니다.
서버 관리자가 수동 배포를 완료하면 즉시 사용 가능합니다.
