# 🌏 한국 시간(KST) 적용 가이드

## 📋 개요

장표사닷컴 API의 모든 시간은 **한국 시간(KST, UTC+9)**으로 강제 적용됩니다.

## 🔧 한국 시간 유틸리티

**파일**: `apps/api/src/utils/kst.ts`

### 주요 함수

```typescript
// 현재 한국 시간
const kstNow = getKSTNow(); // Date 객체 (KST)

// 한국 시간을 문자열로 변환
const kstDate = getKSTDate(); // "2026-02-22" (YYYY-MM-DD)
const kstDateTime = getKSTDateTime(); // "2026-02-22 15:30:45" (YYYY-MM-DD HH:MM:SS)
const kstTime = getKSTTime(); // "15:30:45" (HH:MM:SS)

// UTC Date를 한국 시간으로 변환
const utcDate = new Date(); // UTC
const kstDate = toKST(utcDate); // KST Date 객체

// 한국 시간 문자열을 UTC Date로 변환
const kstDateString = "2026-02-22";
const utcDate = parseKSTDate(kstDateString);

// 한국 시간 기준 오늘
const todayStart = getKSTTodayStart(); // 00:00:00 KST
const todayEnd = getKSTTodayEnd(); // 23:59:59 KST

// 한국 시간 기준 현재 연/월/일/시/분/초
const year = getKSTYear(); // 2026
const month = getKSTMonth(); // 1-12
const day = getKSTDay(); // 1-31
const hour = getKSTHour(); // 0-23
const minute = getKSTMinute(); // 0-59
const second = getKSTSecond(); // 0-59
```

## 📍 적용 범위

### 1. 출퇴근 기록 (`apps/api/src/routes/attendance.ts`)

```typescript
// 출근 시각 (한국 시간)
const today = getKSTDate(); // "2026-02-22"
const clockInTime = getKSTTime(); // "09:00:00"

// 출근 기록 저장
await prisma.attendanceRecord.create({
  data: {
    date: today, // 한국 시간 날짜
    clockIn: clockInTime, // 한국 시간
    // ...
  }
});
```

### 2. 초대 코드 (`apps/api/src/routes/team.ts`)

```typescript
// 만료일 설정 (한국 시간 기준 7일 후)
const expiresAt = getKSTNow();
expiresAt.setUTCDate(expiresAt.getUTCDate() + 7);

await prisma.teamInvitation.create({
  data: {
    expiresAt, // 한국 시간 기준
    // ...
  }
});

// 만료 검증 (한국 시간 기준)
const kstNow = getKSTNow();
if (kstNow > new Date(invitation.expiresAt)) {
  // 만료됨
}
```

### 3. 회원가입 (`apps/api/src/routes/auth.ts`)

```typescript
// 개인정보 동의 시각 (한국 시간)
await prisma.user.create({
  data: {
    privacyAgreedAt: getKSTNow(), // 한국 시간
    // ...
  }
});
```

### 4. 서버 시작 시 정리 (`apps/api/src/index.ts`)

```typescript
app.listen(port, async () => {
  // 만료된 초대 코드 정리 (한국 시간 기준)
  const kstNow = getKSTNow();
  await prisma.teamInvitation.deleteMany({
    where: {
      expiresAt: { lt: kstNow },
      isUsed: false
    }
  });
});
```

### 5. Cron Job 스크립트 (`apps/api/src/scripts/cleanup-expired-invitations.mjs`)

```javascript
function getKSTNow() {
  const KST_OFFSET = 9 * 60 * 60 * 1000; // UTC+9
  return new Date(Date.now() + KST_OFFSET);
}

const kstNow = getKSTNow();
console.log(`📅 현재 한국 시간: ${kstNow.toISOString().replace('T', ' ').substring(0, 19)} KST`);
```

## 🕐 시간 계산 예시

### 예시 1: 출근 시각

```typescript
// 서버 UTC 시간: 2026-02-22 06:30:00 UTC
// 한국 시간: 2026-02-22 15:30:00 KST (UTC+9)

const kstNow = getKSTNow(); // 2026-02-22 15:30:00 KST
const clockInTime = getKSTTime(); // "15:30:00"
const today = getKSTDate(); // "2026-02-22"
```

### 예시 2: 초대 코드 만료

```typescript
// 생성 시각 (한국 시간): 2026-02-22 10:00:00 KST
// 만료 시각 (7일 후): 2026-03-01 10:00:00 KST

const expiresAt = getKSTNow(); // 2026-02-22 10:00:00 KST
expiresAt.setUTCDate(expiresAt.getUTCDate() + 7); // 2026-03-01 10:00:00 KST

// 검증 (한국 시간)
const kstNow = getKSTNow(); // 현재 한국 시간
if (kstNow > expiresAt) {
  console.log('만료됨');
}
```

