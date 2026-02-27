# 월별 장려금/부담금 시뮬레이션

## 📊 개요

상시근로자 수를 월별로 변경하면서 장려금과 부담금을 실시간으로 시뮬레이션하는 기능입니다.

## ✅ 구현 사항

### 1. Backend API

**엔드포인트:** `POST /api/calculators/monthly-simulation`

#### Request Body:
```json
{
  "year": 2026,
  "monthlyEmployeeCounts": [100, 1000, 1200, 1300, 1400, 1500, 300, 300, 300, 300, 300, 300],
  "companyType": "PRIVATE_COMPANY",
  "disabledEmployees": [
    {
      "id": "emp1",
      "name": "김장애01",
      "severity": "SEVERE",
      "gender": "M",
      "hireDate": "2024-01-01",
      "monthlyWorkHours": 80,
      "monthlySalary": 2800000,
      "hasEmploymentInsurance": true,
      "meetsMinimumWage": true
    }
    // ... 나머지 직원
  ]
}
```

#### Response:
```json
{
  "ok": true,
  "year": 2026,
  "companyType": "PRIVATE_COMPANY",
  "totalEmployees": 10,
  "monthly": [
    {
      "month": 1,
      "totalEmployeeCount": 100,
      "disabledCount": 8,
      "recognizedCount": 12.0,
      "obligatedCount": 3,
      "shortfallCount": 0,
      "employmentRate": 400,
      "levyApplicationRate": 0,
      "levyPerPerson": 0,
      "levy": 0,
      "incentive": 1630000,
      "netAmount": 1630000
    }
    // ... 2월~12월
  ],
  "yearly": {
    "totalLevy": -30000000,
    "totalIncentive": 5000000,
    "netAmount": -25000000
  }
}
```

### 2. Frontend UI

**페이지:** `/calculators/monthly-simulation`

#### 주요 기능:
1. **월별 상시근로자 수 입력**
   - 1월~12월 각각 입력 가능
   - 실시간 변경 가능

2. **장애인 직원 데이터**
   - 중증/경증 구분
   - 월간 근로시간
   - 인정수 자동 계산

3. **시뮬레이션 결과**
   - 월별 상세 테이블
   - 연간 요약 (부담금, 장려금, 순액)

4. **시각화**
   - 색상 코딩 (부담금: 빨강, 장려금: 초록)
   - 미달/초과 표시 (▼/▲)

## 📈 사용 예시

### 페마연 시뮬레이션

#### 입력값:
- **장애인 직원:** 10명 (중증 5명, 경증 5명)
- **인정수:** 15명 (중증 5×2 + 경증 5)
- **월별 상시근로자:**
  - 1월: 100명
  - 2월: 1000명
  - 3월: 1200명
  - 4월: 1300명
  - 5월: 1400명
  - 6월: 1500명
  - 7월~12월: 300명

#### 예상 결과 (2026년 V2 로직):

| 월 | 상시 | 의무 | 인정 | 미달/초과 | 고용률 | 부담금 | 장려금 | 순액 |
|----|------|------|------|-----------|--------|--------|--------|------|
| 1월 | 100 | 3 | 12.0 | ▲9.0 | 400% | 0 | +163만 | +163만 |
| 2월 | 1000 | 31 | 15.0 | ▼16.0 | 48.4% | -1553만 | +252만 | -1301만 |
| 3월 | 1200 | 37 | 15.0 | ▼22.0 | 40.5% | -2135만 | +440만 | -1695만 |
| 4월 | 1300 | 40 | 15.0 | ▼25.0 | 37.5% | -2426만 | +524만 | -1902만 |
| 5월 | 1400 | 43 | 15.0 | ▼28.0 | 34.9% | -2718만 | +524만 | -2194만 |
| 6월 | 1500 | 46 | 15.0 | ▼31.0 | 32.6% | -3009만 | +559만 | -2450만 |
| 7월 | 300 | 9 | 15.0 | ▲6.0 | 166.7% | 0 | +559만 | +559만 |

**연간 합계:**
- 부담금: 약 -1.18억원
- 장려금: 약 +3,021만원
- 순액: 약 -8,779만원

## 🔎 기존 이미지와 차이점

### 이미지 (구 버전):
- 2월 부담금: -2,486만원 (구 기초액 155만원 사용)
- 3월 부담금: -3,419만원
- 6월 부담금: -4,040만원

### V2 로직 (2026):
- 2월 부담금: -1,553만원 (신 기초액 129만원 + 75% 적용)
- 3월 부담금: -2,135만원
- 6월 부담금: -3,009만원

**차이 원인:**
1. 부담금 기초액 변경: 155만원 → 129.4만원
2. 고용률 구간별 적용률 적용

## 🧪 테스트 방법

### 1. API 테스트
```bash
curl -X POST http://localhost:3001/api/calculators/monthly-simulation \
  -H "Content-Type: application/json" \
  -d @test_data.json
```

### 2. Frontend 테스트
```
1. http://localhost:3000/calculators/monthly-simulation 접속
2. 기업 구분 선택 (민간기업/공공기관)
3. 월별 상시근로자 수 입력
4. "시뮬레이션 실행" 클릭
5. 결과 확인
```

## 📚 관련 문서

- `docs/2026_LEVY_CALCULATION_LOGIC.md`: 2026년 계산 로직
- `docs/LEVY_V2_IMPLEMENTATION.md`: V2 구현 상세
- `apps/api/src/services/employment-calculator-v2.ts`: 계산 엔진

## 🎯 활용 방안

1. **인력 계획 수립**
   - 월별 채용 계획에 따른 부담금 예측
   - 최적 고용 시점 결정

2. **예산 편성**
   - 연간 부담금/장려금 예산 수립
   - 월별 재무 계획

3. **시나리오 분석**
   - 다양한 고용 시나리오 비교
   - 최적화 전략 수립

4. **의사결정 지원**
   - 장애인 고용 의사결정 근거
   - ROI 계산

