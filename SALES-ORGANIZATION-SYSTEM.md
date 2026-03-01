# 영업 조직 관리 시스템 구현 완료

## 📋 구현 개요

**날짜**: 2026년 3월 1일  
**기능**: 영업 조직 관리, 추천인 시스템, 역할별 대시보드

---

## 🎯 주요 기능

### 1️⃣ 영업 조직 계층 구조
- **매니저** (MANAGER): 기본 영업 사원
- **지사장** (BRANCH_MANAGER): 매니저에서 등업
- **본부장** (HEAD_MANAGER): 지사장에서 등업

**특징**:
- 모든 사람은 매니저로 시작
- 슈퍼어드민이 등업/이동/삭제 권한 보유
- 계층 구조 자동 관리 (상위 관리자 - 하위 직원)

### 2️⃣ 추천인 링크 시스템
- **개인화 링크**: `https://jangpyosa.com/{핸드폰번호}`
- **자동 추천인 등록**: 링크를 통한 기업 가입 시 자동 연결
- **추천 고객 리스트**: 매니저별 추천 고객 관리

### 3️⃣ 역할별 대시보드
- **본부장 대시보드**: 전체 조직 현황 및 실적
- **지사장 대시보드**: 관할 매니저 및 고객 현황
- **매니저 대시보드**: 개인 실적 및 추천 고객

---

## 📦 데이터베이스 스키마

### SalesPerson (영업 사원)
```prisma
model SalesPerson {
  id                String    @id @default(cuid())
  userId            String    @unique // User ID (로그인 계정)
  name              String    // 이름
  phone             String    @unique // 핸드폰번호
  email             String?   // 이메일
  
  // 영업 역할
  role              String    @default("MANAGER") 
  // MANAGER, BRANCH_MANAGER, HEAD_MANAGER
  
  // 조직 계층
  managerId         String?   // 상위 관리자 ID
  manager           SalesPerson?  @relation("SalesHierarchy")
  subordinates      SalesPerson[] @relation("SalesHierarchy")
  
  // 추천인 정보
  referralCode      String    @unique // 추천인 코드 (핸드폰번호)
  referralLink      String    // 추천인 링크
  
  // 실적 통계
  totalReferrals    Int       @default(0) // 총 추천 고객
  activeReferrals   Int       @default(0) // 활성 고객 (결제 고객)
  totalRevenue      Float     @default(0) // 총 매출
  commission        Float     @default(0) // 수수료
  
  // 등업 정보
  promotedAt        DateTime? // 등업 날짜
  promotedBy        String?   // 등업 승인자 ID
  
  // 상태
  isActive          Boolean   @default(true)
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // 추천 고객들
  referredCompanies CompanyReferral[]
}
```

### CompanyReferral (기업 추천 기록)
```prisma
model CompanyReferral {
  id                String    @id @default(cuid())
  companyId         String    // 가입한 기업 ID
  salesPersonId     String    // 추천한 영업사원 ID
  
  // 추천 정보
  referralCode      String    // 사용된 추천인 코드
  referralSource    String?   // 추천 경로
  
  // 기업 정보
  companyName       String    // 기업명
  companyBizNo      String    // 사업자등록번호
  companyType       String    // BUYER, SUPPLIER
  
  // 상태
  isActive          Boolean   @default(true)
  firstPaymentDate  DateTime? // 첫 결제일
  lastPaymentDate   DateTime? // 마지막 결제일
  
  // 실적
  totalPayments     Float     @default(0)
  totalCommission   Float     @default(0)
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  salesPerson       SalesPerson @relation(...)
}
```

### SalesActivityLog (영업 활동 로그)
```prisma
model SalesActivityLog {
  id                String    @id @default(cuid())
  salesPersonId     String?   // 영업사원 ID
  adminUserId       String?   // 관리자 ID
  
  // 활동 정보
  action            String    
  // PROMOTION, DEMOTION, TRANSFER, STATUS_CHANGE, REFERRAL_ADDED
  
  targetId          String?   // 대상 ID
  fromValue         String?   // 변경 전 값
  toValue           String?   // 변경 후 값
  reason            String?   // 사유
  notes             String?   // 메모
  
  createdAt         DateTime  @default(now())
}
```

---

## 🔌 API 엔드포인트

### 영업 사원 관리 (`/sales`)

#### 1. GET /sales/people
영업 사원 목록 조회
- **권한**: SUPER_ADMIN
- **Query**: role, managerId, isActive, search
- **응답**: salesPeople[]

#### 2. GET /sales/people/:id
영업 사원 상세 조회
- **권한**: 로그인 사용자
- **응답**: salesPerson (with manager, subordinates, referredCompanies)

