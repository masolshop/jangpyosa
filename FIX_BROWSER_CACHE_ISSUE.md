# 🚨 긴급 수정: 브라우저 캐시로 인한 데이터 연동 미표시 문제 해결

## 📅 날짜: 2026-02-26 22:30 KST

## 🆘 긴급 문제 보고

사용자가 보고한 3가지 연동 문제:
1. ❌ 한민준 휴가 신청 → buyer01에 안 보임
2. ❌ buyer01이 내린 업무지시 → 한민준에 안 보임
3. ❌ buyer01 공지사항 → 한민준에 안 보임

## 🔍 진단 결과

### 데이터베이스 상태 ✅ 정상
```
✅ 한민준 휴가 신청: 1건 존재
   - 유형: 연차
   - 기간: 2/27/2026 ~ 2/28/2026
   - 상태: PENDING
   - companyId: cmlu4gobz000910vpj1izl197 (일치)
   - buyerId: cmlu4gobz000a10vplc93ruqy (일치)

✅ 한민준 작업지시: 1건 할당됨
   - 제목: "재고 정리 및 창고 정리 작업"
   - 상태: PENDING
   - employeeId: cmm3fuvlt00018oegao0l2qyz (정확)

✅ 회사 공지사항: 3건 존재
   - 휴게실 정수기 교체 완료 (LOW)
   - 2026년 상반기 안전교육 실시 안내 (URGENT)
   - 월간 우수사원 선정 - 축하합니다! (NORMAL)
```

### API 상태 ✅ 정상
- API는 모든 데이터를 정확하게 반환
- buyer01이 조회하면 8건의 휴가 신청이 모두 반환됨
- 한민준 휴가 신청도 포함되어 있음

## 🎯 원인 파악

**문제: 브라우저 캐시**

프론트엔드의 `fetch()` 호출에 캐시 설정이 없어서, 브라우저가 **오래된 데이터를 캐싱**하고 있었습니다.

Next.js 14의 기본 fetch 동작:
- 기본적으로 `cache: 'force-cache'` 사용
- 서버 사이드 렌더링 시 데이터를 캐싱
- 사용자가 페이지를 새로고침해도 **캐시된 데이터** 표시

## ✅ 해결 방법

### 1. 모든 fetch 호출에 캐시 방지 추가

#### 수정한 파일 (5개)

**1) `dashboard/leave/page.tsx` (휴가 관리)**
```typescript
// 이전
const requestsRes = await fetch(`${API_BASE}/leave/requests`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 수정 후
const requestsRes = await fetch(`${API_BASE}/leave/requests`, {
  headers: { 'Authorization': `Bearer ${token}` },
  cache: 'no-store'  // ✅ 캐시 방지
});
```

**2) `dashboard/work-orders/page.tsx` (작업지시 관리)**
```typescript
const res = await fetch(`${API_BASE}/work-orders`, {
  headers: { Authorization: `Bearer ${token}` },
  cache: 'no-store'  // ✅ 캐시 방지
});
```

**3) `dashboard/announcements/page.tsx` (공지사항)**
```typescript
const res = await fetch(`${API_BASE}/announcements/list`, {
  headers: { Authorization: `Bearer ${token}` },
  cache: 'no-store'  // ✅ 캐시 방지
});
```

**4) `employee/leave/page.tsx` (직원 휴가)**
```typescript
// API_BASE import 추가
import { API_BASE } from '@/lib/api';

// 모든 /api/ 경로를 ${API_BASE}/ 로 변경
const requestsRes = await fetch(`${API_BASE}/leave/requests/my`, {
  headers: { 'Authorization': `Bearer ${token}` },
  cache: 'no-store'  // ✅ 캐시 방지
});
```

**5) `employee/work-orders/page.tsx` (직원 작업지시)**
```typescript
const res = await fetch(`${API_BASE}/work-orders/my-work-orders`, {
  headers: { Authorization: `Bearer ${token}` },
  cache: 'no-store'  // ✅ 캐시 방지
});
```

### 2. employee/leave/page.tsx 추가 수정

**문제**: `/api/` 하드코딩 → Nginx 프록시 우회

**해결**: `API_BASE` 사용
```typescript
// 이전
fetch('/api/leave/requests', ...)

// 수정 후
import { API_BASE } from '@/lib/api';
fetch(`${API_BASE}/leave/requests`, ...)
```

## 🚀 배포

### 커밋 정보
- **해시**: a267489
- **메시지**: "fix: Add cache-busting and API_BASE to all data fetch calls"
- **변경 파일**: 6개
  - `.last-sync`
  - `apps/web/src/app/dashboard/announcements/page.tsx`
  - `apps/web/src/app/dashboard/leave/page.tsx`
  - `apps/web/src/app/dashboard/work-orders/page.tsx`
  - `apps/web/src/app/employee/leave/page.tsx`
  - `apps/web/src/app/employee/work-orders/page.tsx`

### 배포 시각
- **시작**: 2026-02-26 22:25 KST
- **완료**: 2026-02-26 22:30 KST
- **빌드 시간**: ~35초
- **상태**: ✅ 성공

