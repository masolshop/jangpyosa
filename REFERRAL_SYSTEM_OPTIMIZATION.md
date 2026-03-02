# 추천 시스템 로직 테스트 및 최적화 가이드

## 📊 현재 시스템 구조

### 1. 추천 플로우
```
고용의무기업 가입
  ↓
매니저 핸드폰 입력 (referrerPhone)
  ↓
User.referredById 연결
  ↓
통계 자동 집계
  ↓
매니저 => 지사 => 본부
```

### 2. 데이터 모델

#### User (매니저)
```prisma
model User {
  id            String
  phone         String  @unique
  role          Role    // AGENT (매니저)
  branch        Branch? @relation(fields: [branchId])
  branchId      String?
  refCode       String? // 추천 코드
  
  // 추천 관계
  referredBy    User?   @relation("Referrals", fields: [referredById])
  referredById  String?
  referrals     User[]  @relation("Referrals")
}
```

#### Company (기업)
```prisma
model Company {
  id          String
  name        String
  bizNo       String    @unique
  type        CompanyType // BUYER, SUPPLIER
  buyerType   BuyerType?  // PRIVATE_COMPANY, PUBLIC_INSTITUTION, GOVERNMENT
  
  ownerUser   User      @relation(fields: [ownerUserId])
  ownerUserId String
}
```

## ✅ 현재 잘 구현된 부분

### 1. 매니저 기반 추천 연결
- ✅ BUYER 가입 시 `referrerPhone` 입력
- ✅ 매니저 자동 매칭 (`role: AGENT`)
- ✅ `User.referredById` 연결

**코드 위치:** `apps/api/src/routes/auth.ts:452-464`

```typescript
// 추천인 매니저 확인 (핸드폰 번호로 매칭)
let referredBy = null;
if (body.referrerPhone) {
  const cleanReferrerPhone = normalizePhone(body.referrerPhone);
  referredBy = await prisma.user.findFirst({
    where: { phone: cleanReferrerPhone, role: "AGENT" },
    include: { branch: true },
  });
}

// User 생성 시 referredById 설정
const user = await prisma.user.create({
  data: {
    // ...
    referredById: referredBy?.id,
  },
});
```

### 2. 계층 구조
- ✅ 매니저 => 지사 연결 (`User.branchId`)
- ✅ 지사 => 본부 계층 구조

## 🔧 개선이 필요한 부분

### 1. 추천 통계 API 부족

현재 추천 데이터는 저장되지만 조회 API가 없습니다.

#### 필요한 API:

**a) 매니저 추천 통계**
```typescript
GET /api/agent/stats
Response: {
  totalReferrals: 10,        // 총 추천 수
  activeReferrals: 8,         // 활성 고객
  thisMonthReferrals: 3,      // 이번 달 추천
  totalRevenue: 5000000,      // 총 매출 (옵션)
  commission: 500000          // 총 커미션 (옵션)
}
```

**b) 매니저 추천 기업 목록**
```typescript
GET /api/agent/referrals
Response: {
  referrals: [
    {
      id: "user-id",
      company: {
        name: "주식회사 ABC",
        bizNo: "123-45-67890",
        buyerType: "PRIVATE_COMPANY"
      },
      createdAt: "2026-03-01T10:00:00Z",
      isActive: true
    }
  ]
}
```

**c) 지사 통계**
```typescript
GET /api/branch/:branchId/stats
Response: {
  branchName: "서울지사",
  totalManagers: 5,
  totalReferrals: 50,
  activeReferrals: 40,
  thisMonthReferrals: 15,
  topManagers: [...]
}
```

**d) 본부 전체 통계**
```typescript
GET /api/headquarters/stats
Response: {
  totalBranches: 10,
  totalManagers: 50,
  totalReferrals: 500,
  byBranch: [...],
  byMonth: [...]
}
```

### 2. 실시간 통계 업데이트

현재는 가입 시에만 `referredById`가 설정됩니다. 추가 필요사항:

- 추천 성공 시 매니저에게 알림
- 지사/본부 대시보드 실시간 업데이트
- 월별/분기별 통계 자동 집계

## 🚀 최적화 구현 방안

### 1. 추천 통계 API 추가

