# 🎉 영업 조직 관리 시스템 구축 완료

## 📅 프로젝트 정보
- **완료일**: 2026년 3월 1일 (3.1절 기념)
- **버전**: v1.0
- **Repository**: https://github.com/masolshop/jangpyosa
- **커밋**: 95e0ffa

---

## ✅ 구현 완료 사항

### 1. 데이터베이스 설계 ⚡

#### SalesPerson 모델
```prisma
model SalesPerson {
  id              String    @id @default(cuid())
  userId          String    @unique
  name            String
  phone           String    @unique
  email           String?
  role            String    // HEAD_MANAGER, BRANCH_MANAGER, MANAGER
  managerId       String?
  referralCode    String    @unique
  referralLink    String
  totalReferrals  Int       @default(0)
  activeReferrals Int       @default(0)
  totalRevenue    Float     @default(0)
  commission      Float     @default(0)
  isActive        Boolean   @default(true)
  // ... relations
}
```

#### CompanyReferral 모델
- 추천 고객 추적
- 결제 정보 기록
- 활성화 상태 관리

#### SalesActivityLog 모델
- 등업/이동/삭제 로그
- 활동 추적
- 감사 기록

### 2. API 엔드포인트 구현 🚀

#### `/sales` 라우터
```javascript
GET    /people                      // 영업 사원 목록 조회 (필터링 가능)
POST   /people                      // 영업 사원 등록
GET    /people/:id                  // 상세 조회
POST   /people/:id/promote          // 등업 (MANAGER → BRANCH_MANAGER → HEAD_MANAGER)
POST   /people/:id/transfer         // 상급자 변경
PUT    /people/:id/status           // 상태 변경 (활성/비활성)
DELETE /people/:id                  // 삭제
GET    /stats                       // 전체 통계
GET    /organization                // 조직도 데이터
GET    /my-info                     // 내 정보 조회
```

#### `/referral` 라우터
```javascript
POST   /validate-code                   // 추천 코드 검증
POST   /register                        // 고객 등록 (추천인 연결)
GET    /companies/:salesPersonId        // 추천 고객 목록
POST   /companies/:id/activate          // 추천 고객 활성화
POST   /companies/:id/payment           // 결제 기록 추가
```

### 3. 프론트엔드 UI 완성 🎨

#### 영업 관리 페이지 (`/admin/sales`)
**3개 탭 구조:**

##### 📊 대시보드 탭
- **통계 카드**
  - 총 영업 사원 수
  - 활성 사원 수
  - 총 추천 고객 수
  - 활성 고객 수
  
- **역할별 현황 카드**
  - 본부장 (👑 아이콘)
  - 지사장 (🏢 아이콘)
  - 매니저 (💪 아이콘)

- **실적 요약**
  - 총 매출 (그라데이션 카드)
  - 총 수수료 (그라데이션 카드)

##### 👥 사원 목록 탭
- **필터 기능**
  - 역할별 필터 (본부장/지사장/매니저)
  - 상태 필터 (활성/비활성)
  - 검색 (이름, 핸드폰, 이메일)

- **카드 뷰**
  - 사원 정보 (이름, 연락처, 역할 뱃지)
  - 실적 표시 (추천 고객, 하위 직원, 매출, 수수료)
  - 등업 버튼 (역할에 따라 표시)
  - 호버 효과 (보더 색상, 그림자)

- **상세 모달**
  - 전체 정보 표시
  - 추천인 링크 복사
  - 하위 직원 목록

##### 🏢 조직도 탭
- 개발 예정 (플레이스홀더)

### 4. 계층 구조 시스템 📊

```
슈퍼어드민 (시스템 관리자)
    │
    ├── 👑 본부장 (HEAD_MANAGER)
    │      │
    │      ├── 🏢 지사장 (BRANCH_MANAGER)
    │      │      │
    │      │      └── 💪 매니저 (MANAGER)
    │      │
    │      ├── 🏢 지사장
    │      │      └── 💪 매니저
    │      │
    │      └── 🏢 지사장
    │             └── 💪 매니저
    │
    ├── 👑 본부장
    └── 👑 본부장
```

### 5. 추천인 링크 시스템 🔗

#### 링크 생성 규칙
```
https://jangpyosa.com/{핸드폰번호}
예: https://jangpyosa.com/01012345678
```

