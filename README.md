# 장표사닷컴 (JangPyosa.com)

## 프로젝트 개요

**장표사닷컴**은 장애인 미고용 부담금 납부 대상 기업과 장애인표준사업장(약 830개)을 연결하는 연계고용 도급계약 플랫폼입니다.

### 핵심 기능

- 💰 **장애인고용부담금 계산기**: 의무고용률 기반 부담금 추정
- 📉 **연계고용 감면 계산기**: 도급계약 금액 기반 감면액 계산 (최대 90%, 도급액 50% 상한)
- 🛒 **도급계약 쇼핑몰**: 830개 표준사업장 상품·서비스 검색 및 장바구니
- 📄 **CMS 콘텐츠**: 표준사업장 설립/연계사업/헬스바우처 안내
- 👥 **멀티테넌시**: Super Admin, 영업자(지사/매니저), 구매기업, 공급기업

### 기술 스택

- **Backend**: Express + TypeScript + Prisma + PostgreSQL
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Auth**: JWT + Refresh Token + RBAC
- **Business Logic**: 
  - 연도별 의무고용률 관리 (2026: 3.1% → 2027: 3.3%)
  - 감면 산식: min(부담금 * 90%, 도급액 * 50%)
  - 사업자번호 검증 (apick mock/real)

---

## 프로젝트 구조

```
webapp/
├── apps/
│   ├── api/                    # Express API 서버
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # DB 스키마 (SupplierRegistry 포함)
│   │   │   └── seed.ts         # 초기 데이터
│   │   └── src/
│   │       ├── routes/         # 인증, 관리자, 카탈로그, 장바구니, 계산기, 콘텐츠
│   │       ├── services/       # apick, calculation, excel
│   │       └── middleware/     # auth, rbac
│   └── web/                    # Next.js 웹 앱
│       └── src/
│           └── app/            # 페이지: login, signup, catalog, cart, calculators
├── docker-compose.yml          # PostgreSQL 컨테이너
└── .env                        # 환경 변수
```

---

## 로컬 개발 환경 설정

### 1. 사전 요구사항

- Node.js 18+
- Docker & Docker Compose
- pnpm 또는 npm

### 2. 환경 변수 설정

`.env` 파일이 생성되어 있습니다:

```bash
# Database
DATABASE_URL="postgresql://jp:jp_pw@localhost:5432/jangpyosa?schema=public"

# JWT
JWT_SECRET="change_me_super_secret_jangpyosa_2026"
JWT_REFRESH_SECRET="change_me_refresh_secret_jangpyosa_2026"

# API
PORT=4000
CORS_ORIGIN="http://localhost:3000"

# APICK (사업자번호 검증)
APICK_PROVIDER="mock"
APICK_API_KEY=""

# Frontend
NEXT_PUBLIC_API_BASE="http://localhost:4000"
```

### 3. 데이터베이스 시작

```bash
# PostgreSQL 컨테이너 시작
docker-compose up -d

# 확인
docker-compose ps
```

### 4. API 서버 설정 및 실행

```bash
cd apps/api

# 의존성 설치
npm install

# Prisma 클라이언트 생성 및 마이그레이션
npx prisma generate
npx prisma db push

# 초기 데이터 시딩
npm run db:seed

# 개발 서버 시작
npm run dev
```

**API 서버**: http://localhost:4000
- Health check: http://localhost:4000/health

### 5. 웹 서버 실행

```bash
cd apps/web

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

**웹 서버**: http://localhost:3000

---

## 초기 계정 정보

시드 데이터를 통해 다음 계정이 생성됩니다:

| 역할 | 이메일 | 비밀번호 | 추천코드 |
|------|--------|----------|----------|
| Super Admin | admin@jangpyosa.com | admin1234 | - |
| Agent (영업자) | agent@jangpyosa.com | agent1234 | AGENT001 |
| Supplier (공급사) | supplier@test.com | supplier1234 | - |

---

## 주요 API 엔드포인트

### 인증
- `POST /auth/signup` - 회원가입 (사업자번호 검증 포함)
- `POST /auth/login` - 로그인
- `POST /auth/refresh` - 토큰 갱신

### 계산기
- `POST /calculators/levy` - 부담금 계산
- `POST /calculators/linkage` - 연계고용 감면 계산
- `GET /calculators/settings/:year` - 연도별 설정 조회

### 카탈로그
- `GET /catalog/products` - 상품 검색 (q, category, region)
- `GET /catalog/suppliers` - 공급사 목록

### 장바구니 (BUYER 권한 필요)
- `GET /cart` - 장바구니 조회
- `POST /cart/add` - 상품 추가
- `DELETE /cart/items/:itemId` - 항목 삭제

### 관리자 (SUPER_ADMIN 권한 필요)
- `POST /admin/year-settings/upsert` - 연도별 설정 관리
- `POST /admin/suppliers/import-excel` - 830개 업체 엑셀 업로드
- `GET /admin/suppliers/registry` - 공급사 레지스트리 조회

### 콘텐츠
- `GET /content/pages/:slug` - 콘텐츠 페이지 조회
- `POST /admin/pages/upsert` - 콘텐츠 관리 (SUPER_ADMIN)

---

## 데이터 모델 하이라이트

### SupplierRegistry (830개 업체 관리)
- 유저 없이도 공급사 정보 저장 가능
- 엑셀 업로드로 일괄 등록
- 공급사 가입 시 bizNo로 매칭하여 Claim

### YearSetting (연도별 의무고용률)
- 2026: 민간 3.1%, 공공 3.8%
- 2027: 민간 3.3% (상향)
- 부담기초액, 감면 상한 설정 관리

### 감면 산식
```
감면 상한 = min(부담금 * 90%, 도급액 * 50%)
실제 감면액 = min(목표 감면액, 감면 상한)
```

---

## 배포 체크리스트

### Production 환경 변수
- `APICK_PROVIDER=real` + `APICK_API_KEY` 설정
- `JWT_SECRET`, `JWT_REFRESH_SECRET` 변경
- `DATABASE_URL` 프로덕션 DB 주소

### AWS 배포 예시
- **Frontend**: Vercel or CloudFront + S3
- **Backend**: ECS/Fargate or EC2
- **Database**: RDS (PostgreSQL)
- **Files**: S3 (계약서, 사업자등록증)

---

## 다음 단계 (MVP 확장)

1. ✅ SupplierRegistry 패치 완료
2. ⏳ 공급사 상품 등록 UI
3. ⏳ 도급계약 의뢰서 생성 (ContractRequest)
4. ⏳ 영업자 대시보드 (추천코드별 파이프라인)
5. ⏳ 계약서/서류 업로드 (S3)
6. ⏳ 결제 연동 (선택)
7. ⏳ 이메일 알림 (계약 상태 변경)

---

## 라이센스

Proprietary - (주)장표사닷컴

---

## 문의

- Email: admin@jangpyosa.com
- 제도 안내: 한국장애인고용공단 (https://www.kead.or.kr/)
