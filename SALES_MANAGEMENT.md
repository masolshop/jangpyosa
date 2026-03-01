# 영업 관리 페이지 구현 완료

## 📋 개요

슈퍼어드민이 매니저, 지사장, 본부장을 관리할 수 있는 영업 관리 페이지를 구현했습니다.

## 🔗 URL

- **영업 관리 페이지**: https://jangpyosa.com/admin/sales-management
- **슈퍼어드민 대시보드**: https://jangpyosa.com/admin
- **슈퍼어드민 로그인**: https://jangpyosa.com/admin/login (ID: 01063529091, PW: admin123)

## ✨ 주요 기능

### 1. 영업 인원 목록 조회
- 매니저, 지사장, 본부장 전체 목록 표시
- 각 인원의 상세 정보:
  - 이름, 역할, 전화번호, 이메일
  - 추천 고객 수 (전체/활성)
  - 총 매출액
  - 커미션
  - 활성화 상태
  - 상위 관리자 정보

### 2. 필터 및 검색
- **역할 필터**: 전체 / 매니저 / 지사장 / 본부장
- **검색**: 이름, 전화번호, 이메일로 검색

### 3. 등업 기능
- **매니저 → 지사장**: "↑ 지사장" 버튼 클릭
- **지사장 → 본부장**: "↑ 본부장" 버튼 클릭
- 등업 시 확인 메시지 표시
- 등업 이력 자동 기록 (SalesActivityLog)

### 4. 활성화/비활성화
- 활성 상태 토글 버튼
- 비활성화 시 사유 자동 기록
- 활성화 상태에 따른 시각적 표시

## 🎨 UI/UX

### 역할별 색상 코드
- **본부장**: 빨강 (#d32f2f)
- **지사장**: 주황 (#f57c00)
- **매니저**: 파랑 (#1976d2)

### 테이블 구조
| 이름 | 역할 | 전화번호 | 이메일 | 추천 고객 | 총 매출 | 커미션 | 상태 | 관리 |
|------|------|---------|--------|----------|---------|--------|------|------|

### 알림 메시지
- **성공**: 초록색 배경에 체크 아이콘
- **에러**: 빨간색 배경에 경고 아이콘
- 3초 후 자동 사라짐

## 🔧 API 엔드포인트

### GET /sales/people
영업 인원 목록 조회
- 권한: SUPER_ADMIN
- 쿼리 파라미터: role, managerId, isActive, search
- 응답: salesPeople 배열

### POST /sales/people/:id/promote
영업 인원 등업
- 권한: SUPER_ADMIN
- Body: { newRole, reason }
- 등업 규칙:
  - MANAGER → BRANCH_MANAGER
  - BRANCH_MANAGER → HEAD_MANAGER
- 활동 로그 자동 기록

### POST /sales/people/:id/toggle-active
활성화/비활성화
- 권한: SUPER_ADMIN
- Body: { isActive, inactiveReason }
- 활동 로그 자동 기록

## 📊 데이터 모델

### SalesPerson
```typescript
{
  id: string
  userId: string
  name: string
  phone: string
  email?: string
  role: 'MANAGER' | 'BRANCH_MANAGER' | 'HEAD_MANAGER'
  managerId?: string
  manager?: SalesPerson
  subordinates: SalesPerson[]
  referralCode: string
  referralLink: string
  totalReferrals: number
  activeReferrals: number
  totalRevenue: number
  commission: number
  isActive: boolean
  promotedAt?: Date
  promotedBy?: string
  createdAt: Date
}
```

### SalesActivityLog
```typescript
{
  id: string
  salesPersonId?: string
  adminUserId: string
  action: 'PROMOTION' | 'DEMOTION' | 'TRANSFER' | 'STATUS_CHANGE' | 'REFERRAL_ADDED'
  fromValue?: string
  toValue?: string
  reason?: string
  notes?: string
  createdAt: Date
}
```

## 🔐 권한 관리

- **슈퍼어드민만 접근 가능**
- AdminLayout에서 SUPER_ADMIN 권한 체크
- API 엔드포인트에서 requireRole('SUPER_ADMIN') 미들웨어 사용

## 🧪 테스트 시나리오

### 1. 영업 관리 페이지 접근
1. 슈퍼어드민으로 로그인 (01063529091 / admin123)
2. 대시보드에서 "영업 관리" 카드 클릭
3. 영업 관리 페이지 표시 확인

### 2. 매니저 목록 조회
1. 3명의 테스트 매니저 표시 확인
   - 김영희 (01012345001)
   - 이철수 (01012345002)
   - 박민수 (01012345003)
2. 각 매니저의 정보 확인 (역할: MANAGER, 활성 상태)

### 3. 매니저 등업
1. 김영희 매니저 행의 "↑ 지사장" 버튼 클릭
2. 확인 메시지: "정말 지사장으로 등업하시겠습니까?"
3. 확인 클릭
4. 성공 메시지 표시
5. 김영희의 역할 배지가 "지사장"으로 변경
6. 이제 "↑ 본부장" 버튼 표시

### 4. 지사장 등업
1. 김영희 지사장 행의 "↑ 본부장" 버튼 클릭
2. 확인 후 본부장으로 등업
3. 역할 배지 색상이 빨강으로 변경
4. 더 이상 등업 버튼 없음 (최고 직급)

### 5. 활성화/비활성화
1. 이철수 매니저 행의 "비활성화" 버튼 클릭
2. 확인 메시지 표시
3. 상태가 "비활성"으로 변경 (빨간 배경)
4. 버튼이 "활성화"로 변경
5. 다시 클릭하여 활성화

### 6. 필터 및 검색
1. 역할 필터에서 "매니저" 선택 → 매니저만 표시
2. 역할 필터에서 "지사장" 선택 → 지사장만 표시
3. 검색창에 "김영희" 입력 → 김영희만 표시
4. 검색창에 "010123" 입력 → 해당 번호 포함 인원 표시

## 📝 주요 변경 사항

### 프론트엔드
- `/apps/web/src/app/admin/sales-management/page.tsx` (새 파일)
  - 영업 관리 페이지 컴포넌트
  - 목록, 필터, 검색, 등업, 활성화 UI
- `/apps/web/src/app/admin/page.tsx`
  - 영업 관리 링크 변경: `/admin/sales` → `/admin/sales-management`

### 백엔드
- `/apps/api/src/routes/sales.ts`
  - `POST /sales/people/:id/toggle-active` 추가
  - 활성화/비활성화 및 로그 기록

## 🚀 배포 정보

- **커밋**: f69dde5 - "👥 영업 관리 페이지 추가"
- **배포 시간**: 약 45초 (API 빌드 + Web 빌드 + PM2 재시작)
- **PM2 재시작**: 36번째 (jangpyosa-api), 35번째 (jangpyosa-web)

## 🔗 관련 문서

- [슈퍼어드민 계정 정보](/home/user/webapp/SUPER_ADMIN_ACCOUNT.md)
- [테스트 매니저 계정 정보](/home/user/webapp/TEST_MANAGER_ACCOUNTS.md)

## 📌 다음 단계 제안

1. **통계 대시보드**: 영업 인원별 실적 차트
2. **조직도 보기**: 계층 구조 시각화
3. **커미션 정산**: 매출 기반 커미션 자동 계산
4. **실적 목표 설정**: 월별 목표 설정 및 달성률
5. **알림 시스템**: 등업, 실적 달성 알림
6. **엑셀 내보내기**: 영업 인원 데이터 엑셀 다운로드
7. **일괄 처리**: 여러 인원 동시 관리
