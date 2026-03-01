# 🔔 알림 시스템 완전 가이드

**작성일**: 2026-03-01  
**커밋**: 42d9bd2

---

## 📊 알림 흐름도

### 1️⃣ **관리자 → 직원 알림**

```
관리자 행동                     →  직원 알림
────────────────────────────────────────────────
📢 공지사항 작성                →  ANNOUNCEMENT
📋 업무지시 배정                →  WORK_ORDER
✅ 휴가 승인                    →  LEAVE_APPROVED
❌ 휴가 거부                    →  LEAVE_REJECTED
```

### 2️⃣ **직원 → 관리자 알림**

```
직원 행동                       →  관리자 알림
────────────────────────────────────────────────
🏖️ 휴가 신청                    →  LEAVE_REQUEST
✅ 공지사항 확인                →  ANNOUNCEMENT (확인 통계)
✅ 업무지시 완료                →  WORK_ORDER_COMPLETED (완료 통계)
```

### 3️⃣ **시스템 → 사용자 알림**

```
시스템 이벤트                   →  수신자
────────────────────────────────────────────────
⏰ 출근 시간 알림               →  직원 (ATTENDANCE_REMINDER)
⚠️ 지각/조퇴/결근              →  관리자 (ATTENDANCE_ISSUE)
📆 연차 소멸 예정               →  직원 (LEAVE_EXPIRING)
📊 연차 잔여 부족               →  직원 (LEAVE_LOW_BALANCE)
```

---

## 🔍 **알림 발생 조건 상세**

### 📢 **공지사항 확인 알림 (직원 → 관리자)**

**발생 시점**: 직원이 공지사항을 읽었을 때

**알림 조건** (다음 중 하나):
- ✅ 첫 번째 확인 (1명)
- ✅ 10% 확인
- ✅ 50% 확인
- ✅ 100% 확인 (전체 완료)
- ✅ 마지막 1명 남았을 때

**알림 내용**:
```
제목: ✅ 공지사항 확인됨
메시지: {직원명}님이 "{공지제목}"을(를) 확인했습니다. (5/16명)
링크: /dashboard/announcements/{id}/readers
```

**구현 위치**: `apps/api/src/routes/announcements.ts:418`

---

### 📋 **업무 완료 알림 (직원 → 관리자)**

**발생 시점**: 직원이 업무지시를 확인/완료했을 때

**알림 조건** (다음 중 하나):
- ✅ 첫 번째 확인 (1명)
- ✅ 50% 확인
- ✅ 100% 확인 (전체 완료)
- ✅ 마지막 1명 남았을 때

**알림 내용**:
```
제목: ✅ 업무 완료 확인
메시지: {직원명}님이 "{업무제목}" 업무를 완료했습니다. (8/10명)
링크: /dashboard/work-orders/{id}
```

**구현 위치**: `apps/api/src/routes/work-orders.ts:621`

---

### 🏖️ **휴가 신청 알림 (직원 → 관리자)**

**발생 시점**: 직원이 휴가를 신청했을 때

**알림 조건**: 항상

**알림 내용**:
```
제목: 🏖️ 새로운 휴가 신청
메시지: {직원명}님이 {휴가타입} {일수}일을 신청했습니다. (YYYY-MM-DD ~ YYYY-MM-DD)
링크: /dashboard/leave
우선순위: NORMAL
```

**구현 위치**: `apps/api/src/services/notificationService.ts:295`

---

### ✅ **휴가 승인 알림 (관리자 → 직원)**

**발생 시점**: 관리자가 휴가를 승인했을 때

**알림 조건**: 항상

**알림 내용**:
```
제목: ✅ 휴가 신청이 승인되었습니다
메시지: {휴가타입} {일수}일이 승인되었습니다. (YYYY-MM-DD ~ YYYY-MM-DD)
링크: /employee/leave
우선순위: NORMAL
```

**구현 위치**: `apps/api/src/services/notificationService.ts:321`

---

### ❌ **휴가 거부 알림 (관리자 → 직원)**

**발생 시점**: 관리자가 휴가를 거부했을 때

**알림 조건**: 항상

**알림 내용**:
```
제목: ❌ 휴가 신청이 반려되었습니다
메시지: {휴가타입} {일수}일이 반려되었습니다. (YYYY-MM-DD ~ YYYY-MM-DD)
        사유: {거부사유}
링크: /employee/leave
우선순위: URGENT
```

