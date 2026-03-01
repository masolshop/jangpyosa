# 영업 대시보드 전면 재구축 가이드

## 📅 완료 일시
2026-03-02 00:12 KST

## 🎯 프로젝트 목표

기존의 단일 화면 대시보드를 **매니저/지사/본부** 역할별로 완전히 분리된 대시보드로 재구축하여 가독성과 사용성 향상

---

## 🏗️ 아키텍처 설계

### 1. 매니저 대시보드 (MANAGER)

#### 표시 정보
- **계정 정보**: 이름, 전화번호, 이메일
- **통계 요약**: 
  - 총 추천 의무고용기업
  - 민간기업 수
  - 공공기관 수
  - 정부교육기관 수
- **추천 기업 리스트**:
  - 카테고리별 필터링 (전체/민간/공공/정부)
  - 기업명, 사업자번호, 대표자
  - 구분, 직원 수, 장애인 수

#### API 엔드포인트
```
GET /sales/auth/me              # 계정 정보
GET /sales/dashboard/stats      # 통계 요약
GET /sales/dashboard/companies  # 추천 기업 리스트
```

#### 주요 기능
- 카테고리별 필터링 (드롭다운)
- 테이블 형식 기업 리스트
- 색상 구분 (민간=녹색, 공공=보라, 정부=주황)

---

### 2. 지사 대시보드 (BRANCH_MANAGER)

#### 표시 정보
- **지사 정보**: 지사명, 지사장명, 전화번호, 이메일
- **통계 요약**:
  - 소속 매니저 수
  - 총 추천기업 수
  - 민간기업 수
  - 공공기관 수
  - 정부교육기관 수
- **소속 매니저 리스트**:
  - 이름, 전화번호, 이메일
  - 카테고리별 추천기업 수 (민간/공공/정부)
  - 합계

#### API 엔드포인트
```
GET /sales/auth/me               # 지사 정보
GET /sales/dashboard/stats       # 통계 요약
GET /sales/dashboard/managers    # 소속 매니저 리스트
```

#### 주요 기능
- 소속 매니저별 성과 통계
- 카테고리별 배지 표시
- 합계 계산 자동화

---

### 3. 본부 대시보드 (HEAD_MANAGER)

#### 표시 정보
- **본부 정보**: 본부명, 본부장명, 전화번호, 이메일
- **통계 요약**:
  - 소속 지사 수
  - 소속 매니저 수
  - 총 추천기업 수
  - 민간기업 수
  - 공공기관 수
  - 정부교육기관 수
- **소속 지사 리스트**:
  - 지사명, 지사장, 전화번호
  - 소속 매니저 수
  - 카테고리별 추천기업 수 (민간/공공/정부)
  - 합계

#### API 엔드포인트
```
GET /sales/auth/me               # 본부 정보
GET /sales/dashboard/stats       # 통계 요약
GET /sales/dashboard/branches    # 소속 지사 리스트
```

#### 주요 기능
- 지사별 성과 통계
- 계층적 정보 표시 (본부 > 지사 > 매니저)
- 카테고리별 배지 표시

---

## 🎨 UI/UX 디자인

### 공통 컴포넌트

#### 1. StatCard (통계 카드)
```tsx
<StatCard
  icon="🏢"              // 아이콘
  title="총 추천기업"     // 제목
  value={120}            // 값
  unit="개"              // 단위
  color="blue"           // 색상 (blue/green/purple/orange/red)
/>
```

#### 2. InfoRow (정보 행)
```tsx
<InfoRow 
  label="이름" 
  value="홍길동" 
/>
```

### 색상 시스템
- **민간기업**: 녹색 (`bg-green-100 text-green-800`)
- **공공기관**: 보라색 (`bg-purple-100 text-purple-800`)
- **정부교육기관**: 주황색 (`bg-orange-100 text-orange-800`)
- **기본/합계**: 파란색 (`bg-blue-100 text-blue-800`)

### 반응형 디자인
- **모바일**: 1열 그리드
- **태블릿**: 2열 그리드
- **데스크톱**: 4-6열 그리드

---

## 💾 데이터 구조

### 계정 정보 (SalesPersonInfo)
```typescript
interface SalesPersonInfo {
  id: string;
  role: 'MANAGER' | 'BRANCH_MANAGER' | 'HEAD_MANAGER';
  organizationName?: string;  // 조직명 (지사명/본부명)
  name: string;               // 대표자명
  phone: string;
  email?: string;
}
```

### 매니저 통계 (ManagerStats)
```typescript
interface ManagerStats {
  totalCompanies: number;        // 총 추천기업
  privateCompanies: number;      // 민간기업
  publicCompanies: number;       // 공공기관
  governmentCompanies: number;   // 정부교육기관
}
```

### 지사 통계 (BranchStats)
```typescript
interface BranchStats {
  totalManagers: number;         // 소속 매니저
  totalCompanies: number;        // 총 추천기업
  privateCompanies: number;      // 민간기업
  publicCompanies: number;       // 공공기관
  governmentCompanies: number;   // 정부교육기관
}
```

### 본부 통계 (HeadquartersStats)
```typescript
interface HeadquartersStats {
  totalBranches: number;         // 소속 지사
  totalManagers: number;         // 소속 매니저
  totalCompanies: number;        // 총 추천기업
  privateCompanies: number;      // 민간기업
  publicCompanies: number;       // 공공기관
  governmentCompanies: number;   // 정부교육기관
}
```

