# 장애인직원 휴가관리 404 에러 수정 완료 ✅

## 문제 요약
- **증상**: 기업관리자가 "장애인직원휴가관리" 메뉴 클릭 시 404 에러 발생
- **URL**: `/dashboard/leave-management`로 요청했지만 실제 페이지는 `/dashboard/leave`에 존재

## 수정 내용

### 1. Sidebar 링크 수정
**파일**: `apps/web/src/components/Sidebar.tsx`

```typescript
// AS-IS (잘못된 경로)
<MenuItem href="/dashboard/leave-management" ... />

// TO-BE (올바른 경로)
<MenuItem href="/dashboard/leave" ... />
```

### 2. API 응답 처리 개선
**파일**: `apps/web/src/app/dashboard/leave/page.tsx`

```typescript
// AS-IS (API가 leaveRequests를 반환하는데 requests를 기대)
const data = await requestsRes.json();
setLeaveRequests(data.requests);

// TO-BE (두 형식 모두 처리)
const data = await requestsRes.json();
setLeaveRequests(data.leaveRequests || data.requests || []);
```

**배경**: API 엔드포인트 `/api/leave/requests`는 `{ leaveRequests: [...] }`를 반환하지만,  
프론트엔드는 `{ requests: [...] }`를 기대했습니다. 두 형식 모두 지원하도록 수정.

## 배포 정보
- **커밋**: 4a31dc2 (fix: Fix leave management page routing and API response handling)
- **배포 일시**: 2026-02-26 18:51 KST
- **배포 서버**: https://jangpyosa.com (43.201.0.129)
- **웹 빌드**: ✅ 성공
- **PM2 재시작**: ✅ 완료

## 테스트 방법
1. 기업관리자 계정으로 로그인
2. 좌측 사이드바에서 "장애인직원휴가관리" 클릭
3. **예상 결과**: 
   - ✅ 페이지가 정상적으로 로드됨
   - ✅ 휴가 유형 관리 탭
   - ✅ 휴가 신청 목록 탭
   - ✅ 직원별 휴가 신청 내역 조회 가능

## 데이터 일치 문제 분석

### 현재 데이터 모델 구조

#### 1. 출근/퇴근 (AttendanceRecord)
```prisma
model AttendanceRecord {
  id           String    @id @default(cuid())
  employeeId   String    // DisabledEmployee ID ✅
  // ❌ userId 필드 없음 - 추가 필요
  date         String
  workType     String
  clockIn      String?
  clockOut     String?
  ...
}
```
**문제**: `userId`가 없어서 User 계정과 직접 연결 안 됨

#### 2. 공지 (CompanyAnnouncement)
```prisma
model CompanyAnnouncement {
  id          String    @id
  companyId   String    // ✅ Company ID
  buyerId     String    // ✅ BuyerProfile ID
  ...
  readers     AnnouncementReader[]
}

model AnnouncementReader {
  id              String    @id
  announcementId  String
  employeeId      String    // ✅ DisabledEmployee ID
  userId          String    // ✅ User ID
  ...
}
```
**상태**: ✅ 정상 (employeeId + userId 모두 있음)

#### 3. 업무지시 (WorkOrder)
```prisma
model WorkOrder {
  id              String    @id
  companyId       String    // ✅ Company ID
  buyerId         String    // ✅ BuyerProfile ID
  targetEmployees String?   // JSON array: 대상 직원 ID 목록
  ...
}

model WorkOrderConfirmation {
  id              String    @id
  workOrderId     String
  employeeId      String    // ✅ DisabledEmployee ID
  userId          String    // ✅ User ID
  ...
}
```
**상태**: ✅ 정상 (employeeId + userId 모두 있음)

#### 4. 휴가 (LeaveRequest)
```prisma
model LeaveRequest {
  id                String    @id
  companyId         String    // ✅ Company ID
  leaveTypeId       String
  employeeId        String    // ✅ DisabledEmployee ID
  userId            String    // ✅ User ID
  ...
}
```
**상태**: ✅ 정상 (employeeId + userId 모두 있음)