#### 동작 흐름
1. 고객이 추천 링크 방문
2. 추천 코드 검증 (`/referral/validate-code`)
3. 회원가입 시 추천인 정보 자동 입력
4. 가입 완료 후 `CompanyReferral` 레코드 생성
5. 첫 결제 시 활성화 (`/referral/companies/:id/activate`)
6. 실적에 자동 반영 (totalReferrals, activeReferrals, totalRevenue, commission)

### 6. 테스트 데이터 생성 완료 ✅

#### 현재 데이터베이스 구성
```
📊 전체 통계:
   총 영업 사원: 57명
   본부장: 3명
   지사장: 9명 (각 본부장당 3명)
   매니저: 45명 (각 지사장당 5명)
```

#### 샘플 조직 구조
```
김본부1 (본부장) - 01011110001
  └─ 이지사1 (지사장) - 5명 매니저
  └─ 이지사2 (지사장) - 5명 매니저
  └─ 이지사3 (지사장) - 5명 매니저

김본부2 (본부장) - 01011110002
  └─ 이지사4 (지사장) - 5명 매니저
  └─ 이지사5 (지사장) - 5명 매니저
  └─ 이지사6 (지사장) - 5명 매니저

김본부3 (본부장) - 01011110003
  └─ 이지사7 (지사장) - 5명 매니저
  └─ 이지사8 (지사장) - 5명 매니저
  └─ 이지사9 (지사장) - 5명 매니저
```

#### 실적 데이터
각 영업 사원마다 랜덤으로 생성된 실적:
- **본부장**: 추천 고객 20~70개, 매출 1천만~6천만원
- **지사장**: 추천 고객 10~40개, 매출 500만~3천만원
- **매니저**: 추천 고객 5~25개, 매출 200만~1천 5백만원

---

## 🛠️ 기술 스택

### Backend
- **Framework**: Express.js
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **ORM**: Prisma 5.20.0
- **Auth**: JWT
- **Validation**: Zod

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Inline CSS (향후 Tailwind 전환 고려)
- **State**: React Hooks

---

## 📁 주요 파일 구조

```
jangpyosa/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── sales.ts         # 영업 조직 API
│   │   │   │   └── referral.ts      # 추천인 API
│   │   │   └── index.ts             # 라우터 등록
│   │   ├── prisma/
│   │   │   └── schema.prisma        # DB 스키마
│   │   └── create-sales-test-data.mjs  # 테스트 데이터 생성
│   │
│   └── web/
│       └── src/
│           └── app/
│               └── admin/
│                   └── sales/
│                       └── page.tsx  # 영업 관리 UI
│
└── docs/
    ├── SALES-SYSTEM-COMPLETE.md     # 본 문서
    └── SALES-ORGANIZATION-SYSTEM.md # 시스템 설계 문서
```

---

## 🚀 사용 방법

### 1. 테스트 데이터 생성
```bash
cd apps/api
node create-sales-test-data.mjs
```

### 2. 서버 실행
```bash
# API 서버
cd apps/api
npm run dev

# Web 서버
cd apps/web
npm run dev
```

### 3. 영업 관리 페이지 접속
```
http://localhost:3000/admin/sales
```

### 4. 데이터 확인
```bash
cd apps/api
node check-sales-data.mjs
```

---

## 🔐 권한 구조

### 슈퍼어드민 (SUPER_ADMIN)
- ✅ 모든 영업 사원 조회
- ✅ 영업 사원 등록/수정/삭제
- ✅ 등업/강등/이동 권한
- ✅ 통계 및 조직도 조회
- ✅ 활동 로그 확인

### 본부장 (HEAD_MANAGER)
- ✅ 하위 조직(지사장, 매니저) 조회
- ✅ 본인 실적 조회
- ✅ 추천 고객 관리
- ❌ 타 본부 조회 불가

### 지사장 (BRANCH_MANAGER)
- ✅ 하위 매니저 조회
- ✅ 본인 실적 조회
- ✅ 추천 고객 관리
- ❌ 타 지사 조회 불가

### 매니저 (MANAGER)
- ✅ 본인 정보 조회
- ✅ 본인 실적 조회
- ✅ 추천 고객 관리

---

## 📊 API 응답 예시

