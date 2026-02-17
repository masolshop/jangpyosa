# 장표사닷컴 (JangPyosa.com)

## 🎉 프로젝트 개요

**장표사닷컴**은 장애인 미고용 부담금 납부 대상 기업과 장애인표준사업장(약 830개)을 연결하는 **연계고용 도급계약 플랫폼**입니다.

## ✨ 핵심 기능

- 🎨 **사이드바 네비게이션**: 왼쪽 고정 메뉴 (토글 가능, 반응형)
- 💰 **장애인고용부담금 계산기**: 의무고용률 기반 부담금 추정
- 📉 **연계고용 감면 계산기**: 도급계약 금액 기반 감면액 계산 (최대 90%, 도급액 50% 상한)
- 🛒 **도급계약 쇼핑몰**: 830개 표준사업장 상품·서비스 검색 및 장바구니
- 📄 **CMS 콘텐츠**: 표준사업장 설립/연계사업/헬스바우처 안내
- 👥 **멀티테넌시**: Super Admin, 영업자(지사/매니저), 구매기업, 공급기업

## 🚀 현재 상태

✅ **MVP 완전 구현 완료**
- API 서버 실행 중: http://localhost:4000
- 웹 서버 실행 중: http://localhost:3000
- 공개 URL: https://3000-i9nss1cey8kihvk6alb7i-02b9cc79.sandbox.novita.ai
- 데이터베이스: SQLite (개발 환경)
- 초기 데이터 시딩 완료

## 🔑 초기 계정 정보

| 역할 | 이메일 | 비밀번호 | 추천코드 |
|------|--------|----------|----------|
| Super Admin | admin@jangpyosa.com | admin1234 | - |
| Agent (영업자) | agent@jangpyosa.com | agent1234 | AGENT001 |
| Supplier (공급사) | supplier@test.com | supplier1234 | - |

## 🛠️ 기술 스택

### Backend
- **Framework**: Express + TypeScript
- **ORM**: Prisma
- **Database**: SQLite (개발) / PostgreSQL (프로덕션)
- **Auth**: JWT + Refresh Token + RBAC
- **Validation**: Zod
- **File Upload**: Multer + ExcelJS

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules + Inline Styles
- **Navigation**: 반응형 사이드바 (고정 메뉴, 토글 기능)
- **State**: React Hooks + LocalStorage

### Business Logic
- 연도별 의무고용률 관리 (2026: 3.1% → 2027: 3.3%)
- 감면 산식: `min(부담금 × 90%, 도급액 × 50%)`
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

1. **홈** (`/`) - 플랫폼 소개 및 주요 기능 안내
2. **로그인** (`/login`) - 사용자 인증
3. **회원가입** (`/signup`) - 신규 회원 등록 (사업자번호 검증)
4. **상품 카탈로그** (`/catalog`) - 표준사업장 상품 검색
5. **장바구니** (`/cart`) - 도급계약 예정 상품 관리
6. **부담금 계산기** (`/calculators/levy`) - 부담금 추정
7. **연계고용 계산기** (`/calculators/linkage`) - 감면액 계산
8. **콘텐츠 페이지** (`/content/[slug]`) - CMS 콘텐츠

---

## 📦 다음 단계 (MVP 확장)

### Phase 2 - 도급계약 관리
- [ ] 공급사 상품 등록 UI
- [ ] 도급계약 의뢰서 생성 (ContractRequest)
- [ ] 견적 요청/수정/확정 워크플로우
- [ ] 계약 진행 상태 추적 (의뢰 → 견적 → 계약 → 납품 → 완료)

### Phase 3 - 영업자 대시보드
- [ ] 추천코드별 파이프라인 시각화
- [ ] 리드/가입/계약 전환율 리포트
- [ ] 도급액/감면액 통계

### Phase 4 - 파일 관리
- [ ] S3 연동 (계약서, 사업자등록증)
- [ ] 파일 업로드 UI
- [ ] 계약서 미리보기

### Phase 5 - 알림 & 통합
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
