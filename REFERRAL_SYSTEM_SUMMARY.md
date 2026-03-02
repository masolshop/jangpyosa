# 추천 시스템 로직 테스트 및 최적화 요약

## 📊 현재 상태

### ✅ 잘 작동하는 부분

1. **매니저 기반 추천 연결**
   - BUYER 가입 시 `referrerPhone` (매니저 핸드폰) 입력
   - 자동으로 `User.referredById` 연결
   - 계층 구조: 매니저 => 지사 => 본부

2. **데이터 저장**
   - 모든 추천 관계가 DB에 저장됨
   - `User` 테이블의 `referredById` 필드 사용

### ⚠️ 개선 필요 부분

1. **통계 API 부족**
   - 매니저가 자신의 추천 통계를 볼 수 없음
   - 지사별 집계 기능 없음
   - 본부 전체 통계 대시보드 없음

2. **실시간 업데이트 없음**
   - 추천 성공 시 알림 시스템 없음
   - 대시보드 실시간 갱신 없음

## 🚀 최적화 방안

### 1단계: 필수 API 추가 (즉시 구현)

```typescript
// 매니저 통계 조회
GET /api/agent/stats
Response: {
  totalReferrals: 10,      // 총 추천 수
  activeReferrals: 8,       // 활성 고객
  thisMonthReferrals: 3    // 이번 달 추천
}

// 매니저 추천 목록
GET /api/agent/referrals
Response: {
  referrals: [
    {
      company: { name: "ABC", bizNo: "123-45-67890" },
      createdAt: "2026-03-01",
      isActive: true
    }
  ]
}
```

### 2단계: 대시보드 구현 (1주)

- 매니저 대시보드: 내 추천 통계 + 목록
- 지사 대시보드: 지사 통계 + 매니저 순위
- 본부 대시보드: 전체 통계 + 지사별 현황

### 3단계: 실시간 기능 (2주)

- 추천 성공 시 매니저에게 알림
- 통계 자동 업데이트
- 월별/분기별 리포트

## 🧪 테스트 방법

### 1. 매니저 생성
```bash
POST /api/auth/signup/agent
{
  "name": "테스트매니저",
  "phone": "010-1234-5678",
  "password": "test1234",
  "branchId": "<branch-id>"
}
```

### 2. 기업 가입 (매니저 추천)
```bash
POST /api/auth/signup/buyer
{
  "username": "testcompany",
  "password": "test1234",
  "bizNo": "123-45-67890",
  "referrerPhone": "010-1234-5678",  // 👈 매니저 핸드폰
  "buyerType": "PRIVATE_COMPANY",
  "managerName": "홍길동",
  "managerTitle": "부장",
  "managerEmail": "hong@company.com",
  "managerPhone": "010-9999-8888",
  "privacyAgreed": true
}
```

### 3. 추천 확인 (DB 쿼리)
```sql
SELECT 
  u.name as manager_name,
  COUNT(r.id) as total_referrals
FROM "User" u
LEFT JOIN "User" r ON r."referredById" = u.id AND r.role = 'BUYER'
WHERE u.role = 'AGENT'
GROUP BY u.id, u.name;
```

## 📋 체크리스트

- [x] 추천 로직 분석 완료
- [x] 현재 상태 파악
- [x] 최적화 방안 수립
- [ ] 통계 API 구현
- [ ] 대시보드 구현
- [ ] 알림 시스템 구현
- [ ] 실제 데이터로 테스트

## 📚 상세 문서

자세한 내용은 `REFERRAL_SYSTEM_OPTIMIZATION.md` 참조

---

**작성일:** 2026-03-02  
**작성자:** AI Assistant