## 📊 데이터베이스 저장

### Prisma 모델

```prisma
model AttendanceRecord {
  id           String   @id @default(cuid())
  employeeId   String
  date         String   // YYYY-MM-DD (KST)
  clockIn      String?  // HH:MM:SS (KST)
  clockOut     String?  // HH:MM:SS (KST)
  createdAt    DateTime @default(now()) // UTC (Prisma 기본)
  updatedAt    DateTime @updatedAt       // UTC (Prisma 기본)
}

model TeamInvitation {
  id           String    @id @default(cuid())
  inviteCode   String    @unique
  expiresAt    DateTime  // KST Date 객체로 저장
  usedAt       DateTime? // KST Date 객체로 저장
  createdAt    DateTime  @default(now()) // UTC (Prisma 기본)
}
```

### 주의사항

- **날짜 문자열 (date, clockIn, clockOut)**: 한국 시간 기준 문자열 저장
- **DateTime 필드 (createdAt, updatedAt)**: Prisma 기본 동작은 UTC이지만, 코드에서 `getKSTNow()` 사용 시 한국 시간 저장
- **expiresAt, usedAt**: 한국 시간 Date 객체로 저장 및 비교

## 🔍 디버깅

### 현재 한국 시간 확인

```typescript
const kstNow = getKSTNow();
console.log('한국 시간:', getKSTDateTime()); // "2026-02-22 15:30:45"
console.log('UTC 시간:', new Date().toISOString()); // "2026-02-22T06:30:45.000Z"
console.log('시간 차이:', (kstNow.getTime() - Date.now()) / (60 * 60 * 1000), '시간'); // 9시간
```

### 로그 출력

```bash
# 서버 로그에서 한국 시간 확인
pm2 logs jangpyosa-api --nostream | grep "한국"

# 출력 예시:
# 🗑️  만료된 초대 코드 0개 자동 삭제 완료 (한국 시간 기준)
# 📅 현재 한국 시간: 2026-02-22 15:30:45 KST
```

## ⚠️ 주의사항

1. **항상 `getKSTNow()` 사용**
   - ❌ `new Date()` - UTC 시간
   - ✅ `getKSTNow()` - 한국 시간

2. **날짜 비교 시 한국 시간 기준**
   ```typescript
   // ❌ 잘못된 방법
   if (new Date() > invitation.expiresAt) { }
   
   // ✅ 올바른 방법
   if (getKSTNow() > invitation.expiresAt) { }
   ```

3. **Prisma @default(now())는 UTC**
   - `createdAt DateTime @default(now())` → UTC 시간
   - 코드에서 명시적으로 설정 시 `getKSTNow()` 사용

4. **타임존 변환 필요 시**
   ```typescript
   // UTC → KST
   const kstDate = toKST(utcDate);
   
   // KST → UTC
   const utcDate = toUTC(kstDate);
   ```

## 📝 마이그레이션 가이드

기존 코드에서 한국 시간으로 전환하려면:

```typescript
// Before (UTC)
const now = new Date();
const today = now.toISOString().split('T')[0];
const time = now.toTimeString().split(' ')[0];

// After (KST)
import { getKSTNow, getKSTDate, getKSTTime } from '../utils/kst.js';

const now = getKSTNow();
const today = getKSTDate();
const time = getKSTTime();
```

## 🚀 프로덕션 배포

```bash
# 1. 코드 Pull
cd /home/ubuntu/jangpyosa
git pull origin main

# 2. API 재시작
pm2 restart jangpyosa-api

# 3. 한국 시간 동작 확인
pm2 logs jangpyosa-api --nostream | grep "한국"
```

## 📚 관련 파일

- `apps/api/src/utils/kst.ts` - 한국 시간 유틸리티
- `apps/api/src/routes/attendance.ts` - 출퇴근 기록 (한국 시간 적용)
- `apps/api/src/routes/team.ts` - 초대 코드 (한국 시간 적용)
- `apps/api/src/routes/auth.ts` - 회원가입 (한국 시간 적용)
- `apps/api/src/index.ts` - 서버 시작 시 정리 (한국 시간 적용)
- `apps/api/src/scripts/cleanup-expired-invitations.mjs` - Cron Job (한국 시간 적용)

---

**작성일**: 2026-02-22  
**작성자**: AI Developer  
**버전**: 1.0.0  
**타임존**: KST (Korea Standard Time, UTC+9)
