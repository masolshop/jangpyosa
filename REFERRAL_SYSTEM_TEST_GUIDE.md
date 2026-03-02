# 추천 시스템 통합 테스트 가이드

## ✅ 구현 완료 내역

### 1. API 엔드포인트 (4개)

| 엔드포인트 | 설명 | 권한 |
|---|---|---|
| `GET /api/agent/stats` | 매니저 본인의 추천 통계 | AGENT |
| `GET /api/agent/referrals` | 매니저 본인의 추천 기업 목록 | AGENT |
| `GET /api/branch/:branchId/stats` | 지사 전체 추천 통계 | AGENT (해당 지사) |
| `GET /api/headquarters/stats` | 본부 전체 추천 통계 | SUPER_ADMIN |

### 2. 대시보드 UI 통합

- **매니저 대시보드** (`/admin/sales/dashboard`): 추천 실적 현황 섹션 추가
- **지사 대시보드**: 지사 전체 통계 + 매니저별 순위
- **본부 대시보드**: 본부 전체 통계 + 지사별 비교

### 3. 추천 시스템 로직

```
고용의무기업 가입 시 referrerPhone 입력
      ↓
User 테이블 referredById 필드에 매니저 ID 저장
      ↓
매니저/지사/본부 대시보드에 자동 집계
```

## 🧪 테스트 방법

### Step 1: 매니저 확인

먼저 DB에서 테스트용 AGENT 사용자를 확인하거나 생성합니다.

```sql
-- AGENT 사용자 조회
SELECT id, name, phone, role, "branchId"
FROM "User"
WHERE role = 'AGENT'
LIMIT 5;
```

### Step 2: 추천받은 기업 가입

실제 매니저 핸드폰번호로 기업을 가입시킵니다.

```bash
# 테스트 스크립트 실행
node test-final-referral.js
```

또는 직접 API 호출:

```bash
curl -X POST https://jangpyosa.com/api/auth/signup/buyer \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testcompany001",
    "name": "담당자명",
    "phone": "010-1111-2222",
    "password": "Test1234!",
    "email": "test@company.com",
    "managerName": "대표자명",
    "managerTitle": "대표이사",
    "managerPhone": "010-1111-2223",
    "managerEmail": "ceo@company.com",
    "companyName": "테스트주식회사",
    "bizNo": "1234567890",
    "buyerType": "PRIVATE_COMPANY",
    "referrerPhone": "010-1234-5678",
    "privacyAgreed": true,
    "termsAgreed": true
  }'
```

### Step 3: 추천 연결 확인 (DB)

```sql
-- 추천 관계 확인
SELECT 
  agent.name AS "매니저명",
  agent.phone AS "매니저핸드폰",
  buyer.name AS "추천받은사용자",
  c.name AS "기업명",
  c."buyerType" AS "기업유형",
  buyer."createdAt" AS "가입일시"
FROM "User" agent
INNER JOIN "User" buyer ON buyer."referredById" = agent.id
INNER JOIN "Company" c ON buyer."companyId" = c.id
WHERE agent.role = 'AGENT'
  AND buyer.role = 'BUYER'
ORDER BY buyer."createdAt" DESC
LIMIT 10;
```

```sql
-- 매니저별 추천 통계
SELECT 
  agent.name AS "매니저",
  agent.phone AS "핸드폰",
  COUNT(buyer.id) AS "총추천수",
  COUNT(CASE WHEN c."buyerType" = 'PRIVATE_COMPANY' THEN 1 END) AS "민간기업",
  COUNT(CASE WHEN c."buyerType" = 'PUBLIC_INSTITUTION' THEN 1 END) AS "공공기관",
  COUNT(CASE WHEN c."buyerType" = 'GOVERNMENT' THEN 1 END) AS "정부기관"
FROM "User" agent
LEFT JOIN "User" buyer ON buyer."referredById" = agent.id AND buyer.role = 'BUYER'
LEFT JOIN "Company" c ON buyer."companyId" = c.id
WHERE agent.role = 'AGENT'
GROUP BY agent.id, agent.name, agent.phone
HAVING COUNT(buyer.id) > 0
ORDER BY COUNT(buyer.id) DESC;
```

