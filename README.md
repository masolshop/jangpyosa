# 장표사닷컴 (JangPyosa.com)

## 🎉 프로젝트 개요

**장표사닷컴**은 장애인 미고용 부담금 납부 대상 기업과 장애인표준사업장(878개)을 연결하는 **연계고용 도급계약 플랫폼**입니다.

## ✨ 핵심 기능

### 👥 회원 분류 시스템
- **로그인**: 핸드폰 번호 + 비밀번호 (이메일 선택사항)
- **슈퍼어드민**: 지사 생성/수정/삭제, 매니저 지사 이동 관리
- **매니저(AGENT)**: 지사 소속, 추천코드 보유, 회원 가입 시 추천인으로 매칭
- **표준사업장 기업(SUPPLIER)**: APICK 유료 API 인증, 사업자번호로 자동 매칭, 1기업 1계정
- **고용부담금 기업(BUYER)**: APICK 유료 API 인증, 표준사업장 검색 및 도급계약 요청, 1기업 1계정
- **장애인 직원(EMPLOYEE)** 🆕: 사업자등록번호 + 인증번호 기반 회원가입, 출퇴근 관리 기능

### 🏢 지사(Branch) 관리
- 10개 전국 지사 운영 (서울남부, 서울북부, 부산, 대구, 인천, 광주, 대전, 울산, 경기, 강원)
- 매니저 지사 배정 및 이동
- 지사별 매니저 및 추천 실적 관리

### 🔐 APICK 인증
- ✅ **실제 사업자번호 검증** (한국사업자번호 API 연동)
- ✅ **회원가입 시 자동 인증**: 사업자번호 입력 후 엔터 또는 인증 버튼 클릭
- ✅ **자동 정보 출력**: 상호명, 대표자명, 주소, 업종, 대표전화 등
- ✅ **폐업 여부 확인**: 폐업 사업자는 가입 불가
- **API Key**: `41173030f4fc1055778b2f97ce9659b5`
- **비용**: 1회당 40원
- **현재 모드**: `APICK_PROVIDER=apick` (실제 API 사용)
- **테스트 완료**:
  - `266-81-01215` → 주식회사 페마연 / 이종근 ✅
  - `324-82-00687` → 사단법인 한마음장애인복지회 하늘복지사업단 / 김용호 ✅

### 기타 기능
- 🎨 **사이드바 네비게이션**: 왼쪽 고정 메뉴 (토글 가능, 반응형)
- 💰 **장애인고용부담금 계산기**: 의무고용률 기반 부담금 추정
- 📉 **연계고용 감면 계산기**: 도급계약 금액 기반 감면액 계산 (최대 90%, 도급액 50% 상한)
- 🛒 **도급계약 쇼핑몰**: 878개 표준사업장 목록 검색 및 필터링
- 🏭 **공급사 프로필 관리**: 이미지 업로드, 도급계약 정보, 상세페이지 작성
- 📄 **CMS 콘텐츠**: 표준사업장 설립/연계사업/헬스바우처 안내
- 🔑 **비밀번호 찾기/변경**: SMS 인증 (MVP: 임시 코드 123456)

## 📊 표준사업장 데이터

- **총 878개** 장애인표준사업장 정보 등록 완료 ✅
- 인증번호, 사업체명, 사업자번호, 소재지, 업종, 대표자, 연락처 등 포함
- 공급사 회원가입 시 사업자번호로 자동 매칭 (Claim)
- **검색 가능**: 사업장명, 지역, 업종, 소재지로 실시간 검색
- **페이지네이션**: 20개씩 표시 (총 44페이지)

## 🚀 현재 상태

✅ **MVP 완전 구현 완료 + Phase 1 완료**
- API 서버 실행 중: http://localhost:4000
- 웹 서버 실행 중: http://localhost:3001
- 공개 URL: https://3001-i9nss1cey8kihvk6alb7i-02b9cc79.sandbox.novita.ai
- 데이터베이스: SQLite (개발 환경)
- 초기 데이터 시딩 완료

### 🎨 최근 업데이트 (2026-02-20)
**Phase 2 완료: 장애인 직원 근태관리 시스템**
- ✅ `DisabledEmployee` 모델에 `workType` 필드 추가 (OFFICE/REMOTE/HYBRID)
- ✅ `AttendanceRecord` 테이블 신규 생성 (출퇴근 기록 저장)
- ✅ `User` 모델에 EMPLOYEE 역할 추가 (employeeId, companyBizNo 필드)
- ✅ 직원 회원가입/로그인 API 구현 (사업자등록번호 + 인증번호 기반)
- ✅ 출퇴근 관리 API 구현 (CRUD: 출근, 퇴근, 조회, 수정, 삭제)
- ✅ 관리자 근태관리 페이지: `/dashboard/attendance`
  - 직원별 출퇴근 현황 및 통계 조회
  - 월별/일별 근태 기록 관리
  - 근무형태별 필터링 (사무실/재택/혼합)