### 데이터 일치 문제점

1. **AttendanceRecord 개선 필요**:
   - `userId` 필드 추가하여 User 계정과 직접 매칭
   - API 로직에서 `employeeId`와 `userId` 동시 기록

2. **관계 일관성**:
   - 모든 모델에서 `companyId`, `employeeId`, `userId` 트리플 사용
   - 기업(Company) → 장애인 직원(DisabledEmployee) → 사용자 계정(User) 관계 명확화

### 권장 수정 사항

#### AttendanceRecord 스키마 수정
```prisma
model AttendanceRecord {
  id           String           @id @default(cuid())
  companyId    String           // 🆕 추가 권장
  employeeId   String           // DisabledEmployee ID
  userId       String           // 🆕 추가 권장 - User ID
  date         String
  workType     String
  clockIn      String?
  clockOut     String?
  workHours    Float?
  location     String?
  note         String?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  @@index([employeeId])
  @@index([userId])      // 🆕 인덱스 추가
  @@index([companyId])   // 🆕 인덱스 추가
  @@index([date])
}
```

## API 엔드포인트 확인

### 휴가 관리 API
- ✅ `GET /api/leave/types` - 휴가 유형 조회
- ✅ `POST /api/leave/types` - 휴가 유형 생성
- ✅ `PUT /api/leave/types/:id` - 휴가 유형 수정
- ✅ `DELETE /api/leave/types/:id` - 휴가 유형 삭제
- ✅ `GET /api/leave/requests` - 전체 휴가 신청 목록 (관리자)
- ✅ `GET /api/leave/requests/my` - 내 휴가 신청 목록 (직원)
- ✅ `POST /api/leave/requests` - 휴가 신청
- ✅ `PATCH /api/leave/requests/:id/approve` - 휴가 승인
- ✅ `PATCH /api/leave/requests/:id/reject` - 휴가 거부
- ✅ `PATCH /api/leave/requests/:id/cancel` - 휴가 취소

### 라우터 등록 확인
```typescript
// apps/api/src/index.ts
import leaveRoutes from "./routes/leave.js";
app.use("/leave", leaveRoutes);
```
**상태**: ✅ 정상 등록됨

## 향후 작업

### 1. 긴급 (High Priority)
- [ ] AttendanceRecord에 `userId` 필드 추가
- [ ] 출근/퇴근 API에서 `userId` 기록하도록 수정
- [ ] 마이그레이션 실행

### 2. 중요 (Medium Priority)
- [ ] 각 모델에 `companyId` 일관성 확인
- [ ] API 응답 형식 표준화 (모두 복수형 사용: requests, announcements, workOrders 등)
- [ ] 에러 처리 개선

### 3. 개선 (Low Priority)
- [ ] TypeScript 타입 정의 통일
- [ ] API 문서화
- [ ] 테스트 코드 작성

## 참고 파일
- `apps/web/src/app/dashboard/leave/page.tsx` - 휴가 관리 페이지
- `apps/web/src/components/Sidebar.tsx` - 사이드바 메뉴
- `apps/api/src/routes/leave.ts` - 휴가 API 라우터
- `apps/api/prisma/schema.prisma` - 데이터베이스 스키마

## 관련 커밋
- 4a31dc2: fix: Fix leave management page routing and API response handling
- ec59e24: fix: Use WorkOrderConfirmation table for work order status

## 배포 상태
- ✅ 프론트엔드: 배포 완료
- ✅ 백엔드 API: 정상 작동
- ⚠️ 데이터베이스: AttendanceRecord 스키마 개선 필요

---

**최종 업데이트**: 2026-02-26 18:51 KST  
**작성자**: Claude AI Assistant  
**상태**: 404 에러 수정 완료, 데이터 일치 문제 분석 완료