**파일:** `apps/api/src/routes/agent-stats.ts` (신규)

```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// 매니저 통계
router.get('/stats', authenticate, requireRole('AGENT'), async (req, res) => {
  const userId = req.user!.id;
  
  // 추천한 사용자 조회
  const referrals = await prisma.user.findMany({
    where: {
      referredById: userId,
      role: 'BUYER'
    },
    include: {
      company: {
        select: {
          name: true,
          bizNo: true,
          buyerType: true,
          isVerified: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  // 통계 계산
  const totalReferrals = referrals.length;
  const activeReferrals = referrals.filter(r => r.company?.isVerified).length;
  
  // 이번 달 추천
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthReferrals = referrals.filter(
    r => new Date(r.createdAt) >= startOfMonth
  ).length;
  
  res.json({
    totalReferrals,
    activeReferrals,
    thisMonthReferrals,
    referrals: referrals.map(r => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      company: r.company,
      createdAt: r.createdAt
    }))
  });
});

// 지사 통계
router.get('/branch/:branchId/stats', authenticate, async (req, res) => {
  const { branchId } = req.params;
  
  // 지사의 모든 매니저
  const managers = await prisma.user.findMany({
    where: {
      branchId,
      role: 'AGENT'
    },
    include: {
      _count: {
        select: {
          referrals: true
        }
      }
    }
  });
  
  // 지사 전체 추천 수
  const totalReferrals = managers.reduce(
    (sum, m) => sum + m._count.referrals, 
    0
  );
  
  res.json({
    branchId,
    totalManagers: managers.length,
    totalReferrals,
    managers: managers.map(m => ({
      id: m.id,
      name: m.name,
      phone: m.phone,
      totalReferrals: m._count.referrals
    })).sort((a, b) => b.totalReferrals - a.totalReferrals)
  });
});

export default router;
```

**app.ts에 라우터 추가:**
```typescript
import agentStatsRouter from './routes/agent-stats';
app.use('/api/agent', agentStatsRouter);
```

### 2. 프론트엔드: 매니저 대시보드

