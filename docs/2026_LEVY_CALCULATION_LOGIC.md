# 2026년 장애인 고용 부담금 계산 로직 정리

## 📅 기준 정보 (2026년)

### 최저임금
- **2026년 최저시급**: 10,030원
- **2026년 월 최저급여**: 2,156,880원 (주 40시간 기준)

### 부담금 기초액
- **기준액**: 월 최저급여의 **60%**
- **2026년 부담금 기초액** = 2,156,880원 × 0.6 = **1,294,128원** (약 **126만원**)

---

## 📊 의무고용인원 계산

### 민간기업 (PRIVATE_COMPANY)
```
월별 의무고용인원 = ⌊월별 상시근로자수 × 0.031⌋ (소수점 버림)
```

### 공공기관/지방공기업 (PUBLIC_INSTITUTION, GOVERNMENT)
```
월별 의무고용인원 = ⌊월별 상시근로자수 × 0.038⌋ (소수점 버림)
```

---

## 💰 부담기초액 적용률 (2026년 기준)

### 고용률에 따른 부담기초액 적용

| 실제 고용률 | 부담기초액 적용률 | 월 1인당 부담금 (2026년) |
|------------|-----------------|------------------------|
| **0%** | 100% | 약 **126만원** (1,294,128원) |
| **25% 미만** | 100% | 약 **126만원** (1,294,128원) |
| **25~50%** | 75% | 약 **94만원** (970,596원) |
| **50~75%** | 50% | 약 **63만원** (647,064원) |
| **75~100%** | 25% | 약 **31만원** (323,532원) |

### 계산식
```typescript
// 부담기초액 (2026년)
const BASE_LEVY_AMOUNT_2026 = 1_294_128; // 원

// 고용률 계산
const employmentRate = (실제_장애인_근로자수 / 의무고용인원) * 100;

// 적용률 결정
let applyRate = 1.0; // 기본 100%

if (employmentRate < 25) {
  applyRate = 1.0; // 100%
} else if (employmentRate < 50) {
  applyRate = 0.75; // 75%
} else if (employmentRate < 75) {
  applyRate = 0.5; // 50%
} else if (employmentRate < 100) {
  applyRate = 0.25; // 25%
} else {
  applyRate = 0; // 100% 이상은 부담금 없음
}

// 월별 1인당 부담금
const monthlyLevyPerPerson = BASE_LEVY_AMOUNT_2026 * applyRate;

// 월별 미달인원
const shortfallCount = Math.max(0, 의무고용인원 - 실제_장애인_근로자수);

// 월별 총 부담금
const monthlyTotalLevy = monthlyLevyPerPerson * shortfallCount;

// 연간 총 부담금
const annualTotalLevy = monthlyTotalLevy * 12;
```

---

## 🧮 계산 예시

### 예시 1: 상시근로자 300명 (민간기업)

#### 1단계: 의무고용인원 계산
```
의무고용인원 = ⌊300 × 0.031⌋ = ⌊9.3⌋ = 9명
```

#### 2단계: 실제 고용 상황
- 실제 고용: **3명**
- 미달 인원: 9 - 3 = **6명**

#### 3단계: 고용률 계산
```
고용률 = (3 / 9) × 100 = 33.33%
→ 25~50% 구간
```

#### 4단계: 부담기초액 적용
```
적용률: 75%
1인당 월 부담금 = 1,294,128원 × 0.75 = 970,596원 (약 94만원)
```

#### 5단계: 월별/연간 부담금 계산
```
월별 부담금 = 970,596원 × 6명 = 5,823,576원 (약 582만원)
연간 부담금 = 5,823,576원 × 12개월 = 69,882,912원 (약 6,988만원)
```

✅ **최종 연간 부담금: 약 6,988만원**

---

### 예시 2: 상시근로자 450명 (민간기업)

#### Case 1: 장애인 미고용 (0명)

```
의무고용인원 = ⌊450 × 0.031⌋ = 13명
실제 고용: 0명
미달 인원: 13명
고용률: 0%

부담금 = 1,294,128원 × 1.0 × 13명 × 12개월
      = 201,882,912원 (약 2억 189만원)
```

#### Case 2: 장애인 3명 고용 (경증 3명, 중증 2명 인정수 5)

```
의무고용인원 = 13명
실제 인정수: 5명
미달 인원: 13 - 5 = 8명
고용률 = (5 / 13) × 100 = 38.5% (25~50% 구간)

부담금 = 1,294,128원 × 0.75 × 8명 × 12개월
      = 93,177,216원 (약 9,318만원)
```

---

### 예시 3: 상시근로자 1,000명 (공공기관)

#### 1단계: 의무고용인원 (공공기관 3.8%)
```
의무고용인원 = ⌊1,000 × 0.038⌋ = 38명
```

#### 2단계: 실제 고용 16명 (중증 6명×2 + 경증 4명×1)
```
인정수 = 6×2 + 4×1 = 16명
미달 인원 = 38 - 16 = 22명
고용률 = (16 / 38) × 100 = 42.1% (25~50% 구간)
```

#### 3단계: 부담금 계산
```
월별 부담금 = 1,294,128원 × 0.75 × 22명 = 21,353,112원 (약 2,135만원)
연간 부담금 = 21,353,112원 × 12개월 = 256,237,344원 (약 2억 5,624만원)
```

---

## 📋 실제 적용 시 주의사항

### 1. 인정수 계산 (중증/경증 구분)
```typescript
// 중증 장애인: 월 60시간 이상 근무 시 2인 인정
if (severity === 'SEVERE' && monthlyWorkHours >= 60) {
  recognizedCount = 2;
} else {
  recognizedCount = 1;
}
```