### 통계 조회 (GET /sales/stats)
```json
{
  "stats": {
    "totalSalesPeople": 57,
    "activeSalesPeople": 57,
    "countByRole": [
      { "role": "HEAD_MANAGER", "_count": 3 },
      { "role": "BRANCH_MANAGER", "_count": 9 },
      { "role": "MANAGER", "_count": 45 }
    ],
    "totalReferrals": 742,
    "activeReferrals": 568,
    "totalRevenue": 1456789000,
    "totalCommission": 145678900
  }
}
```

### 영업 사원 목록 조회 (GET /sales/people)
```json
{
  "salesPeople": [
    {
      "id": "cm...",
      "name": "김본부1",
      "phone": "01011110001",
      "email": "headmanager1@jangpyosa.com",
      "role": "HEAD_MANAGER",
      "referralCode": "1011110001",
      "referralLink": "https://jangpyosa.com/01011110001",
      "totalReferrals": 54,
      "activeReferrals": 12,
      "totalRevenue": 18094939,
      "commission": 2975846,
      "isActive": true,
      "subordinates": [
        {
          "id": "cm...",
          "name": "이지사1",
          "role": "BRANCH_MANAGER",
          "totalReferrals": 25,
          "activeReferrals": 8
        }
      ],
      "referredCompanies": [],
      "createdAt": "2026-03-01T06:51:19.123Z"
    }
  ]
}
```

---

## 🎯 향후 개발 계획

### Phase 1: 역할별 대시보드 (1주)
- [ ] 본부장 전용 대시보드
- [ ] 지사장 전용 대시보드
- [ ] 매니저 전용 대시보드
- [ ] 실시간 실적 차트

### Phase 2: 추천 링크 UI (1주)
- [ ] 추천 링크 랜딩 페이지
- [ ] 추천인 정보 표시
- [ ] 회원가입 연동
- [ ] 추적 스크립트

### Phase 3: 결제 연동 (2주)
- [ ] 결제 이벤트 후킹
- [ ] 자동 활성화
- [ ] 수수료 계산 로직
- [ ] 정산 기능

### Phase 4: 고급 기능 (1개월)
- [ ] 실시간 조직도 (D3.js)
- [ ] 리더보드 (순위표)
- [ ] 실적 리포트 (Excel 내보내기)
- [ ] 알림 시스템 (새 추천 고객)
- [ ] 모바일 최적화

### Phase 5: 분석 및 최적화 (1개월)
- [ ] 영업 활동 분석 대시보드
- [ ] 성과 예측 AI
- [ ] A/B 테스트 기능
- [ ] SEO 최적화 (추천 링크)

---

## 🔧 유지보수 가이드

### 데이터베이스 마이그레이션
```bash
cd apps/api
npx prisma migrate dev --name add_feature
npx prisma generate
```

### 테스트 데이터 초기화
```bash
cd apps/api
node create-sales-test-data.mjs  # 기존 데이터 삭제 후 재생성
```

### 프로덕션 배포
```bash
# 1. 빌드
cd apps/api && npm run build
cd apps/web && npm run build

# 2. 마이그레이션
cd apps/api && npx prisma migrate deploy

# 3. 서버 재시작
pm2 restart jangpyosa-api
pm2 restart jangpyosa-web
```

---

## 📝 추가 문서

- **시스템 설계**: `SALES-ORGANIZATION-SYSTEM.md`
- **API 문서**: 각 라우터 파일 내 JSDoc 주석 참조
- **데이터베이스 스키마**: `apps/api/prisma/schema.prisma`

---

## 🎊 완료 체크리스트

- [x] ✅ 데이터베이스 스키마 설계
- [x] ✅ Prisma 모델 정의
- [x] ✅ API 엔드포인트 구현
- [x] ✅ 추천인 링크 시스템
- [x] ✅ 프론트엔드 UI 구현
- [x] ✅ 테스트 데이터 생성
- [x] ✅ 빌드 및 배포
- [x] ✅ 문서화 완료

---

## 📞 문의 및 지원

- **Repository**: https://github.com/masolshop/jangpyosa
- **Issue Tracker**: https://github.com/masolshop/jangpyosa/issues

---

**🎉 3.1절 기념 영업 조직 관리 시스템 구축 완료! 🎉**

> "Independence Movement Day를 기념하여  
> 장표사닷컴의 영업 조직이 독립적으로 성장할 수 있는  
> 시스템을 만들었습니다!" 🇰🇷

**Version**: 1.0  
**Date**: 2026-03-01  
**Status**: ✅ Production Ready
