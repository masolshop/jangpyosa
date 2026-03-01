# 근태 알림 시스템 설계

## 📋 요구사항

### 1. 지각 알림
- **트리거**: 09:30 이후에도 출근 기록이 없는 직원
- **수신자**: 기업 관리자
- **알림 타입**: `ATTENDANCE_ISSUE`
- **알림 내용**: "김철수님이 아직 출근하지 않았습니다 (09:30 기준)"

### 2. 조퇴 알림
- **트리거**: 17:00 이전에 퇴근 처리한 직원
- **수신자**: 기업 관리자
- **알림 타입**: `ATTENDANCE_ISSUE`
- **알림 내용**: "김철수님이 조퇴했습니다 (14:30 퇴근)"

### 3. 무단결근 알림
- **트리거**: 하루 종일 출근 기록이 없는 직원
- **수신자**: 기업 관리자
- **알림 타입**: `ATTENDANCE_REMINDER`
- **알림 내용**: "김철수님이 오늘 출근하지 않았습니다"

---

## 🏗️ 구현 방식

### 방식 1: 실시간 체크 (선택)
- 출근/퇴근 API 호출 시 즉시 체크
- 장점: 실시간 반응
- 단점: API 부하 증가

### 방식 2: 스케줄러 (권장) ✅
- Cron job으로 정기적으로 체크
- 09:30, 12:00, 18:00에 일괄 체크
- 장점: 효율적, 확장 가능
- 단점: 약간의 지연

### 선택: 하이브리드
- 조퇴는 실시간 체크 (퇴근 시)
- 지각/무단결근은 스케줄러

---

## 🔧 기술 스택

### Node-Cron
```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

### Cron 스케줄
```javascript
// 평일 09:30 - 지각 체크
'30 9 * * 1-5'

// 평일 18:00 - 무단결근 체크
'0 18 * * 1-5'
```

---

## 📝 구현 계획

### 1단계: notificationService에 알림 함수 추가
```typescript
// apps/api/src/services/notificationService.ts

/**
 * 지각 알림
 */
export async function notifyAttendanceLate(
  buyerId: string,
  employeeName: string,
  employeeId: string,
  currentTime: string
) {
  // 관리자 찾기
  const managers = await prisma.user.findMany({
    where: {
      role: 'BUYER',
      company: { buyerProfile: { id: buyerId } }
    }
  });
  
  // 알림 생성
  await createBulkNotifications(
    managers.map(m => m.id),
    {
      type: NotificationType.ATTENDANCE_ISSUE,
      title: '⏰ 지각 발생',
      message: `${employeeName}님이 아직 출근하지 않았습니다 (${currentTime} 기준)`,
      link: '/dashboard/attendance',
      priority: NotificationPriority.NORMAL,
      category: NotificationCategory.GENERAL,
      data: { employeeId, type: 'late', time: currentTime }
    }
  );
}

/**
 * 조퇴 알림
 */
export async function notifyAttendanceEarlyLeave(
  buyerId: string,
  employeeName: string,
  employeeId: string,
  leaveTime: string
) {
  const managers = await prisma.user.findMany({
    where: {
      role: 'BUYER',
      company: { buyerProfile: { id: buyerId } }
    }
  });
  
  await createBulkNotifications(
    managers.map(m => m.id),
    {
      type: NotificationType.ATTENDANCE_ISSUE,
      title: '🚶 조퇴 발생',
      message: `${employeeName}님이 조퇴했습니다 (${leaveTime} 퇴근)`,
      link: '/dashboard/attendance',
      priority: NotificationPriority.NORMAL,
      category: NotificationCategory.GENERAL,
      data: { employeeId, type: 'early_leave', time: leaveTime }
    }
  );
}

/**
 * 무단결근 알림
 */
export async function notifyAttendanceAbsent(
  buyerId: string,
  employeeName: string,
  employeeId: string,
  date: string
) {
  const managers = await prisma.user.findMany({
    where: {
      role: 'BUYER',
      company: { buyerProfile: { id: buyerId } }
    }
  });
  
  await createBulkNotifications(
    managers.map(m => m.id),
    {
      type: NotificationType.ATTENDANCE_REMINDER,
      title: '❌ 무단결근',
      message: `${employeeName}님이 오늘 출근하지 않았습니다 (${date})`,
      link: '/dashboard/attendance',
      priority: NotificationPriority.HIGH,
      category: NotificationCategory.GENERAL,
      data: { employeeId, type: 'absent', date }
    }
  );
}
```

### 2단계: attendance.ts에 조퇴 체크 추가
```typescript
// apps/api/src/routes/attendance.ts

// 퇴근 처리
router.post('/clock-out', requireAuth, async (req, res) => {
  try {
    // ... 기존 로직 ...
    
    // 조퇴 체크 (17:00 이전)
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    if (hour < 17) {
      // 조퇴 알림
      const employee = await prisma.disabledEmployee.findUnique({
        where: { id: employeeId },
        select: { name: true, buyerId: true }
      });
      
      if (employee) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        await notifyAttendanceEarlyLeave(
          employee.buyerId,
          employee.name,
          employeeId,
          timeStr
        );
      }
    }
    
    // ... 퇴근 처리 계속 ...
  } catch (error) {
    // ...
  }
});
```

### 3단계: 스케줄러 생성
```typescript
// apps/api/src/schedulers/attendanceScheduler.ts

