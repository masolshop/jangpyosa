# 🏖️ 휴가 관리 시스템 구현 완료 보고서

## 📋 구현 개요

장애인 직원이 휴가 신청 시 증빙서류를 **이메일로 전송**하도록 하는 시스템을 구축했습니다.
파일 업로드 서버 없이 이메일을 활용하여 비용 효율적인 솔루션을 제공합니다.

---

## ✅ 구현 완료 항목

### 1. 데이터베이스 스키마 추가

**`apps/api/prisma/schema.prisma`**

- **Company 모델**에 `attachmentEmail` 필드 추가
  - 첨부파일 수신용 이메일 주소 저장
  
- **LeaveType 모델** (새로 생성)
  - 휴가 유형 관리 (연차, 병가, 경조사 등)
  - 증빙서류 필요 여부 (`requiresDocument`)
  - 연간 최대 사용일수, 유급/무급 구분
  
- **LeaveRequest 모델** (새로 생성)
  - 직원의 휴가 신청 내역
  - 상태 관리 (PENDING, APPROVED, REJECTED, CANCELLED)
  - 증빙서류 전송 여부 (`documentSent`)

### 2. API 엔드포인트

**`apps/api/src/routes/leave.ts`** (신규 생성)

#### 휴가 유형 관리 (관리자용)
- `GET /api/leave/types` - 휴가 유형 목록 조회
- `POST /api/leave/types` - 휴가 유형 생성
- `PUT /api/leave/types/:id` - 휴가 유형 수정
- `DELETE /api/leave/types/:id` - 휴가 유형 삭제 (사용 중인 유형은 보호)

#### 휴가 신청 (직원용)
- `GET /api/leave/requests/my` - 내 휴가 신청 목록
- `POST /api/leave/requests` - 휴가 신청
- `PATCH /api/leave/requests/:id/cancel` - 휴가 신청 취소
- `PATCH /api/leave/requests/:id/document-sent` - 서류 전송 완료 표시

#### 휴가 승인/거부 (관리자용)
- `GET /api/leave/requests` - 전체 휴가 신청 목록
- `PATCH /api/leave/requests/:id/approve` - 휴가 승인
- `PATCH /api/leave/requests/:id/reject` - 휴가 거부

**`apps/api/src/routes/companies.ts`** (수정)
- 회사 정보 조회/수정 API에 `attachmentEmail` 필드 추가

### 3. 프론트엔드 페이지

#### 회사 설정 페이지
**`apps/web/src/app/dashboard/settings/page.tsx`** (신규)
- 첨부파일 전송용 이메일 설정 기능
- 이메일 형식 검증
- 설정 저장 및 업데이트

#### 휴가 관리 페이지 (관리자용)
**`apps/web/src/app/dashboard/leave/page.tsx`** (신규)
- **Tab 1: 휴가 유형 관리**
  - 휴가 유형 추가/수정/삭제
  - 증빙서류 필요 여부 설정
  - 카드 형식 UI
- **Tab 2: 휴가 신청 목록**
  - 전체 직원 휴가 신청 조회
  - 승인/거부 기능
  - 서류 전송 상태 확인

#### 휴가 신청 페이지 (직원용)
**`apps/web/src/app/employee/leave/page.tsx`** (신규)
- 휴가 신청 폼
  - 휴가 유형 선택
  - 날짜 선택 및 자동 일수 계산
  - 사유 입력
- 증빙서류 필요 시 **이메일 주소 자동 표시**
- 내 휴가 신청 내역 조회
- 서류 전송 완료 표시 버튼
- 신청 취소 기능

---

## 🎯 사용 흐름

### 관리자 (BUYER 계정)

1. **[설정] 첨부파일 이메일 등록**
   - `/dashboard/settings` 접속
   - 이메일 입력 (예: `files@company.com`)
   - 저장

2. **[휴가 관리] 휴가 유형 등록**
   - `/dashboard/leave` 접속
   - "휴가 유형 관리" 탭
   - 예: 병가 - "증빙서류 필요" 체크
   - 저장

3. **[휴가 관리] 신청 승인/거부**
   - "휴가 신청 목록" 탭
   - 직원 신청 확인
   - 승인 또는 거부 버튼 클릭

### 직원 (EMPLOYEE 계정)

1. **휴가 신청**
   - `/employee/leave` 접속
   - "휴가 신청하기" 클릭
   - 휴가 유형 선택 (병가 선택 시 이메일 주소 자동 표시)
   - 날짜 및 사유 입력
   - 신청하기 클릭

2. **증빙서류 전송** (필요 시)
   - 페이지에 표시된 이메일 주소 확인
   - 이메일로 진단서 등 전송
     - 제목: `[휴가증빙] 홍길동 - 병가 - 2026-02-25`
     - 첨부: 진단서.pdf
   - "전송완료 표시" 버튼 클릭

3. **신청 내역 확인**
   - 신청 상태 확인 (대기중/승인/거부)
   - 필요 시 취소 가능

---