**파일:** `apps/web/src/app/agent/dashboard/page.tsx` (신규)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function AgentDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await apiFetch('/agent/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">📊 내 추천 통계</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard
          title="총 추천 수"
          value={stats.totalReferrals}
          icon="👥"
        />
        <StatCard
          title="활성 고객"
          value={stats.activeReferrals}
          icon="✅"
        />
        <StatCard
          title="이번 달"
          value={stats.thisMonthReferrals}
          icon="📅"
        />
      </div>

      {/* 추천 기업 목록 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">추천 기업 목록</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">회사명</th>
              <th className="text-left p-3">담당자</th>
              <th className="text-left p-3">유형</th>
              <th className="text-left p-3">가입일</th>
              <th className="text-left p-3">상태</th>
            </tr>
          </thead>
          <tbody>
            {stats.referrals.map((ref: any) => (
              <tr key={ref.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{ref.company?.name || 'N/A'}</td>
                <td className="p-3">{ref.name}</td>
                <td className="p-3">{ref.company?.buyerType || 'N/A'}</td>
                <td className="p-3">
                  {new Date(ref.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3">
                  {ref.company?.isVerified ? (
                    <span className="text-green-600">✅ 활성</span>
                  ) : (
                    <span className="text-gray-400">대기</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}
```

### 3. 실시간 알림 시스템

가입 성공 시 매니저에게 알림:

```typescript
// apps/api/src/routes/auth.ts - BUYER 가입 후 추가

if (referredBy) {
  // 매니저에게 알림 생성
  await prisma.notification.create({
    data: {
      userId: referredBy.id,
      type: 'REFERRAL_SUCCESS',
      title: '🎉 새로운 추천 고객',
      message: `${company.name}이(가) 가입했습니다!`,
      link: `/agent/referrals/${user.id}`
    }
  });
}
```

## 📈 테스트 시나리오

### 시나리오 1: 매니저 추천 테스트

1. **매니저 생성**
   ```bash
   POST /api/auth/signup/agent
   {
     "name": "김매니저",
     "phone": "010-1234-5678",
     "email": "manager@example.com",
     "password": "test1234",
     "branchId": "<branch-id>",
     "refCode": "MGR001"
   }
   ```

2. **기업 가입 (매니저 추천)**
   ```bash
   POST /api/auth/signup/buyer
   {
     "username": "company01",
     "password": "test1234",
     "bizNo": "123-45-67890",
     "referrerPhone": "010-1234-5678",  // 매니저 핸드폰
     "buyerType": "PRIVATE_COMPANY",
     "managerName": "이담당",
     "managerTitle": "부장",
     "managerEmail": "manager@company.com",
     "managerPhone": "010-9999-8888",
     "privacyAgreed": true
   }
   ```

3. **추천 통계 확인**
   ```bash
   GET /api/agent/stats
   Authorization: Bearer <manager-token>
   ```

### 시나리오 2: 지사 통계 테스트

1. **지사 통계 조회**
   ```bash
   GET /api/agent/branch/<branch-id>/stats
   Authorization: Bearer <any-token>
   ```

2. **결과 확인**
   - 지사 내 전체 매니저 수
   - 총 추천 수
   - 매니저별 추천 순위

## 🎯 최적화 체크리스트

- [ ] **API 엔드포인트 추가**
  - [ ] GET /api/agent/stats (매니저 통계)
  - [ ] GET /api/agent/referrals (추천 목록)
  - [ ] GET /api/branch/:id/stats (지사 통계)
  - [ ] GET /api/headquarters/stats (본부 통계)

- [ ] **프론트엔드 대시보드**
  - [ ] 매니저 대시보드 (통계 + 추천 목록)
  - [ ] 지사 대시보드 (지사 통계 + 매니저 순위)
  - [ ] 본부 대시보드 (전체 통계 + 지사별 현황)

- [ ] **실시간 업데이트**
  - [ ] 추천 성공 시 매니저 알림
  - [ ] 지사장 실시간 통계 업데이트
  - [ ] WebSocket 또는 polling 구현

- [ ] **데이터 무결성**
  - [ ] 중복 추천 방지
  - [ ] 비활성 매니저 처리
  - [ ] 추천 변경 이력 추적

- [ ] **성능 최적화**
  - [ ] 통계 쿼리 인덱싱
  - [ ] 캐싱 전략 (Redis)
  - [ ] 배치 집계 작업

## 🔍 현재 시스템 확인 방법

### 1. 데이터베이스 직접 확인

```sql
-- 매니저의 추천 수 확인
SELECT 
  u.id,
  u.name,
  u.phone,
  b.name as branch_name,
  COUNT(r.id) as total_referrals
FROM "User" u
LEFT JOIN "Branch" b ON u."branchId" = b.id
LEFT JOIN "User" r ON r."referredById" = u.id AND r.role = 'BUYER'
WHERE u.role = 'AGENT'
GROUP BY u.id, u.name, u.phone, b.name
ORDER BY total_referrals DESC;

-- 지사별 통계
SELECT 
  b.name as branch_name,
  b.region,
  COUNT(DISTINCT u.id) as total_managers,
  COUNT(DISTINCT r.id) as total_referrals
FROM "Branch" b
LEFT JOIN "User" u ON u."branchId" = b.id AND u.role = 'AGENT'
LEFT JOIN "User" r ON r."referredById" = u.id AND r.role = 'BUYER'
GROUP BY b.id, b.name, b.region
ORDER BY total_referrals DESC;
```

### 2. API 테스트

```bash
# 매니저 로그인
curl -X POST https://jangpyosa.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "010-1234-5678",
    "password": "test1234"
  }'

# 내 정보 확인 (추천 정보 포함)
curl -X GET https://jangpyosa.com/api/auth/me \
  -H "Authorization: Bearer <token>"
```

## 📝 다음 단계

1. **즉시 구현 (필수)**
   - 매니저 통계 API
   - 매니저 대시보드
   - 추천 성공 알림

2. **단기 구현 (1-2주)**
   - 지사 통계 API
   - 지사 대시보드
   - 월별 통계 리포트

3. **장기 구현 (1개월+)**
   - 본부 전체 대시보드
   - 실시간 통계 업데이트
   - 커미션 계산 시스템

---

**문서 작성일:** 2026-03-02  
**최종 업데이트:** 2026-03-02