#### 3. POST /sales/people
영업 사원 등록
- **권한**: SUPER_ADMIN
- **Body**: userId, name, phone, email, role, managerId
- **응답**: salesPerson

#### 4. PUT /sales/people/:id
영업 사원 정보 수정
- **권한**: SUPER_ADMIN
- **Body**: name, phone, email, isActive, inactiveReason, notes
- **응답**: salesPerson

#### 5. POST /sales/people/:id/promote
영업 사원 등업
- **권한**: SUPER_ADMIN
- **Body**: newRole, reason
- **등업 경로**: MANAGER → BRANCH_MANAGER → HEAD_MANAGER
- **응답**: salesPerson

#### 6. POST /sales/people/:id/transfer
영업 사원 조직 이동
- **권한**: SUPER_ADMIN
- **Body**: newManagerId, reason
- **응답**: salesPerson

#### 7. DELETE /sales/people/:id
영업 사원 삭제
- **권한**: SUPER_ADMIN
- **조건**: 하위 직원이 없어야 함
- **응답**: success

#### 8. GET /sales/organization
조직도 조회 (계층 구조)
- **권한**: 로그인 사용자
- **응답**: organization[] (계층적 구조)

#### 9. GET /sales/stats
영업 통계
- **권한**: SUPER_ADMIN
- **응답**: 
  - totalSalesPeople: 전체 영업 사원 수
  - activeSalesPeople: 활성 영업 사원 수
  - countByRole: 역할별 인원 수
  - totalReferrals: 총 추천 고객 수
  - activeReferrals: 활성 추천 고객 수
  - totalRevenue: 총 매출
  - totalCommission: 총 수수료

#### 10. GET /sales/activity-logs
활동 로그 조회
- **권한**: SUPER_ADMIN
- **Query**: salesPersonId, action, limit
- **응답**: logs[]

#### 11. GET /sales/my-info
내 영업 사원 정보 조회
- **권한**: 로그인 사용자
- **응답**: salesPerson (현재 로그인한 사용자의 영업 정보)

---

### 추천인 링크 관리 (`/referral`)

#### 1. GET /referral/validate/:code
추천인 코드 검증
- **권한**: 없음 (공개)
- **Params**: code (핸드폰번호)
- **응답**: isValid, salesPerson

#### 2. POST /referral/register
추천인 링크를 통한 기업 등록
- **권한**: 없음 (회원가입 시 자동 호출)
- **Body**: companyId, referralCode, referralSource
- **응답**: companyReferral

#### 3. GET /referral/companies/:salesPersonId
영업 사원의 추천 고객 목록
- **권한**: 로그인 사용자
- **Query**: isActive
- **응답**: companies[]

#### 4. PUT /referral/:id/activate
추천 고객 활성화 (첫 결제 시)
- **권한**: 시스템 (결제 시스템에서 자동 호출)
- **Body**: paymentAmount, commission
- **응답**: companyReferral

#### 5. POST /referral/payment
추천 고객 결제 기록
- **권한**: 시스템 (결제 시스템에서 자동 호출)
- **Body**: companyId, salesPersonId, paymentAmount, commission
- **응답**: companyReferral

---

## 💻 프론트엔드 페이지

### 1. /admin/sales
영업 조직 관리 페이지 (슈퍼어드민 전용)

**기능**:
- ✅ 영업 사원 목록 조회 (테이블 형식)
- ✅ 역할, 상태, 검색 필터
- ✅ 영업 사원 등록 (모달)
- ✅ 등업 기능 (MANAGER → BRANCH_MANAGER → HEAD_MANAGER)
- ✅ 조직 이동 (상위 관리자 변경)
- ✅ 영업 사원 삭제

**테이블 컬럼**:
- 이름, 핸드폰
- 역할 (매니저/지사장/본부장)
- 상위 관리자
- 하위 직원 수
- 추천 고객 수 (활성/전체)
- 실적 (매출, 수수료)
- 상태 (활성/비활성)
- 관리 버튼 (등업, 이동, 삭제)

### 2. 역할별 대시보드 (개발 예정)
- /dashboard/sales/head-manager (본부장 대시보드)
- /dashboard/sales/branch-manager (지사장 대시보드)
- /dashboard/sales/manager (매니저 대시보드)

---

## 🔄 추천인 링크 플로우

### 1. 영업 사원 등록
```
1. 슈퍼어드민이 /admin/sales에서 영업 사원 등록
2. 핸드폰번호 입력 (예: 01012345678)
3. 자동으로 추천인 코드 생성 (핸드폰번호에서 - 제거)
4. 추천인 링크 생성: https://jangpyosa.com/01012345678
```