## 💡 핵심 장점

### 🎯 비용 제로
- 파일 저장 서버 불필요
- 이메일로 모든 서류 관리
- S3 등 클라우드 스토리지 비용 절감

### 🔒 안전한 데이터 관리
- 사용 중인 휴가 유형은 삭제 방지
- 대기 중인 신청만 취소 가능
- 역할 기반 권한 제어 (BUYER/EMPLOYEE)

### 🎨 직관적 UI
- 카드 기반 휴가 유형 관리
- 상태별 색상 구분 (대기/승인/거부)
- 증빙서류 필요 시 이메일 자동 안내

### 🔄 자동화
- 날짜 선택 시 자동 일수 계산
- 증빙서류 필요 시 이메일 주소 자동 표시
- 휴가 유형별 서류 요구사항 자동 적용

---

## 📁 생성/수정된 파일

### Backend (API)
```
apps/api/
├── prisma/
│   └── schema.prisma           (수정) - LeaveType, LeaveRequest 모델 추가
├── src/
│   ├── routes/
│   │   ├── leave.ts           (신규) - 휴가 관리 API
│   │   └── companies.ts       (수정) - attachmentEmail 필드 추가
│   └── index.ts               (수정) - leave 라우터 등록
```

### Frontend (Web)
```
apps/web/src/app/
├── dashboard/
│   ├── settings/
│   │   └── page.tsx           (신규) - 회사 설정 페이지
│   └── leave/
│       └── page.tsx           (신규) - 휴가 관리 페이지 (관리자용)
└── employee/
    └── leave/
        └── page.tsx           (신규) - 휴가 신청 페이지 (직원용)
```

---

## 🚀 배포 가이드

### 1. 데이터베이스 마이그레이션
```bash
cd apps/api
npx prisma@5.20.0 db push --accept-data-loss
npx prisma generate
```

### 2. API 서버 재시작
```bash
# 로컬
npm run build
npm run start

# 프로덕션 (PM2)
cd /home/ubuntu/jangpyosa/apps/api
npm install
npm run build
pm2 restart jangpyosa-api
```

### 3. 웹 서버 재빌드
```bash
# 로컬
cd apps/web
npm run build
npm run start

# 프로덕션 (PM2)
cd /home/ubuntu/jangpyosa/apps/web
npm install
rm -rf .next
npm run build
pm2 restart jangpyosa-web
```

### 4. 사이드바 메뉴 추가 (선택)
`apps/web/src/components/Sidebar.tsx`에 메뉴 링크 추가:
```tsx
// 관리자 메뉴에 추가
<Link href="/dashboard/settings">⚙️ 회사 설정</Link>
<Link href="/dashboard/leave">🏖️ 휴가 관리</Link>

// 직원 메뉴에 추가
<Link href="/employee/leave">🏖️ 휴가 신청</Link>
```

---

## 🧪 테스트 시나리오

### 테스트 계정
- **관리자**: `buyer02` / `test1234`
- **직원**: `010-1001-0001` / `employee123`

### 테스트 순서

1. **관리자 로그인** (`buyer02`)
   - `/dashboard/settings` → 이메일 설정 (`files@company.com`)
   - `/dashboard/leave` → 휴가 유형 추가
     - 연차 (증빙 불필요)
     - 병가 (증빙 필요 체크)

2. **직원 로그인** (`010-1001-0001`)
   - `/employee/leave` → 병가 신청
   - 이메일 주소 확인 (`files@company.com` 표시 확인)
   - 신청 완료

3. **관리자 승인**
   - `/dashboard/leave` → "휴가 신청 목록" 탭
   - 직원 신청 확인 및 승인

4. **직원 서류 전송**
   - `/employee/leave` → 신청 내역에서 "전송완료 표시" 클릭
   - 실제로는 이메일로 진단서 전송

---

## 📝 사용 예시

### 병가 신청 시
1. 직원: 병가 선택 → 날짜 입력 → 신청
2. 직원: 페이지에 표시된 이메일로 진단서 전송
3. 직원: "전송완료 표시" 버튼 클릭
4. 관리자: 이메일로 진단서 확인 후 승인

### 연차 신청 시
1. 직원: 연차 선택 → 날짜 입력 → 신청
2. 관리자: 바로 승인 (증빙 불필요)

---

## ⚠️ 주의사항

1. **이메일 설정 필수**
   - 증빙서류 필요한 휴가 유형 사용 시 이메일 설정 필요
   - 설정하지 않으면 경고 메시지 표시

2. **휴가 유형 삭제**
   - 사용 중인 휴가 유형은 삭제 불가
   - 삭제 시도 시 에러 메시지와 사용 건수 표시

3. **권한 제어**
   - BUYER, SUPER_ADMIN만 휴가 유형 관리 및 승인 가능
   - EMPLOYEE만 휴가 신청 가능

---

## 🎉 완료!

모든 기능이 구현되어 즉시 사용 가능합니다.
추가 요청사항이나 수정이 필요하면 알려주세요! 🚀