### 2. 월별 계산
- 매월 상시근로자 수 변동 가능
- 매월 장애인 근로자 수 변동 가능 (입/퇴사)
- 월별로 독립적으로 계산

### 3. 부담금 납부 시기
- **월별 계산**: 매월 말일 기준
- **납부**: 다음 달 10일까지

---

## 🔧 TypeScript 구현 예시

```typescript
interface LevyCalculationParams {
  totalEmployees: number; // 상시근로자 수
  disabledEmployees: number; // 장애인 근로자 인정수
  companyType: 'PRIVATE_COMPANY' | 'PUBLIC_INSTITUTION' | 'GOVERNMENT';
  year: number; // 연도
}

interface LevyResult {
  obligatedCount: number; // 의무고용인원
  recognizedCount: number; // 인정 장애인 수
  shortfallCount: number; // 미달 인원
  employmentRate: number; // 고용률 (%)
  applyRate: number; // 부담기초액 적용률
  monthlyLevyPerPerson: number; // 월 1인당 부담금
  monthlyTotalLevy: number; // 월 총 부담금
  annualTotalLevy: number; // 연 총 부담금
}

function calculateLevy(params: LevyCalculationParams): LevyResult {
  // 2026년 부담금 기초액
  const BASE_LEVY_2026 = 1_294_128;
  
  // 의무고용률
  const quotaRate = params.companyType === 'PRIVATE_COMPANY' ? 0.031 : 0.038;
  
  // 의무고용인원 (소수점 버림)
  const obligatedCount = Math.floor(params.totalEmployees * quotaRate);
  
  // 미달 인원
  const shortfallCount = Math.max(0, obligatedCount - params.disabledEmployees);
  
  // 고용률
  const employmentRate = obligatedCount > 0 
    ? (params.disabledEmployees / obligatedCount) * 100 
    : 0;
  
  // 적용률 결정
  let applyRate = 1.0;
  if (employmentRate >= 100) {
    applyRate = 0;
  } else if (employmentRate >= 75) {
    applyRate = 0.25;
  } else if (employmentRate >= 50) {
    applyRate = 0.5;
  } else if (employmentRate >= 25) {
    applyRate = 0.75;
  } else {
    applyRate = 1.0;
  }
  
  // 월별 1인당 부담금
  const monthlyLevyPerPerson = Math.floor(BASE_LEVY_2026 * applyRate);
  
  // 월별 총 부담금
  const monthlyTotalLevy = monthlyLevyPerPerson * shortfallCount;
  
  // 연간 총 부담금
  const annualTotalLevy = monthlyTotalLevy * 12;
  
  return {
    obligatedCount,
    recognizedCount: params.disabledEmployees,
    shortfallCount,
    employmentRate: Math.round(employmentRate * 100) / 100,
    applyRate,
    monthlyLevyPerPerson,
    monthlyTotalLevy,
    annualTotalLevy,
  };
}

// 사용 예시
const result = calculateLevy({
  totalEmployees: 300,
  disabledEmployees: 3,
  companyType: 'PRIVATE_COMPANY',
  year: 2026,
});

console.log(`의무고용인원: ${result.obligatedCount}명`);
console.log(`미달인원: ${result.shortfallCount}명`);
console.log(`고용률: ${result.employmentRate}%`);
console.log(`월 부담금: ${result.monthlyTotalLevy.toLocaleString()}원`);
console.log(`연 부담금: ${result.annualTotalLevy.toLocaleString()}원`);
```

---

## 📊 부담금 계산 플로우차트

```
1. 상시근로자 수 확인
   ↓
2. 기업 유형 확인 (민간 3.1% / 공공 3.8%)
   ↓
3. 의무고용인원 계산 (소수점 버림)
   ↓
4. 실제 장애인 근로자 인정수 계산
   - 중증: 월 60시간 이상 → 2인
   - 경증: 1인
   ↓
5. 미달 인원 계산 (의무 - 실제)
   ↓
6. 고용률 계산 (실제 / 의무 × 100)
   ↓
7. 부담기초액 적용률 결정
   - 0~25%: 100%
   - 25~50%: 75%
   - 50~75%: 50%
   - 75~100%: 25%
   - 100% 이상: 0%
   ↓
8. 월 1인당 부담금 = 1,294,128원 × 적용률
   ↓
9. 월 총 부담금 = 1인당 부담금 × 미달 인원
   ↓
10. 연 총 부담금 = 월 총 부담금 × 12개월
```

---

## 🎯 핵심 요약

### 2026년 기준
- **부담금 기초액**: 1,294,128원 (월 최저급여 2,156,880원의 60%)
- **민간기업 의무고용률**: 3.1%
- **공공기관 의무고용률**: 3.8%

### 부담기초액 적용률
- 0~25%: 100% (약 126만원)
- 25~50%: 75% (약 94만원)
- 50~75%: 50% (약 63만원)
- 75~100%: 25% (약 31만원)

### 계산 순서
1. 의무고용인원 = ⌊상시근로자 × 고용률⌋
2. 미달인원 = 의무 - 실제 인정수
3. 고용률 = (실제 / 의무) × 100
4. 월 부담금 = 기초액 × 적용률 × 미달인원
5. 연 부담금 = 월 부담금 × 12

---

**작성일**: 2026-02-27  
**기준**: 2026년 최저임금 (월 2,156,880원)  
**부담금 기초액**: 1,294,128원