**구현 위치**: `apps/api/src/services/notificationService.ts:346`

---

## 🔧 **알림 API 엔드포인트**

### 1️⃣ **알림 목록 조회**
```http
GET /notifications?limit=20&offset=0&unreadOnly=true
Authorization: Bearer {token}
```

**응답**:
```json
{
  "notifications": [
    {
      "id": "cmm...",
      "type": "LEAVE_REQUEST",
      "title": "🏖️ 새로운 휴가 신청",
      "message": "김철수님이 연차 2일을 신청했습니다...",
      "link": "/dashboard/leave",
      "read": false,
      "priority": "NORMAL",
      "createdAt": "2026-03-01T04:38:58.117Z",
      "data": {
        "requestId": "cmm...",
        "employeeName": "김철수",
        ...
      }
    }
  ],
  "total": 35,
  "unreadCount": 24,
  "hasMore": true
}
```

---

### 2️⃣ **안읽은 알림 개수 조회**
```http
GET /notifications/unread-count
Authorization: Bearer {token}
```

**응답**:
```json
{
  "total": 24,
  "byType": {
    "LEAVE_REQUEST": 2,
    "LEAVE_APPROVED": 2,
    "LEAVE_REJECTED": 0,
    "WORK_ORDER": 13,
    "ANNOUNCEMENT": 9,
    "ATTENDANCE_REMINDER": 0,
    "ATTENDANCE_ISSUE": 0
  }
}
```

---

### 3️⃣ **알림 읽음 처리**
```http
PUT /notifications/{id}/read
Authorization: Bearer {token}
```

**응답**:
```json
{
  "notification": {
    "id": "cmm...",
    "read": true,
    "readAt": "2026-03-01T05:00:00.000Z",
    ...
  }
}
```

---

### 4️⃣ **모든 알림 읽음 처리**
```http
PUT /notifications/mark-all-read
Authorization: Bearer {token}
```

**응답**:
```json
{
  "success": true,
  "count": 24
}
```

---

### 5️⃣ **타입별 알림 읽음 처리**
```http
PUT /notifications/mark-type-read
Authorization: Bearer {token}
Content-Type: application/json

{
  "types": ["ANNOUNCEMENT", "WORK_ORDER"]
}
```

**응답**:
```json
{
  "success": true,
  "count": 22
}
```

---

## 📝 **알림 타입 전체 목록**

```typescript
enum NotificationType {
  // 휴가 관련
  LEAVE_REQUEST = 'LEAVE_REQUEST',           // 휴가 신청
  LEAVE_APPROVED = 'LEAVE_APPROVED',         // 휴가 승인
  LEAVE_REJECTED = 'LEAVE_REJECTED',         // 휴가 반려
  LEAVE_EXPIRING = 'LEAVE_EXPIRING',         // 연차 소멸 예정
  LEAVE_LOW_BALANCE = 'LEAVE_LOW_BALANCE',   // 연차 잔여 부족
  
  // 업무 관련
  WORK_ORDER_ASSIGNED = 'WORK_ORDER_ASSIGNED',     // 업무 배정
  WORK_ORDER_COMPLETED = 'WORK_ORDER_COMPLETED',   // 업무 완료
  WORK_ORDER_FEEDBACK = 'WORK_ORDER_FEEDBACK',     // 업무 피드백
  
  // 근태 관련
  ATTENDANCE_REMINDER = 'ATTENDANCE_REMINDER',     // 출근 알림
  ATTENDANCE_ISSUE = 'ATTENDANCE_ISSUE',           // 근태 이슈
  
  // 급여 관련
  SALARY_ISSUED = 'SALARY_ISSUED',                 // 급여 명세서
  INCENTIVE_ISSUED = 'INCENTIVE_ISSUED',           // 장려금 지급
  
  // 공지 관련
  ANNOUNCEMENT = 'ANNOUNCEMENT',                   // 공지사항
  
  // 시스템
  SYSTEM = 'SYSTEM',                               // 시스템 알림
}
```

---

## 🎯 **현재 구현 상태**