import cron from 'node-cron';
import { prisma } from '../index.js';
import {
  notifyAttendanceLate,
  notifyAttendanceAbsent
} from '../services/notificationService.js';

/**
 * 지각 체크 (평일 09:30)
 */
export function scheduleAttendanceLateCheck() {
  cron.schedule('30 9 * * 1-5', async () => {
    console.log('[Attendance Scheduler] 지각 체크 시작');
    
    const today = new Date().toISOString().split('T')[0];
    
    // 모든 활성 직원 조회
    const employees = await prisma.disabledEmployee.findMany({
      where: {
        user: { role: 'EMPLOYEE' }
      },
      select: {
        id: true,
        name: true,
        buyerId: true,
        attendanceRecords: {
          where: { date: today },
          select: { clockIn: true }
        }
      }
    });
    
    // 출근 기록이 없는 직원 필터링
    const lateEmployees = employees.filter(e => 
      !e.attendanceRecords.some(r => r.clockIn)
    );
    
    // 알림 전송
    for (const emp of lateEmployees) {
      await notifyAttendanceLate(
        emp.buyerId,
        emp.name,
        emp.id,
        '09:30'
      );
    }
    
    console.log(`[Attendance Scheduler] 지각 알림 ${lateEmployees.length}건 전송`);
  }, {
    timezone: 'Asia/Seoul'
  });
}

/**
 * 무단결근 체크 (평일 18:00)
 */
export function scheduleAttendanceAbsentCheck() {
  cron.schedule('0 18 * * 1-5', async () => {
    console.log('[Attendance Scheduler] 무단결근 체크 시작');
    
    const today = new Date().toISOString().split('T')[0];
    
    const employees = await prisma.disabledEmployee.findMany({
      where: {
        user: { role: 'EMPLOYEE' }
      },
      select: {
        id: true,
        name: true,
        buyerId: true,
        attendanceRecords: {
          where: { date: today },
          select: { id: true }
        }
      }
    });
    
    // 근태 기록이 없는 직원
    const absentEmployees = employees.filter(e => 
      e.attendanceRecords.length === 0
    );
    
    for (const emp of absentEmployees) {
      await notifyAttendanceAbsent(
        emp.buyerId,
        emp.name,
        emp.id,
        today
      );
    }
    
    console.log(`[Attendance Scheduler] 무단결근 알림 ${absentEmployees.length}건 전송`);
  }, {
    timezone: 'Asia/Seoul'
  });
}

/**
 * 모든 스케줄러 시작
 */
export function startAttendanceSchedulers() {
  scheduleAttendanceLateCheck();
  scheduleAttendanceAbsentCheck();
  console.log('[Attendance Scheduler] 근태 스케줄러 시작됨');
}
```

### 4단계: index.ts에 스케줄러 등록
```typescript
// apps/api/src/index.ts

import { startAttendanceSchedulers } from './schedulers/attendanceScheduler.js';

// ... 기존 코드 ...

// 서버 시작 후 스케줄러 실행
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // 근태 스케줄러 시작
  startAttendanceSchedulers();
});
```

---

## 🧪 테스트 계획

### 테스트 1: 조퇴 알림
```bash
# 17:00 이전에 퇴근 처리
curl -X POST http://localhost:4000/attendance/clock-out \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location": {"latitude": 37.5665, "longitude": 126.9780},
    "note": "테스트 조퇴"
  }'

# 관리자 알림 확인
curl http://localhost:4000/notifications?limit=1 \
  -H "Authorization: Bearer $MANAGER_TOKEN"

# 예상: "김철수님이 조퇴했습니다 (14:30 퇴근)"
```

### 테스트 2: 지각 알림 (수동 트리거)
```javascript
// apps/api/src/routes/attendance.ts에 테스트 엔드포인트 추가
router.post('/test/check-late', requireAuth, async (req, res) => {
  const { runAttendanceLateCheck } = await import('../schedulers/attendanceScheduler.js');
  await runAttendanceLateCheck();
  res.json({ message: '지각 체크 완료' });
});
```

### 테스트 3: 무단결근 알림 (수동 트리거)
```javascript
router.post('/test/check-absent', requireAuth, async (req, res) => {
  const { runAttendanceAbsentCheck } = await import('../schedulers/attendanceScheduler.js');
  await runAttendanceAbsentCheck();
  res.json({ message: '무단결근 체크 완료' });
});
```

---

## 📊 예상 결과

### 관리자 알림 화면
```
🔔 알림 3개

⏰ 지각 발생
김철수님이 아직 출근하지 않았습니다 (09:30 기준)
10분 전

🚶 조퇴 발생
이영희님이 조퇴했습니다 (14:30 퇴근)
1시간 전

❌ 무단결근
박민수님이 오늘 출근하지 않았습니다 (2026-03-01)
2시간 전
```

---

## 🎯 다음 단계

1. ✅ node-cron 설치
2. ✅ notificationService에 3개 함수 추가
3. ✅ attendance.ts에 조퇴 체크 추가
4. ✅ attendanceScheduler.ts 생성
5. ✅ index.ts에 스케줄러 등록
6. ✅ 테스트 엔드포인트 추가
7. ✅ 배포 및 검증

---

**작성일**: 2026-03-01  
**상태**: 설계 완료, 구현 준비