- ✅ 직원 출퇴근 페이지: `/employee/attendance`
  - 실시간 출퇴근 버튼 (출근/퇴근)
  - 근무형태 선택 (사무실/재택)
  - 당일 출퇴근 현황 표시
- ✅ 직원 회원가입 페이지: `/employee/signup` 🆕
  - 이름, 핸드폰 번호, 비밀번호 입력
  - 소속 기업 사업자등록번호 + 인증번호로 기업 등록 데이터와 매칭
  - 개인정보 활용 동의 필수
- ✅ 직원 로그인 페이지: `/employee/login` 🆕
  - 핸드폰 번호 + 비밀번호 인증
  - 로그인 성공 시 `/employee/attendance`로 자동 이동
- ✅ 사이드바 메뉴 추가
  - '계정' 섹션에 직원 로그인/회원가입 링크 추가
  - EMPLOYEE 역할 로그인 시 '출퇴근 관리' 메뉴 노출

**Phase 1 완료: 기업 유형별 정밀 계산 시스템 (2026-02-18)**
- ✅ Company 모델에 `buyerType` 필드 추가 (PRIVATE_COMPANY/PUBLIC_INSTITUTION/GOVERNMENT)
- ✅ BuyerProfile에 `hasLevyExemption` 필드 추가 (국가/지자체 특별 감면)
- ✅ 의무고용률 자동 구분: 민간기업 3.1%, 공공기관·국가/지자체 3.8%
- ✅ 계산 로직에 buyerType 기반 quotaRate 적용
- ✅ 메뉴 구조 개편: 직원 등록·관리와 월별 고용 관리 페이지 분리
  - `/dashboard/employees` - 장애인 직원 등록·관리 (CRUD 전용)
  - `/dashboard/monthly` - 월별 장애인 고용 관리 (상시근로자 입력 → 자동 계산)

## 🔑 초기 계정 정보

### 로그인 방식: 핸드폰 번호 + 비밀번호
**지원 형식**: `010-1234-5678`, `01012345678`, `1012345678` (모두 인식 가능)

| 역할 | 핸드폰 번호 | 비밀번호 | 기업 유형 | 추천코드 | 소속 | 비고 |
|------|-------------|----------|-----------|----------|------|------|
| Super Admin | 010-1234-5678 | admin1234 | - | - | - | 지사 관리 |
| Agent (매니저) | 010-9876-5432 | agent1234 | - | AGENT001 | 서울남부지사 | - |
| Agent (매니저) | 010-8765-4321 | agent1234 | - | AGENT002 | 부산지역본부 | - |
| Buyer (민간기업) | 010-5555-6666 | test1234 | PRIVATE_COMPANY (3.1%) | - | - | 주식회사 페마연 |

## 🛠️ 기술 스택

### Backend
- **Framework**: Express + TypeScript
- **ORM**: Prisma
- **Database**: SQLite (개발) / PostgreSQL (프로덕션)
- **Auth**: JWT + Refresh Token + RBAC
- **Validation**: Zod
- **File Upload**: Multer (이미지 최대 5MB, 5개)
- **Excel Processing**: ExcelJS (표준사업장 데이터 임포트)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules + Inline Styles
- **Navigation**: 반응형 사이드바 (고정 메뉴, 토글 기능)
- **State**: React Hooks + LocalStorage

### Business Logic
- **기업 유형별 의무고용률 관리**
  - 민간기업 (PRIVATE_COMPANY): 3.1% (2026년 기준)
  - 공공기관 (PUBLIC_INSTITUTION): 3.8%
  - 국가/지자체/교육청 (GOVERNMENT): 3.8% + 특별 감면 적용
- **의무고용 계산**
  - 의무고용 = floor(상시근로자 × 의무고용률)
  - 장려금 기준 = ceil(상시근로자 × 0.031) — 민간 기준
  - 인정 수 = 중증 60시간 이상 2배 인정
- **감면 산식**: `min(부담금 × 90%, 도급액 × 50%)`
- 사업자번호 검증 (apick mock/real)

---

## 📁 프로젝트 구조

```
webapp/
├── apps/
│   ├── api/                    # Express API 서버
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # DB 스키마 (SupplierRegistry 포함)
│   │   │   ├── seed.ts         # 초기 데이터
│   │   │   └── dev.db          # SQLite 데이터베이스
│   │   └── src/
│   │       ├── routes/         # 인증, 관리자, 카탈로그, 장바구니, 계산기, 콘텐츠
│   │       ├── services/       # apick, calculation, excel
│   │       └── middleware/     # auth, rbac
│   └── web/                    # Next.js 웹 앱
│       └── src/
│           └── app/            # 페이지: login, signup, catalog, cart, calculators
├── .env                        # 환경 변수
└── README.md                   # 이 문서
```