| 알림 타입 | 발신 | 수신 | 구현 | 비고 |
|----------|------|------|------|------|
| **LEAVE_REQUEST** | 직원 | 관리자 | ✅ | 휴가 신청 시 |
| **LEAVE_APPROVED** | 관리자 | 직원 | ✅ | 휴가 승인 시 |
| **LEAVE_REJECTED** | 관리자 | 직원 | ✅ | 휴가 거부 시 |
| **ANNOUNCEMENT** | 시스템 | 직원 | ✅ | 공지 작성 시 (목업 데이터) |
| **ANNOUNCEMENT** (확인) | 직원 | 관리자 | ✅ | 공지 확인 시 (NEW!) |
| **WORK_ORDER** | 시스템 | 직원 | ✅ | 업무 배정 시 (목업 데이터) |
| **WORK_ORDER_COMPLETED** | 직원 | 관리자 | ✅ | 업무 완료 시 (NEW!) |
| **ATTENDANCE_ISSUE** | 시스템 | 관리자 | 🔧 | 근태 이상 시 (함수만 준비) |
| **ATTENDANCE_REMINDER** | 시스템 | 직원 | 🔧 | 출근 시간 알림 (함수만 준비) |
| **LEAVE_EXPIRING** | 시스템 | 직원 | 🔧 | 연차 소멸 예정 (함수만 준비) |

---

## 📊 **현재 알림 통계**

### 전체 알림
- **총 알림**: 681개
- **안읽음**: 657개
- **읽음**: 24개

### 타입별 알림
- **ANNOUNCEMENT**: 285개
- **WORK_ORDER**: 141개
- **LEAVE_APPROVED**: 8개

### 사용자별 알림 예시

#### 관리자 (김관리자)
```json
{
  "total": 2,
  "byType": {
    "LEAVE_REQUEST": 2,  // 직원들의 휴가 신청
    "WORK_ORDER": 0,
    "ANNOUNCEMENT": 0
  }
}
```

#### 직원 (김철수)
```json
{
  "total": 24,
  "byType": {
    "ANNOUNCEMENT": 9,        // 공지사항
    "WORK_ORDER": 13,         // 업무지시
    "LEAVE_APPROVED": 2       // 휴가 승인
  }
}
```

---

## 🚀 **사용 예시**

### 직원이 공지를 확인하는 경우

```javascript
// 1. 직원이 공지 확인 API 호출
POST /announcements/{id}/read
Authorization: Bearer {employee_token}

// 2. 시스템이 읽음 기록 생성
// 3. 읽음 통계 계산 (5/16명)
// 4. 조건 확인 (첫 확인? 50%? 100%?)
// 5. 관리자에게 알림 생성 ✅
// 6. 프론트엔드 사이드바에 🔔 표시
```

### 직원이 업무를 완료하는 경우

```javascript
// 1. 직원이 업무 확인 API 호출
POST /work-orders/{id}/confirm
Authorization: Bearer {employee_token}
Body: { "note": "완료했습니다" }

// 2. 시스템이 확인 기록 생성
// 3. 확인 통계 계산 (8/10명)
// 4. 조건 확인 (첫 확인? 50%? 100%?)
// 5. 관리자에게 알림 생성 ✅
// 6. 프론트엔드 사이드바에 🔔 표시
```

---

## 🎉 **최종 정리**

### ✅ **완료된 기능**
1. ✅ 휴가 신청 → 관리자 알림
2. ✅ 휴가 승인/거부 → 직원 알림
3. ✅ 공지사항 확인 → 관리자 알림 (통계 포함)
4. ✅ 업무지시 완료 → 관리자 알림 (통계 포함)
5. ✅ 목업 데이터 알림 생성 (681개)
6. ✅ 알림 API (목록, 카운트, 읽음 처리)

### 🔧 **준비된 기능 (함수 구현 완료)**
1. 🔧 근태 이상 알림 (지각/조퇴/결근)
2. 🔧 출근 시간 알림
3. 🔧 연차 소멸 예정 알림

### 📝 **알림 흐름 요약**
```
관리자 ←→ 직원 양방향 알림 완성!

관리자 → 직원:
  - 공지사항, 업무지시, 휴가 승인/거부

직원 → 관리자:
  - 휴가 신청, 공지 확인, 업무 완료

시스템 → 사용자:
  - 근태 관련, 연차 관련 (준비 완료)
```

---

**작성자**: Claude Code  
**배포 상태**: ✅ 배포 완료 (PID 57256)  
**테스트**: ✅ API 정상 작동 확인
