# 알림 시스템 완전 가이드

## 📋 목차
1. [알림 시스템 개요](#알림-시스템-개요)
2. [알림 로직 설명](#알림-로직-설명)
3. [테스트 방법](#테스트-방법)
4. [API 엔드포인트](#api-엔드포인트)
5. [문제 해결](#문제-해결)

---

## 알림 시스템 개요

### 알림 유형

#### 1. 휴가 관련 알림 ✅ (완전 작동)
- **`LEAVE_REQUEST`**: 직원 → 관리자 (휴가 신청 시)
- **`LEAVE_APPROVED`**: 관리자 → 직원 (휴가 승인 시)
- **`LEAVE_REJECTED`**: 관리자 → 직원 (휴가 거부 시)

#### 2. 공지사항 알림 ✅ (신규 추가)
- **`ANNOUNCEMENT`**: 관리자가 공지 생성 → 모든 직원에게 즉시 알림
- **`ANNOUNCEMENT_READ_50%`**: 직원들이 읽음 처리 → 50% 이상 읽으면 관리자에게 알림

#### 3. 업무지시 알림 ✅ (신규 추가)
- **`WORK_ORDER`**: 관리자가 업무 생성 → 모든 직원에게 즉시 알림
- **`WORK_ORDER_CONFIRMED_50%`**: 직원들이 완료 처리 → 50% 이상 완료 시 관리자에게 알림

#### 4. 근태 관련 알림 ⚠️ (예약)
- **`ATTENDANCE_REMINDER`**: 출근 시간 지나도 기록 없으면 알림
- **`ATTENDANCE_ISSUE`**: 지각/조퇴 발생 시 관리자 알림

---

## 알림 로직 설명

### 1. 공지사항 알림 흐름

```
[관리자가 공지 생성]
         ↓
[직원 전체에게 ANNOUNCEMENT 알림 전송] ← notifyNewAnnouncement()
         ↓
[직원들이 공지 확인 (읽음 처리)]
         ↓
[읽음 비율 계산: readCount / totalEmployees]
         ↓
[비율 >= 50%] → [관리자에게 "공지사항 확인 현황" 알림] ← notifyAnnouncementRead()
```

**구현 위치**: `apps/api/src/routes/announcements.ts`
```typescript
// 직원이 공지 읽음 처리
router.post('/:id/read', requireAuth, async (req, res) => {
  // ... 읽음 로그 생성 ...
  
  // 전체 직원 수 조회
  const totalEmployees = await prisma.disabledEmployee.count({
    where: { buyerId: announcement.buyerId }
  });
  
  // 읽음 수 조회
  const readCount = await prisma.announcementReadLog.count({
    where: { announcementId: id }
  });
  
  // 읽음 비율 계산
  const readPercentage = (readCount / totalEmployees) * 100;
  
  // 50% 이상 읽었으면 관리자에게 알림
  if (readPercentage >= 50 && !announcement._notified50) {
    await notifyAnnouncementRead(
      announcement.buyerId,
      announcement.id,
      announcement.title,
      readCount,
      totalEmployees,
      Math.round(readPercentage)
    );
  }
});
```

### 2. 업무지시 알림 흐름

```
[관리자가 업무 생성]
         ↓
[직원 전체에게 WORK_ORDER 알림 전송] ← notifyNewWorkOrder()
         ↓
[직원들이 업무 완료 (확인 처리)]
         ↓
[완료 비율 계산: confirmCount / totalEmployees]
         ↓
[비율 >= 50%] → [관리자에게 "업무 완료 현황" 알림] ← notifyWorkOrderCompleted()
```

**구현 위치**: `apps/api/src/routes/work-orders.ts`
```typescript
// 직원이 업무 완료 처리
router.post('/:id/confirm', requireAuth, async (req, res) => {
  // ... 완료 로그 생성 ...
  
  // 전체 직원 수 조회
  const totalEmployees = await prisma.disabledEmployee.count({
    where: { buyerId: workOrder.buyerId }
  });
  
  // 완료 수 조회
  const confirmCount = await prisma.workOrderConfirmation.count({
    where: { workOrderId: id }
  });
  
  // 완료 비율 계산
  const confirmPercentage = (confirmCount / totalEmployees) * 100;
  
  // 50% 이상 완료했으면 관리자에게 알림
  if (confirmPercentage >= 50 && !workOrder._notified50) {
    await notifyWorkOrderCompleted(
      workOrder.buyerId,
      workOrder.id,
      workOrder.title,
      confirmCount,
      totalEmployees,
      Math.round(confirmPercentage)
    );
  }
});
```

### 3. 휴가 알림 흐름 (기존)

```
[직원이 휴가 신청]
         ↓
[관리자에게 LEAVE_REQUEST 알림] ← notifyLeaveRequest()
         ↓
[관리자가 승인/거부]
         ↓
[직원에게 LEAVE_APPROVED/REJECTED 알림] ← notifyLeaveApproved() / notifyLeaveRejected()
```

---

## 테스트 방법

### 전제 조건
- 비밀번호: `test1234` (목업 계정 전체)
- 관리자 전화번호: `01010000001`
- 직원 전화번호: `01010010001` ~ `01010010010`

### 1. 관리자 알림 테스트

```bash
# 관리자 로그인
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"01010000001","password":"test1234"}'
  
# 응답에서 accessToken 추출 → $MANAGER_TOKEN

# 알림 개수 확인
curl "http://localhost:4000/notifications/unread-count?byType=true" \
  -H "Authorization: Bearer $MANAGER_TOKEN"
  
# 최근 알림 5개 조회
curl "http://localhost:4000/notifications?limit=5" \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

### 2. 직원 알림 테스트

```bash
# 직원 로그인
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"01010010001","password":"test1234"}'
  
# 응답에서 accessToken 추출 → $EMPLOYEE_TOKEN

# 알림 개수 확인
curl "http://localhost:4000/notifications/unread-count?byType=true" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN"
  
# 공지사항 조회 (⚠️ 주의: /announcements/my-announcements)
curl "http://localhost:4000/announcements/my-announcements?limit=5" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN"
  
# 공지 읽음 처리
curl -X POST "http://localhost:4000/announcements/{공지ID}/read" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
  -H "Content-Type: application/json"
  
# 업무지시 조회
curl "http://localhost:4000/work-orders?limit=5" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN"
  
# 업무 완료 처리
curl -X POST "http://localhost:4000/work-orders/{업무ID}/confirm" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note":"완료했습니다"}'
```

### 3. 50% 알림 트리거 테스트

목업 데이터에는 회사당 약 10명의 직원이 있으므로, **5명 이상이 읽음/완료 처리**하면 관리자에게 알림이 갑니다.

```bash
# 5개 계정으로 공지 읽음 처리
for phone in 01010010001 01010010002 01010010003 01010010004 01010010005; do
  TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"identifier\":\"$phone\",\"password\":\"test1234\"}" \
    | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
  
  # 첫 번째 공지 읽음
  ANNOUNCEMENT_ID=$(curl -s "http://localhost:4000/announcements/my-announcements?limit=1" \
    -H "Authorization: Bearer $TOKEN" \
    | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  curl -s -X POST "http://localhost:4000/announcements/$ANNOUNCEMENT_ID/read" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json"
done

# 관리자 알림 확인
curl "http://localhost:4000/notifications/unread-count?byType=true" \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

---

## API 엔드포인트

### 인증
- **POST `/auth/login`**: 로그인 (identifier, password)

### 알림
- **GET `/notifications/unread-count`**: 읽지 않은 알림 개수
  - Query: `byType=true` → 유형별 개수 반환
- **GET `/notifications`**: 알림 목록
  - Query: `limit=20`, `offset=0`, `unreadOnly=false`
- **PUT `/notifications/:id/read`**: 알림 읽음 처리
- **PUT `/notifications/mark-all-read`**: 모든 알림 읽음 처리
- **PUT `/notifications/mark-type-read`**: 특정 유형 알림 읽음 처리
  - Body: `{ types: ["ANNOUNCEMENT", "WORK_ORDER"] }`

### 공지사항 (직원)
- **GET `/announcements/my-announcements`**: 내 공지사항 목록
- **POST `/announcements/:id/read`**: 공지 읽음 처리

### 업무지시 (직원)
- **GET `/work-orders`**: 내 업무지시 목록
- **POST `/work-orders/:id/confirm`**: 업무 완료 처리
  - Body: `{ note?: "완료 메모" }`

### 공지사항 (관리자)
- **GET `/announcements/list`**: 공지 목록 (읽음 통계 포함)
- **GET `/announcements/:id/readers`**: 읽은 직원 목록
- **POST `/announcements`**: 공지 생성
- **PUT `/announcements/:id`**: 공지 수정
- **DELETE `/announcements/:id`**: 공지 삭제

### 업무지시 (관리자)
- **GET `/work-orders/list`**: 업무 목록 (완료 통계 포함)
- **POST `/work-orders`**: 업무 생성
- **PUT `/work-orders/:id`**: 업무 수정
- **DELETE `/work-orders/:id`**: 업무 삭제

---

## 문제 해결

### 1. 알림이 안 뜨는 경우

#### 체크리스트:
1. ✅ **로그인 성공 여부 확인**
   ```bash
   curl -X POST http://localhost:4000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"identifier":"01010000001","password":"test1234"}'
   ```
   
2. ✅ **알림 API 응답 확인**
   ```bash
   curl "http://localhost:4000/notifications/unread-count?byType=true" \
     -H "Authorization: Bearer $TOKEN"
   ```
   
3. ✅ **DB에 알림 데이터 존재 여부**
   ```javascript
   const notifs = await prisma.notification.findMany({
     where: { userId: 'YOUR_USER_ID' },
     orderBy: { createdAt: 'desc' },
     take: 10
   });
   console.log(notifs);
   ```

### 2. 공지사항/업무지시가 안 보이는 경우

#### 원인:
- ❌ 잘못된 API 경로 사용
  - `/company-announcements` (X)
  - `/announcements/my-announcements` (O)

#### 해결:
```bash
# 올바른 경로 사용
curl "http://localhost:4000/announcements/my-announcements?limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. 50% 알림이 안 오는 경우

#### 원인:
1. 직원 수가 부족 (5명 미만)
2. 이미 50% 알림이 전송됨 (중복 방지)
3. buyerId 불일치

#### 해결:
```javascript
// DB에서 전체 직원 수 확인
const totalEmployees = await prisma.disabledEmployee.count({
  where: { buyerId: 'YOUR_BUYER_ID' }
});

// 읽음 수 확인
const readCount = await prisma.announcementReadLog.count({
  where: { announcementId: 'YOUR_ANNOUNCEMENT_ID' }
});

console.log(`읽음 비율: ${(readCount/totalEmployees)*100}%`);
```

---

## 요약

### ✅ 완료된 기능
1. 휴가 신청 → 관리자 알림
2. 휴가 승인/거부 → 직원 알림
3. 공지 생성 → 직원 전체 알림
4. 공지 50% 읽음 → 관리자 알림
5. 업무 생성 → 직원 전체 알림
6. 업무 50% 완료 → 관리자 알림

### ⚠️ 예약된 기능
1. 출근 시간 지각 → 관리자 알림
2. 조퇴 발생 → 관리자 알림
3. 근태 이상 → 관리자 알림

### 🔧 다음 작업
1. 프론트엔드 알림 UI 연결
2. 실시간 WebSocket 알림 (선택)
3. 푸시 알림 (선택)
4. 이메일/SMS 알림 (선택)