---

## 🚀 빠른 시작 가이드

### 현재 서버 상태 확인

```bash
# API 서버 확인
curl http://localhost:4000/health

# 웹 서버 확인
curl http://localhost:3000
```

### 새로운 터미널에서 서버 시작 (필요 시)

```bash
# API 서버
cd /home/user/webapp/apps/api
npm run dev

# 웹 서버 (다른 터미널)
cd /home/user/webapp/apps/web
npm run dev
```

### 데이터베이스 재설정

```bash
cd /home/user/webapp/apps/api

# 스키마 재생성
npx prisma db push

# 데이터 다시 시딩
npm run db:seed
```

---

## 📊 주요 API 엔드포인트

### 인증
- `POST /auth/signup` - 회원가입 (사업자번호 검증 포함)
- `POST /auth/login` - 로그인
- `POST /auth/refresh` - 토큰 갱신

### 계산기 (게스트 사용 가능)
- `POST /calculators/levy` - 부담금 계산
- `POST /calculators/linkage` - 연계고용 감면 계산
- `GET /calculators/settings/:year` - 연도별 설정 조회

### 카탈로그 (게스트 사용 가능)
- `GET /catalog/products?q=검색어&category=카테고리&region=지역`
- `GET /catalog/suppliers?region=지역`
- `GET /catalog/categories`

### 장바구니 (BUYER 권한 필요)
- `GET /cart` - 장바구니 조회
- `POST /cart/add` - 상품 추가
- `DELETE /cart/items/:itemId` - 항목 삭제
- `DELETE /cart/clear` - 장바구니 비우기

### 관리자 (SUPER_ADMIN 권한 필요)
- `POST /admin/year-settings/upsert` - 연도별 설정 관리
- `GET /admin/year-settings` - 설정 목록
- `POST /admin/suppliers/import-excel` - 830개 업체 엑셀 업로드
- `GET /admin/suppliers/registry` - 공급사 레지스트리 조회
- `POST /admin/pages/upsert` - 콘텐츠 페이지 관리

### 콘텐츠 (게스트 사용 가능)
- `GET /content/pages/:slug` - 콘텐츠 페이지 조회
- `GET /content/pages` - 페이지 목록

---

## 💡 주요 데이터 모델

### SupplierRegistry (830개 업체 관리)
- 유저 없이도 공급사 정보 저장 가능
- 엑셀 업로드로 일괄 등록
- 공급사 가입 시 bizNo로 매칭하여 Claim

### YearSetting (연도별 의무고용률)
```typescript
{
  year: 2026,
  privateQuotaRate: 0.031,  // 민간 3.1%
  publicQuotaRate: 0.038,   // 공공 3.8%
  baseLevyAmount: 1000000,  // 부담기초액
  maxReductionRate: 0.9,    // 감면 상한 90%
  maxReductionByContract: 0.5  // 도급액 대비 50%
}
```

### 감면 산식
```javascript
감면 상한 = min(부담금 × 90%, 도급액 × 50%)
실제 감면액 = min(목표 감면액, 감면 상한)
감면 후 부담금 = 원래 부담금 - 실제 감면액
```

---

## 🧪 테스트 시나리오

### 1. 부담금 계산 테스트
```bash
curl -X POST http://localhost:4000/calculators/levy \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2026,
    "employeeCount": 100,
    "disabledCount": 0,
    "companyType": "PRIVATE"
  }'
```

### 2. 연계고용 감면 계산 테스트
```bash
curl -X POST http://localhost:4000/calculators/linkage \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2026,
    "levyAmount": 3100000,
    "contractAmount": 10000000
  }'
```

### 3. 로그인 테스트
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@jangpyosa.com",
    "password": "admin1234"
  }'