---

## 🔐 인증 시스템

### 로컬스토리지 키
- `manager_auth_token`: JWT 토큰
- `manager_info`: 매니저 정보 (백업용)

### 인증 흐름
1. 로그인 → JWT 토큰 발급
2. 토큰을 localStorage에 저장
3. API 요청 시 `Authorization: Bearer {token}` 헤더 포함
4. 토큰 만료 시 로그인 페이지로 리다이렉트

---

## 🧪 테스트 가이드

### 1. 매니저 계정 테스트
```
URL: https://jangpyosa.com/admin/sales
ID: (매니저 전화번호)
PW: (매니저 비밀번호)

확인 사항:
✅ 계정 정보 표시 (이름, 전화번호, 이메일)
✅ 통계 카드 4개 (총/민간/공공/정부)
✅ 추천 기업 리스트 표시
✅ 카테고리 필터링 동작
✅ 기업 정보 테이블 (기업명, 사업자번호, 대표자, 구분, 직원수, 장애인수)
```

### 2. 지사 계정 테스트
```
URL: https://jangpyosa.com/admin/sales
ID: 01089263833
PW: 01089263833

확인 사항:
✅ 지사 정보 표시 (지사명, 지사장명, 전화번호, 이메일)
✅ 통계 카드 5개 (매니저/총/민간/공공/정부)
✅ 소속 매니저 리스트 표시
✅ 매니저별 카테고리 통계 표시 (민간/공공/정부/합계)
```

### 3. 본부 계정 테스트
```
URL: https://jangpyosa.com/admin/sales
ID: 01098949091
PW: 01098949091

확인 사항:
✅ 본부 정보 표시 (본부명, 본부장명, 전화번호, 이메일)
✅ 통계 카드 6개 (지사/매니저/총/민간/공공/정부)
✅ 소속 지사 리스트 표시
✅ 지사별 매니저 수 표시
✅ 지사별 카테고리 통계 표시 (민간/공공/정부/합계)
```

---

## 📊 성과 비교

### Before (기존 대시보드)
❌ 모든 정보가 한 화면에 혼재
❌ 역할별 구분 없이 동일한 정보 표시
❌ 계층 구조 파악 어려움
❌ 통계 정보 부족

### After (신규 대시보드)
✅ 역할별 완전히 분리된 대시보드
✅ 계층 구조 명확히 표시 (본부 > 지사 > 매니저)
✅ 역할별 필요한 정보만 표시
✅ 상세한 통계 및 카테고리 분류
✅ 반응형 디자인으로 모바일 지원
✅ 직관적인 색상 구분

---

## 🚀 배포 정보

### 커밋 정보
```
커밋: 21824af
제목: 🎨 대시보드 전면 재구축: 매니저/지사/본부 대시보드 분리
날짜: 2026-03-02 00:12 KST
```

### 변경 파일
```
apps/web/src/app/admin/sales/dashboard/page.tsx
- 1,112 추가, 805 삭제
- 완전 재작성
```

### 서버 상태
```
서버: 43.201.0.129
PM2 프로세스:
- jangpyosa-api (PID: 85590, 56.9 MB)
- jangpyosa-web (PID: 86713, 58.9 MB)
상태: ✅ 정상 가동 중
```

---

## 📝 주요 기술 스택

- **Frontend**: React 18, Next.js 14, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: Next.js App Router
- **Authentication**: JWT Bearer Token
- **API Communication**: Fetch API

---

## 🔧 유지보수 가이드

### 새로운 통계 추가 시
1. API 엔드포인트에 필드 추가
2. TypeScript 인터페이스 업데이트
3. StatCard 컴포넌트 추가
4. 테스트

### 새로운 역할 추가 시
1. 역할 타입 정의 추가
2. 전용 대시보드 컴포넌트 생성
3. API 엔드포인트 생성
4. 메인 컴포넌트에서 조건부 렌더링 추가

### 디자인 변경 시
- 색상: Tailwind CSS 클래스 수정
- 레이아웃: 그리드 설정 변경 (`grid-cols-*`)
- 아이콘: 이모지 변경

---

## 🔗 관련 문서

- [영업 계정 관리 가이드](./SALES_ACCOUNTS.md)
- [영업 조직 계층 가이드](./SALES_HIERARCHY_GUIDE.md)
- [지사 로그인 가이드](./BRANCH_LOGIN_GUIDE.md)

---

## 📞 지원

문제 발생 시:
1. PM2 로그 확인: `pm2 logs jangpyosa-web`
2. 브라우저 콘솔 확인 (F12)
3. 네트워크 탭에서 API 응답 확인

---

## ✅ 완료 체크리스트

- [x] 매니저 대시보드 구현
- [x] 지사 대시보드 구현
- [x] 본부 대시보드 구현
- [x] API 엔드포인트 연동
- [x] 반응형 디자인 적용
- [x] 색상 시스템 구현
- [x] 인증 시스템 통합
- [x] 빌드 및 배포
- [x] 테스트 완료
- [x] 문서 작성

---

**🎉 모든 대시보드 구현 완료!**

이제 매니저, 지사장, 본부장이 각자의 역할에 맞는 대시보드에서 필요한 정보를 명확하게 확인할 수 있습니다.