### Step 4: 매니저 대시보드 확인

1. **로그인**: https://jangpyosa.com/admin/sales
   - 핸드폰: 매니저 핸드폰번호
   - 비밀번호: 매니저 비밀번호

2. **대시보드 접속**: `/admin/sales/dashboard`

3. **확인 항목**:
   - ✅ "추천 실적 현황" 섹션 존재
   - ✅ 총 추천 수 표시
   - ✅ 활성 추천 수 표시
   - ✅ 이번 달 추천 수 표시
   - ✅ 이번 주 추천 수 표시
   - ✅ 기업 유형별 통계 (민간/공공/정부)
   - ✅ 추천 기업 리스트 테이블

### Step 5: API 직접 호출 (선택)

매니저로 로그인 후 토큰을 받아 API를 직접 호출할 수 있습니다.

```bash
# 1. 매니저 로그인
TOKEN=$(curl -s -X POST https://jangpyosa.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"010-1234-5678","password":"password"}' \
  | jq -r '.token')

# 2. 매니저 추천 통계
curl -H "Authorization: Bearer $TOKEN" \
  https://jangpyosa.com/api/agent/stats | jq .

# 3. 매니저 추천 기업 목록
curl -H "Authorization: Bearer $TOKEN" \
  https://jangpyosa.com/api/agent/referrals | jq .
```

## 📋 예상 응답 구조

### GET /api/agent/stats

```json
{
  "totalReferrals": 5,
  "activeReferrals": 4,
  "thisMonthReferrals": 2,
  "thisWeekReferrals": 1,
  "privateCompanies": 3,
  "publicCompanies": 1,
  "governmentCompanies": 1,
  "byBuyerType": {
    "PRIVATE_COMPANY": 3,
    "PUBLIC_INSTITUTION": 1,
    "GOVERNMENT": 1
  },
  "lastReferralDate": "2026-03-02T14:30:00.000Z"
}
```

### GET /api/agent/referrals

```json
{
  "referrals": [
    {
      "id": "user-id",
      "name": "담당자명",
      "phone": "010-1111-2222",
      "company": {
        "id": "company-id",
        "name": "테스트주식회사",
        "bizNo": "1234567890",
        "buyerType": "PRIVATE_COMPANY",
        "isVerified": true,
        "createdAt": "2026-03-02T14:30:00.000Z"
      },
      "createdAt": "2026-03-02T14:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

## 🔍 문제 해결

### 추천인 연결이 안 될 때

1. **매니저 존재 확인**:
   ```sql
   SELECT * FROM "User" WHERE phone = '010-1234-5678' AND role = 'AGENT';
   ```

2. **핸드폰 번호 정규화 확인**: 
   - API는 자동으로 `-`, ` ` 제거
   - `010-1234-5678` → `01012345678`

3. **로그 확인**:
   ```bash
   # 서버 로그에서 경고 확인
   ssh ... "pm2 logs jangpyosa-api --lines 100 | grep -i referrer"
   ```

### 대시보드에 통계가 안 보일 때

1. **브라우저 콘솔 확인**: F12 → Console 탭
2. **API 응답 확인**: Network 탭에서 `/sales/dashboard/stats` 응답 확인
3. **권한 확인**: 로그인한 사용자의 role이 AGENT인지 확인

## 🎯 성공 기준

- ✅ referrerPhone으로 기업 가입 시 User.referredById 자동 설정
- ✅ 매니저 대시보드에서 추천 통계 표시
- ✅ 지사 대시보드에서 소속 매니저 추천 합산 표시
- ✅ 본부 대시보드에서 전체 추천 통계 표시
- ✅ 이번 달/이번 주 추천 수 정확히 계산
- ✅ 기업 유형별 통계 정확히 분류

## 📞 추후 구현 예정

- 🔔 **카톡 알림톡 연동** (매니저 가입 시, 추천 기업 가입 시)
- 📊 **월별/분기별 리포트 자동 생성**
- 🔄 **실시간 통계 자동 업데이트** (WebSocket/SSE)