```

---

## 🌐 웹 페이지

현재 구현된 페이지:

### 공개 페이지 (Guest)
1. **홈** (`/`) - 플랫폼 소개 및 주요 기능 안내
2. **로그인** (`/login`) - 사용자 인증 (핸드폰 번호 + 비밀번호)
3. **회원가입** (`/signup`) - 신규 회원 등록 (사업자번호 검증, 기업 유형 선택)
4. **상품 카탈로그** (`/catalog`) - 표준사업장 상품 검색
5. **부담금 계산기** (`/calculators/levy`, `/calculators/levy-annual`) - 부담금 추정
6. **장려금 계산기** (`/calculators/incentive-annual`) - 장려금 추정
7. **연계고용 계산기** (`/calculators/linkage`) - 감면액 계산
8. **표준사업장혜택 계산기** (`/calculators/standard-benefit`)
9. **콘텐츠 페이지** (`/content/[slug]`) - CMS 콘텐츠

### 고용의무기업(BUYER) 전용
10. **대시보드** (`/dashboard`) - 연간 요약, 월별 트렌드
11. **장애인 직원 등록·관리** (`/dashboard/employees`) - 직원 CRUD, 현황 통계
12. **월별 장애인 고용 관리** (`/dashboard/monthly`) - 상시근로자 입력, 부담금/장려금 자동 계산
13. **장바구니** (`/cart`) - 도급계약 예정 상품 관리
14. **도급계약 이행·결제 관리** (`/dashboard/contracts`)
15. **월별 실적 관리** (`/dashboard/performances`)

### 표준사업장(SUPPLIER) 전용
16. **공급사 프로필 관리** (`/supplier/profile`) - 이미지 업로드, 도급계약 정보

### 관리자(SUPER_ADMIN) 전용
17. **지사 관리** (`/admin/branches`) - 지사 생성/수정/삭제, 매니저 배정

---

## 📦 다음 단계

### Phase 2 - 연계고용감면센터 (진행 예정)
- [ ] 연계고용 감면 계산 로직 정밀화
  - 민간/공공/국가 기업별 감면 계산식 차별화
  - 국가/지자체/교육청 특별 감면 로직 구현
  - 엑셀 계산식 연동
- [ ] 공공기관/국가 데모 계정 생성
- [ ] Dashboard UI 기업 유형별 분기 처리

### Phase 3 - 도급계약 관리
- [ ] 공급사 상품 등록 UI
- [ ] 도급계약 의뢰서 생성 (ContractRequest)
- [ ] 견적 요청/수정/확정 워크플로우
- [ ] 계약 진행 상태 추적 (의뢰 → 견적 → 계약 → 납품 → 완료)

### Phase 4 - 영업자 대시보드
- [ ] 추천코드별 파이프라인 시각화
- [ ] 리드/가입/계약 전환율 리포트
- [ ] 도급액/감면액 통계

### Phase 5 - 파일 관리 & 출력
- [ ] PDF/Excel 출력 기능 구현
  - 고용장려금 신청 양식
  - 고용부담금 신청 양식
- [ ] S3 연동 (계약서, 사업자등록증)
- [ ] 계약서 미리보기

### Phase 6 - 알림 & 통합
- [ ] 이메일 알림 (계약 상태 변경)
- [ ] 결제 연동 (선택)
- [ ] apick 실제 API 연동

---

## 🔒 보안 고려사항

### 현재 구현
- ✅ JWT Access Token (2시간)
- ✅ Refresh Token (14일)
- ✅ RBAC (역할 기반 권한 관리)
- ✅ 비밀번호 해싱 (bcrypt)
- ✅ 사업자번호 검증 (apick mock)

### 프로덕션 권장사항
- HTTPS 강제 사용
- Rate Limiting (API 요청 제한)
- CORS 정책 강화
- SQL Injection 방지 (Prisma 자동 처리)
- XSS 방지 (React 자동 이스케이핑)
- 환경 변수 암호화

---

## 🚢 배포 가이드

### PostgreSQL로 전환 (프로덕션)

```bash
# 1. .env 수정
DATABASE_URL="postgresql://user:password@host:5432/jangpyosa"

# 2. schema.prisma 수정
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# 3. 마이그레이션
cd apps/api
npx prisma generate
npx prisma db push
npm run db:seed
```

### 환경 변수 (프로덕션)
```bash
# JWT
JWT_SECRET="강력한_시크릿_키_사용"
JWT_REFRESH_SECRET="강력한_리프레시_키_사용"

# APICK
APICK_PROVIDER="real"
APICK_API_KEY="실제_API_키"

# CORS
CORS_ORIGIN="https://your-domain.com"
```

### AWS 배포 예시
- **Frontend**: Vercel or CloudFront + S3
- **Backend**: ECS/Fargate or EC2
- **Database**: RDS PostgreSQL
- **Files**: S3 (계약서, 사업자등록증)

---

## 📞 문의 및 지원

- **Email**: admin@jangpyosa.com
- **제도 안내**: 한국장애인고용공단 (https://www.kead.or.kr/)

---

## 📝 라이센스

Proprietary - (주)장표사닷컴

---

## 🙏 제도 근거

**연계고용 부담금 감면제도**는 장애인표준사업장 등과 도급계약을 체결해 납품받는 경우, 해당 사업장에서 종사한 장애인을 고용한 것으로 간주해 부담금을 감면하는 제도입니다.

- **감면 총액**: 부담금의 90% 이내
- **상한**: 해당 연도 도급액의 50%를 초과할 수 없음
- **근거**: 장애인고용촉진 및 직업재활법
- **관할**: 한국장애인고용공단

---

**🎉 MVP 구현 완료! 이제 바로 사용 가능합니다!**