### 2. 추천인 링크를 통한 기업 가입
```
1. 잠재 고객이 https://jangpyosa.com/01012345678 접속
2. 프론트엔드에서 URL 파라미터 읽기
3. GET /referral/validate/01012345678 호출 (추천인 검증)
4. 기업 회원가입 폼에 추천인 정보 표시
5. 회원가입 완료 후 POST /referral/register 호출
6. CompanyReferral 레코드 생성
7. SalesPerson.totalReferrals 증가
```

### 3. 첫 결제 시 활성화
```
1. 추천 고객이 첫 결제 진행
2. 결제 시스템에서 PUT /referral/:id/activate 호출
3. CompanyReferral.isActive = true
4. SalesPerson.activeReferrals 증가
5. 실적 통계 업데이트 (totalRevenue, commission)
```

---

## 📊 실적 집계 로직

### 영업 사원 실적
- **totalReferrals**: 추천으로 가입한 전체 기업 수
- **activeReferrals**: 결제가 발생한 활성 기업 수
- **totalRevenue**: 추천 고객들의 총 결제 금액 합계
- **commission**: 수수료 총액 (결제 금액의 일정 비율)

### 계층별 집계 (예정)
- 본부장: 자신 + 모든 하위 지사장 + 모든 매니저의 실적 합계
- 지사장: 자신 + 모든 하위 매니저의 실적 합계
- 매니저: 자신의 실적만

---

## 🔐 권한 체계

### SUPER_ADMIN
- ✅ 영업 사원 등록/수정/삭제
- ✅ 등업 승인
- ✅ 조직 이동
- ✅ 전체 통계 조회
- ✅ 활동 로그 조회

### HEAD_MANAGER (본부장)
- ⏳ 자신의 하위 조직 조회
- ⏳ 실적 대시보드 조회
- ⏳ 하위 직원 추천 고객 조회

### BRANCH_MANAGER (지사장)
- ⏳ 자신의 하위 매니저 조회
- ⏳ 실적 대시보드 조회
- ⏳ 하위 매니저 추천 고객 조회

### MANAGER (매니저)
- ✅ 자신의 영업 정보 조회
- ✅ 자신의 추천 고객 조회
- ⏳ 개인 실적 대시보드 조회

---

## 🚀 다음 단계

### Phase 1: 대시보드 구현 (우선)
- [ ] 본부장 대시보드 페이지
- [ ] 지사장 대시보드 페이지
- [ ] 매니저 대시보드 페이지
- [ ] 실적 차트 및 그래프
- [ ] 추천 고객 상세 정보

### Phase 2: 추천인 링크 프론트엔드 통합
- [ ] 회원가입 페이지에 추천인 코드 입력 필드 추가
- [ ] URL 파라미터로 자동 추천인 설정
- [ ] 추천인 정보 표시 UI

### Phase 3: 결제 시스템 연동
- [ ] 첫 결제 시 추천인 활성화 자동 호출
- [ ] 추가 결제 시 실적 자동 업데이트
- [ ] 수수료 자동 계산 및 기록

### Phase 4: 고급 기능
- [ ] 실적 순위 (리더보드)
- [ ] 월별/분기별 실적 리포트
- [ ] 수수료 정산 기능
- [ ] 목표 설정 및 달성률 추적

---

## 📁 생성된 파일

### Backend (API)
1. `apps/api/prisma/schema.prisma` - 데이터베이스 스키마 추가
   - SalesPerson 모델
   - CompanyReferral 모델
   - SalesActivityLog 모델

2. `apps/api/src/routes/sales.ts` - 영업 조직 관리 API
   - 11개 엔드포인트 구현

3. `apps/api/src/routes/referral.ts` - 추천인 링크 시스템 API
   - 5개 엔드포인트 구현

4. `apps/api/src/index.ts` - 라우터 등록

### Frontend (Web)
1. `apps/web/src/app/admin/sales/page.tsx` - 영업 관리 페이지
   - 영업 사원 목록
   - 필터링 및 검색
   - 등업, 이동, 삭제 기능

---

## ✅ 완료된 기능

1. ✅ 영업 조직 데이터베이스 스키마 설계
2. ✅ Prisma 마이그레이션 및 클라이언트 생성
3. ✅ 영업 조직 API 엔드포인트 구현 (CRUD, 등업, 이동)
4. ✅ 추천인 링크 시스템 API 구현
5. ✅ 영업 관리 페이지 UI 구현 (/admin/sales)
6. ⏳ 역할별 대시보드 페이지 (개발 중)

---

**작성일**: 2026년 3월 1일  
**작성자**: AI Developer (Claude)  
**버전**: v1.0  
**상태**: Backend 완료, Frontend 관리 페이지 완료, 대시보드 개발 예정
