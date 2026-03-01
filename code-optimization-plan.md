# 🚀 코드 최적화 계획 - 3.1절 기념

## 📊 현재 상태 분석

### 1. 프론트엔드 (Next.js)
- **폴링**: 30초마다 알림 개수 조회
- **상태 관리**: useState 분산 관리
- **API 호출**: 중복 호출 가능성

### 2. 백엔드 (Express + Prisma)
- **N+1 문제**: recipients, reads 조회 시 반복 쿼리
- **인덱스**: 일부 테이블에 인덱스 부족
- **캐싱**: Redis 캐싱 부분적 적용

### 3. 데이터베이스
- **쿼리 최적화**: JOIN 최적화 필요
- **인덱스 추가**: 자주 조회되는 필드
- **정리**: 사용하지 않는 테이블/필드

---

## 🎯 최적화 목표

### 우선순위 1 (Critical)
1. ✅ N+1 쿼리 문제 해결
2. ✅ 데이터베이스 인덱스 추가
3. ✅ 중복 API 호출 제거

### 우선순위 2 (Important)
4. 🔄 프론트엔드 리렌더링 최적화
5. 🔄 API 응답 캐싱 강화
6. 🔄 불필요한 데이터 전송 최소화

### 우선순위 3 (Nice to have)
7. 📝 코드 정리 및 주석 개선
8. 📝 타입 안정성 강화
9. 📝 에러 핸들링 표준화

---

## 🛠️ 구체적 최적화 항목

### A. 데이터베이스 최적화

#### 인덱스 추가
```sql
-- WorkOrderRecipient
CREATE INDEX idx_workorder_recipient_workorder ON WorkOrderRecipient(workOrderId);
CREATE INDEX idx_workorder_recipient_user ON WorkOrderRecipient(userId);
CREATE INDEX idx_workorder_recipient_status ON WorkOrderRecipient(status);

-- AnnouncementRead
CREATE INDEX idx_announcement_read_announcement ON AnnouncementRead(announcementId);
CREATE INDEX idx_announcement_read_user ON AnnouncementRead(userId);

-- Notification
CREATE INDEX idx_notification_user_read ON Notification(userId, read);
CREATE INDEX idx_notification_type_read ON Notification(type, read);
CREATE INDEX idx_notification_created ON Notification(createdAt DESC);

-- AttendanceRecord
CREATE INDEX idx_attendance_employee_date ON AttendanceRecord(employeeId, date);
CREATE INDEX idx_attendance_date ON AttendanceRecord(date);

-- LeaveRequest
CREATE INDEX idx_leave_employee_status ON LeaveRequest(employeeId, status);
CREATE INDEX idx_leave_company_status ON LeaveRequest(companyId, status);
```

### B. 백엔드 쿼리 최적화

#### Work Orders - N+1 해결
```typescript
// ❌ 기존: N+1 쿼리
const workOrders = await prisma.workOrder.findMany({
  include: { recipients: true }
});
for (const wo of workOrders) {
  for (const r of wo.recipients) {
    const user = await prisma.user.findUnique({ where: { id: r.userId } });
    // N+1 발생!
  }
}

// ✅ 최적화: 단일 쿼리
const workOrders = await prisma.workOrder.findMany({
  include: {
    recipients: {
      include: {
        user: { select: { id: true, name: true } }
      }
    }
  }
});
```

#### Announcements - 집계 최적화
```typescript
// ❌ 기존: 여러 쿼리
const totalEmployees = await prisma.disabledEmployee.count({ where: { buyerId } });
const reads = await prisma.announcementRead.findMany({ where: { announcementId } });
const readCount = reads.length;

// ✅ 최적화: 단일 쿼리
const [totalEmployees, readCount] = await Promise.all([
  prisma.disabledEmployee.count({ where: { buyerId } }),
  prisma.announcementRead.count({ where: { announcementId } })
]);
```

### C. 프론트엔드 최적화

#### 1. 폴링 최적화
```typescript
// ❌ 기존: 무조건 30초마다
setInterval(fetchUnreadCount, 30000);

// ✅ 최적화: 조건부 폴링
- 탭이 활성화되어 있을 때만
- 네트워크 상태 확인
- 에러 발생 시 백오프
```

#### 2. 메모이제이션
```typescript
// React.memo, useMemo, useCallback 활용
const MemoizedComponent = React.memo(Component);
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => { doSomething(a, b); }, [a, b]);
```

#### 3. 레이지 로딩
```typescript
// 컴포넌트 레이지 로딩
const WorkOrderDetail = dynamic(() => import('./WorkOrderDetail'), {
  loading: () => <Spinner />
});
```

### D. API 응답 최적화

#### 페이지네이션
```typescript
// 무한 스크롤 대신 커서 기반 페이지네이션
GET /work-orders?cursor=abc123&limit=20
```

#### 선택적 필드
```typescript
// 필요한 필드만 요청
GET /work-orders?fields=id,title,createdAt
```

### E. 코드 정리

#### 1. 중복 코드 제거
- 공통 유틸리티 함수 추출
- 중복 컴포넌트 통합

#### 2. 타입 안정성
- any 타입 제거
- 엄격한 타입 체크

#### 3. 에러 핸들링
- 통일된 에러 응답 형식
- 에러 로깅 개선

---

## 📅 실행 계획

### Phase 1: 즉시 적용 (오늘)
1. ✅ 데이터베이스 인덱스 추가
2. ✅ Work Orders N+1 쿼리 해결
3. ✅ Announcements N+1 쿼리 해결

### Phase 2: 단기 (1주일)
4. 프론트엔드 메모이제이션
5. API 캐싱 강화
6. 불필요한 코드 제거

### Phase 3: 중기 (1개월)
7. 전체 리팩토링
8. 성능 모니터링
9. 테스트 커버리지

---

## 📊 예상 성능 개선

| 항목 | 현재 | 목표 | 개선율 |
|------|------|------|--------|
| API 응답 시간 | ~200ms | ~50ms | 75% ↓ |
| DB 쿼리 수 | ~10개 | ~3개 | 70% ↓ |
| 페이지 로딩 | ~2s | ~0.5s | 75% ↓ |
| 메모리 사용 | 100MB | 60MB | 40% ↓ |

---

## 🎯 3.1절 기념 백업

### 백업 내용
1. 전체 코드베이스
2. 데이터베이스 스키마
3. 환경 설정
4. 문서화

### 백업 형식
```
장표사닷컴-3.1절-백업-2026.tar.gz
├── code/           # 전체 소스 코드
├── database/       # DB 스키마 + 샘플 데이터
├── docs/           # 문서
└── README.md       # 백업 정보
```
