# 2026년 부담금 계산 로직 테스트

## ✅ 구현 완료 사항

### 1. Backend (employment-calculator-v2.ts)
- ✅ 2026년 최저임금 반영: 2,156,880원
- ✅ 부담금 기초액 계산: 1,294,128원 (60%)
- ✅ 고용률 구간별 적용률:
  - 0~25%: 100% (≈129만원/인/월)
  - 25~50%: 75% (≈97만원/인/월)
  - 50~75%: 50% (≈65만원/인/월)
  - 75~100%: 25% (≈32만원/인/월)
  - 100%+: 0%
- ✅ **0명 고용 특수 케이스 처리**: 100% 적용

### 2. API Endpoint (calculators.ts)
- ✅ POST `/api/calculators/levy-v2` 추가
- ✅ Request 파라미터:
  - totalEmployeeCount: 상시근로자 수
  - disabledEmployeeCount: 장애인 직원 수
  - recognizedCount: 인정 장애인 수 (중증 2배 포함)
  - companyType: PRIVATE_COMPANY | PUBLIC_INSTITUTION | GOVERNMENT
- ✅ Response 구조:
  ```json
  {
    "ok": true,
    "totalEmployeeCount": 300,
    "recognizedCount": 3,
    "obligatedCount": 9,
    "shortfallCount": 6,
    "employmentRate": 33.33,
    "levyBaseAmount": 1294128,
    "levyApplicationRate": 0.75,
    "levyPerPerson": 970596,
    "totalLevy": 5823576,
    "rateDescription": "25~50%: 75% 적용"
  }
  ```

### 3. Frontend (levy/page.tsx)
- ✅ 2026년 최신 로직 토글 추가
- ✅ V2 API 연동
- ✅ 인정 장애인 수 입력 필드 추가
- ✅ 고용률 및 적용 구간 표시
- ✅ 1인당 부담금 상세 표시

## 🧪 테스트 시나리오

### 시나리오 1: 0명 고용 (기초액 전액)
```bash
curl -X POST http://localhost:3001/api/calculators/levy-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "totalEmployeeCount": 300,
    "disabledEmployeeCount": 0,
    "recognizedCount": 0,
    "companyType": "PRIVATE_COMPANY"
  }'
```

**예상 결과:**
- 의무고용인원: 9명 (300 × 0.031)
- 미달인원: 9명
- 고용률: 0%
- 적용률: 100%
- 1인당 부담금: 1,294,128원
- **총 부담금: 11,647,152원**

### 시나리오 2: 33% 고용 (75% 적용)
```bash
curl -X POST http://localhost:3001/api/calculators/levy-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "totalEmployeeCount": 300,
    "disabledEmployeeCount": 3,
    "recognizedCount": 3,
    "companyType": "PRIVATE_COMPANY"
  }'
```

**예상 결과:**
- 의무고용인원: 9명
- 미달인원: 6명
- 고용률: 33.33%
- 적용 구간: "25~50%: 75% 적용"
- 1인당 부담금: 970,596원
- **총 부담금: 5,823,576원**

### 시나리오 3: 중증 포함 (2배 인정)
```bash
curl -X POST http://localhost:3001/api/calculators/levy-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "totalEmployeeCount": 300,
    "disabledEmployeeCount": 5,
    "recognizedCount": 8,
    "companyType": "PRIVATE_COMPANY"
  }'
```

**설명:** 중증 3명(월 60시간 이상) + 경증 2명 = 8명 인정

**예상 결과:**
- 의무고용인원: 9명
- 미달인원: 1명
- 고용률: 88.89%
- 적용 구간: "75~100%: 25% 적용"
- 1인당 부담금: 323,532원
- **총 부담금: 323,532원**

### 시나리오 4: 의무 충족 (0원)
```bash
curl -X POST http://localhost:3001/api/calculators/levy-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "totalEmployeeCount": 300,
    "disabledEmployeeCount": 10,
    "recognizedCount": 10,
    "companyType": "PRIVATE_COMPANY"
  }'
```

**예상 결과:**
- 의무고용인원: 9명
- 미달인원: 0명
- 고용률: 111.11%
- 적용 구간: "100% 이상: 부담금 없음"
- **총 부담금: 0원**

### 시나리오 5: 공공기관 (3.8%)
```bash
curl -X POST http://localhost:3001/api/calculators/levy-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "totalEmployeeCount": 1000,
    "disabledEmployeeCount": 12,
    "recognizedCount": 16,
    "companyType": "PUBLIC_INSTITUTION"
  }'
```

**예상 결과:**
- 의무고용인원: 38명 (1000 × 0.038)
- 미달인원: 22명
- 고용률: 42.11%
- 적용 구간: "25~50%: 75% 적용"
- 1인당 부담금: 970,596원
- **총 부담금: 21,353,112원**

## 📊 계산식 요약

```typescript
// 1. 의무고용인원
obligatedCount = floor(totalEmployeeCount × quotaRate)
  // quotaRate: 민간 0.031, 공공 0.038

// 2. 미달인원
shortfallCount = max(0, obligatedCount - recognizedCount)

// 3. 고용률
employmentRate = (recognizedCount / obligatedCount) × 100

// 4. 적용률 결정
if (recognizedCount === 0) {
  levyApplicationRate = 1.00  // ★ 0명 고용: 100%
} else if (employmentRate >= 100) {
  levyApplicationRate = 0
} else if (employmentRate >= 75) {
  levyApplicationRate = 0.25
} else if (employmentRate >= 50) {
  levyApplicationRate = 0.50
} else if (employmentRate >= 25) {
  levyApplicationRate = 0.75
} else {
  levyApplicationRate = 1.00
}

// 5. 1인당 부담금
levyPerPerson = round(LEVY_BASE_AMOUNT × levyApplicationRate)
  // LEVY_BASE_AMOUNT = 1,294,128원 (2026년)

// 6. 총 부담금
totalLevy = round(shortfallCount × levyPerPerson)
```

## 🔗 관련 문서
- `docs/2026_LEVY_CALCULATION_LOGIC.md`: 계산 로직 상세 설명
- `docs/ID_SYSTEM_ARCHITECTURE.md`: 시스템 ID 구조

## 🎯 다음 단계
1. ✅ API 서버 재시작
2. ✅ 프론트엔드 테스트
3. ✅ 실제 데이터로 검증 (지자체1 데이터 사용)
4. ✅ 문서화 완료
5. ✅ PR 생성 및 배포