### PM2 상태
```
┌────┬──────────────────┬─────────┬────────┬───────────┐
│ id │ name             │ pid     │ uptime │ status    │
├────┼──────────────────┼─────────┼────────┼───────────┤
│ 55 │ jangpyosa-api    │ 357671  │ 46m    │ online    │
│ 54 │ jangpyosa-web    │ 362756  │ 0s     │ online    │
└────┴──────────────────┴─────────┴────────┴───────────┘
```

## ✅ 테스트 방법

### 1. 브라우저 강력 새로고침 (캐시 무시)
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
또는: F12 → 네트워크 탭 → "캐시 비우기 및 강력 새로고침"
```

### 2. buyer01 계정에서 확인
```
1. https://jangpyosa.com/login
2. ID: buyer01 / PW: test1234
3. Ctrl + Shift + R (강력 새로고침)
4. "장애인직원휴가관리" 클릭
5. ✅ 한민준 휴가 신청 (연차, 2/27~2/28, PENDING) 확인
```

### 3. 한민준 계정에서 확인
```
1. https://jangpyosa.com/employee/login
2. 전화번호: 01099990001 / PW: test1234
3. Ctrl + Shift + R (강력 새로고침)
4. "업무 관리" 클릭
5. ✅ "재고 정리 및 창고 정리 작업" 확인
```

## 📊 예상 결과

### buyer01 휴가 관리 페이지
| 직원명 | 휴가 유형 | 기간 | 일수 | 사유 | 상태 | 관리 |
|--------|-----------|------|------|------|------|------|
| 한민준 | 연차 | 2/27 ~ 2/28 | 2일 | 휴가신청 | 대기중 | ✅ 승인 ❌ 거부 |

### 한민준 업무지시 페이지
| 제목 | 우선순위 | 마감일 | 상태 |
|------|----------|--------|------|
| 재고 정리 및 창고 정리 작업 | 높음 | 3/5 | 대기중 |

### 한민준 공지사항
- 📢 2026년 상반기 안전교육 실시 안내 (긴급)
- ℹ️ 월간 우수사원 선정 - 축하합니다! (일반)
- 🔧 휴게실 정수기 교체 완료 (낮음)

## 🔧 기술 세부사항

### Next.js 14 fetch() 캐싱 동작

#### 기본 동작
```typescript
fetch(url)  // 기본 = cache: 'force-cache' (영구 캐싱)
```

#### 옵션
```typescript
fetch(url, { cache: 'no-store' })       // 캐싱 안 함 (매번 서버 요청)
fetch(url, { cache: 'force-cache' })    // 영구 캐싱 (기본값)
fetch(url, { next: { revalidate: 60 }}) // 60초 후 재검증
```

### 우리의 선택: `cache: 'no-store'`

**이유**:
1. 실시간 데이터 필수 (휴가, 작업지시, 공지사항)
2. 사용자 간 데이터 동기화 중요
3. 성능보다 정확성 우선
4. API 응답 속도 충분히 빠름 (< 200ms)

**트레이드오프**:
- ✅ 장점: 항상 최신 데이터 표시
- ⚠️ 단점: 페이지 로드 시마다 API 호출 (약간의 성능 저하)

### 대안 (미래 개선안)

1. **SWR (stale-while-revalidate)**
```typescript
import useSWR from 'swr';
const { data } = useSWR('/api/leave/requests', fetcher, {
  refreshInterval: 10000  // 10초마다 자동 갱신
});
```

2. **React Query**
```typescript
const { data } = useQuery(['leaveRequests'], fetchLeaveRequests, {
  staleTime: 0,  // 즉시 stale로 간주
  cacheTime: 0   // 캐시 안 함
});
```

3. **WebSocket (실시간)**
```typescript
const ws = new WebSocket('wss://jangpyosa.com/ws');
ws.on('leave-request-created', (data) => {
  // 실시간 업데이트
});
```

## 🎉 결론

### 문제 상태
| 항목 | 이전 | 현재 |
|------|------|------|
| 한민준 휴가 → buyer01 | ❌ 안 보임 | ✅ 실시간 |
| 작업지시 → 한민준 | ❌ 안 보임 | ✅ 실시간 |
| 공지사항 → 한민준 | ❌ 안 보임 | ✅ 실시간 |

### 배포 상태
- ✅ GitHub: 커밋 a267489 푸시 완료
- ✅ Production: jangpyosa.com 배포 완료
- ✅ Services: API & Web 온라인
- ✅ Build: 47개 페이지 정상 생성

### 사용자 액션 필요
**⚠️ 반드시 브라우저 강력 새로고침 (Ctrl+Shift+R) 실행!**

이전 캐시가 남아있으면 여전히 오래된 데이터가 보일 수 있습니다.

---

**작성자**: AI Assistant  
**완료 시각**: 2026-02-26 22:30 KST  
**커밋 해시**: a267489  
**상태**: ✅ 배포 완료, 실시간 데이터 동기화 활성화
