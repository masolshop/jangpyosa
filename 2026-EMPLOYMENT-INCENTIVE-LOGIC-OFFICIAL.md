# 2026년 장애인고용장려금 계산 로직 (고용노동부 공식)

## 📋 법적 근거
- **「장애인고용촉진 및 직업재활법」 제30조(장려금)**
- **고용노동부 고시 제2025-XX호**
- **한국장애인고용공단 e-신고 시스템**

---

## 1️⃣ 고용장려금 지급 대상

### ✅ 지급 대상 사업주
```typescript
// 월별 상시근로자의 의무고용률을 초과하여 장애인을 고용한 사업주
const isEligibleForIncentive = (
  disabledCount: number,
  obligatedCount: number
): boolean => {
  return disabledCount > obligatedCount  // 초과 고용 시
}
```

### ✅ 지급 대상 장애인 근로자 (4가지 조건 모두 충족)
```typescript
interface IncentiveEligibility {
  // 1. 최저임금 이상 또는 최저임금 적용제외 인가
  meetsMinimumWage: boolean
  hasWageExemptionApproval: boolean
  
  // 2. 고용보험 가입
  hasEmploymentInsurance: boolean
  
  // 3. 장애인 근로자 2명 이상 고용 (사업체 전체)
  totalDisabledEmployees: number  // >= 2
  
  // 4. 고용장려금 제외 대상 아님
  isExcluded: boolean  // false
}

const isEligibleEmployee = (employee: Employee, company: Company): boolean => {
  // 1. 최저임금 조건
  const meetsWageRequirement = 
    employee.meetsMinimumWage || employee.hasWageExemptionApproval
  
  // 2. 고용보험 가입
  if (!employee.hasEmploymentInsurance) return false
  
  // 3. 장애인 근로자 2명 이상
  if (company.totalDisabledEmployees < 2) return false
  
  // 4. 제외 대상 확인
  if (employee.isExcluded) return false
  
  return meetsWageRequirement
}
```

### 🚫 고용장려금 제외 대상
```typescript
// 다음 장애인은 고용장려금 제외:
const isExcludedFromIncentive = (employee: Employee): boolean => {
  // 1. 고용보험 미가입자
  if (!employee.hasEmploymentInsurance) return true
  
  // 2. 최저임금 미달자 (감액 승인 없는 경우)
  if (!employee.meetsMinimumWage && !employee.hasWageExemptionApproval) {
    return true
  }
  
  // 3. 고용보험법상 고용안정·직업능력개발 사업의 지원금 수급자
  if (employee.receivesOtherEmploymentSubsidy) return true
  
  return false
}
```

---

## 2️⃣ 고용장려금 지급 단가 (2023년 발생분부터)

### 💰 2026년 기준 지급 단가
```typescript
// 고용노동부 공식 지급 단가 (2023년 발생분부터 적용)
const INCENTIVE_RATES_2026 = {
  MILD_MALE: 350000,      // 경증 남성: 35만원
  MILD_FEMALE: 500000,    // 경증 여성: 50만원
  SEVERE_MALE: 700000,    // 중증 남성: 70만원
  SEVERE_FEMALE: 900000   // 중증 여성: 90만원
}

// 지급 단가 조회 함수
const getIncentiveRate = (
  severity: 'MILD' | 'SEVERE',
  gender: 'MALE' | 'FEMALE'
): number => {
  if (severity === 'SEVERE') {
    return gender === 'FEMALE' 
      ? INCENTIVE_RATES_2026.SEVERE_FEMALE   // 90만원
      : INCENTIVE_RATES_2026.SEVERE_MALE     // 70만원
  } else {
    return gender === 'FEMALE'
      ? INCENTIVE_RATES_2026.MILD_FEMALE     // 50만원
      : INCENTIVE_RATES_2026.MILD_MALE       // 35만원
  }
}
```

### 📊 월임금액 60% 상한 적용 (중요!)
```typescript
// ⚠️ 지급 단가와 월임금액의 60% 중 낮은 금액 적용
const calculateActualIncentive = (
  employee: Employee
): number => {
  // 1. 기본 지급 단가
  const baseRate = getIncentiveRate(employee.severity, employee.gender)
  
  // 2. 월임금액의 60%
  const wageLimit = employee.monthlyWage * 0.6
  
  // 3. 둘 중 낮은 금액 적용
  return Math.min(baseRate, wageLimit)
}

// 예시:
// 중증 남성, 월급 3,000,000원
// 기본 단가: 700,000원
// 월급 60%: 1,800,000원
// 실제 지급: MIN(700,000, 1,800,000) = 700,000원

// 중증 남성, 월급 500,000원 (최저임금 미만 감액 승인)
// 기본 단가: 700,000원
// 월급 60%: 300,000원
// 실제 지급: MIN(700,000, 300,000) = 300,000원
```

---

## 3️⃣ 고용장려금 지급 기준 인원 산정

### 📐 의무고용률 (2026년)
```typescript
// 고용노동부 공식 의무고용률
const QUOTA_RATES_2026 = {
  PRIVATE: 0.031,   // 민간사업체: 3.1%
  PUBLIC: 0.038     // 공공기관/지방공기업: 3.8%
}

// 사업체 구분
type CompanyType = 'PRIVATE' | 'PUBLIC'

const getQuotaRate = (companyType: CompanyType): number => {
  return companyType === 'PUBLIC' 
    ? QUOTA_RATES_2026.PUBLIC    // 3.8%
    : QUOTA_RATES_2026.PRIVATE   // 3.1%
}
```

### 🎯 고용장려금 지급 기준 인원 계산
```typescript
// ⚠️ 중요: 소수점 이하 올림 (ceil)
const calculateIncentiveBaseCount = (
  employeeCount: number,
  companyType: CompanyType
): number => {
  const quotaRate = getQuotaRate(companyType)
  
  // 월별 상시근로자수 × 의무고용률 (소수점 이하 올림!)
  return Math.ceil(employeeCount * quotaRate)
}

// 예시:
// 민간사업체 80명
// 80 × 3.1% = 2.48명 → 올림 → 3명 (지급 기준 인원)

// 공공기관 60명
// 60 × 3.8% = 2.28명 → 올림 → 3명 (지급 기준 인원)
```

### 🔢 월별 고용장려금 지급 인원 계산
```typescript
// 고용노동부 공식 계산식
const calculateMonthlyIncentiveCount = (
  totalDisabledCount: number,      // 장애인근로자수
  excludedCount: number,            // 고용장려금 제외인원
  baseCount: number                 // 고용장려금 지급기준인원
): number => {
  // 월별 고용장려금 지급인원 = 
  // [장애인근로자수 - 고용장려금 제외인원 - 고용장려금 지급기준인원]
  const incentiveCount = totalDisabledCount - excludedCount - baseCount
  
  // 음수인 경우 0 (초과 고용 아님)
  return Math.max(0, incentiveCount)
}

// 예시:
// 장애인근로자 6명, 제외인원 0명, 기준인원 3명
// 지급인원 = 6 - 0 - 3 = 3명

// 장애인근로자 2명, 제외인원 0명, 기준인원 3명
// 지급인원 = 2 - 0 - 3 = -1 → 0명 (초과 고용 아님)
```

---

## 4️⃣ 인정 수 계산 (중증 장애인 가중치)

### 🔢 장애인근로자 인정 수 계산
```typescript
// 중증장애인은 월 60시간 이상 근무 시 2배 인정
const calculateRecognizedCount = (employees: Employee[]): number => {
  let recognizedCount = 0
  
  for (const employee of employees) {
    if (employee.severity === 'SEVERE') {
      // 중증: 월 60시간 이상 근무 시 2명으로 인정
      const multiplier = employee.monthlyWorkHours >= 60 ? 2.0 : 1.0
      recognizedCount += multiplier
    } else {
      // 경증: 1명으로 인정
      recognizedCount += 1.0
    }
  }
  
  return recognizedCount
}

// 예시:
// 중증 4명 (모두 60시간 이상) + 경증 7명
// 인정수 = (4 × 2) + (7 × 1) = 8 + 7 = 15명
```

---

## 5️⃣ 월별 고용장려금 계산 로직 (완전판)

### 🧮 고용노동부 공식 계산식
```typescript
interface MonthlyIncentiveCalculation {
  month: string                    // 대상 월 (YYYY-MM)
  employeeCount: number            // 월별 상시근로자수
  companyType: CompanyType         // 사업체 구분 (민간/공공)
  quotaRate: number                // 의무고용률 (3.1% or 3.8%)
  
  // 장애인 근로자 현황
  totalDisabledEmployees: number   // 전체 장애인 근로자수
  activeDisabledEmployees: number  // 당월 재직 장애인 수
  excludedEmployees: number        // 제외 대상 인원
  recognizedCount: number          // 인정 수 (중증 2배 포함)
  
  // 지급 기준 인원
  incentiveBaseCount: number       // 지급 기준 인원 (올림)
  incentivePaymentCount: number    // 실제 지급 인원
  
  // 근로자별 상세
  employeeDetails: EmployeeIncentiveDetail[]
  
  // 월별 장려금
  totalMonthlyIncentive: number    // 월별 장려금 합계
}

interface EmployeeIncentiveDetail {
  employeeId: string
  name: string
  severity: 'MILD' | 'SEVERE'
  gender: 'MALE' | 'FEMALE'
  monthlyWage: number
  baseRate: number                 // 기본 지급 단가
  wageLimit: number                // 월급 60%
  actualIncentive: number          // 실제 지급액
  isExcluded: boolean              // 제외 여부
  excludeReason?: string           // 제외 사유
}

// 완전한 월별 장려금 계산 함수
const calculateMonthlyIncentive = (
  month: string,
  employees: Employee[],
  employeeCount: number,
  companyType: CompanyType
): MonthlyIncentiveCalculation => {
  
  // 1. 의무고용률 조회
  const quotaRate = getQuotaRate(companyType)
  
  // 2. 당월 재직 중인 장애인 근로자 필터링
  const activeEmployees = employees.filter(emp => 
    isActiveInMonth(emp, month)
  )
  
  // 3. 제외 대상 구분
  const excludedEmployees = activeEmployees.filter(emp => 
    isExcludedFromIncentive(emp)
  )
  
  const eligibleEmployees = activeEmployees.filter(emp => 
    !isExcludedFromIncentive(emp)
  )
  
  // 4. 인정 수 계산 (중증 2배 포함)
  const recognizedCount = calculateRecognizedCount(eligibleEmployees)
  
  // 5. 지급 기준 인원 (올림!)
  const incentiveBaseCount = Math.ceil(employeeCount * quotaRate)
  
  // 6. 지급 인원 계산
  const incentivePaymentCount = Math.max(
    0,
    activeEmployees.length - excludedEmployees.length - incentiveBaseCount
  )
  
  // 7. 장애인 근로자 2명 미만 체크
  if (activeEmployees.length < 2) {
    return {
      ...baseResult,
      totalMonthlyIncentive: 0,
      reason: '장애인 근로자 2명 미만 (지급 불가)'
    }
  }
  
  // 8. 초과 고용 여부 확인
  if (incentivePaymentCount <= 0) {
    return {
      ...baseResult,
      totalMonthlyIncentive: 0,
      reason: '의무고용률 초과 고용 아님'
    }
  }
  
  // 9. 근로자별 장려금 계산
  const employeeDetails: EmployeeIncentiveDetail[] = []
  let totalMonthlyIncentive = 0
  
  for (const employee of eligibleEmployees) {
    // 기본 지급 단가
    const baseRate = getIncentiveRate(employee.severity, employee.gender)
    
    // 월급 60% 상한
    const wageLimit = employee.monthlyWage * 0.6
    
    // 실제 지급액 (둘 중 낮은 금액)
    const actualIncentive = Math.min(baseRate, wageLimit)
    
    employeeDetails.push({
      employeeId: employee.id,
      name: employee.name,
      severity: employee.severity,
      gender: employee.gender,
      monthlyWage: employee.monthlyWage,
      baseRate,
      wageLimit,
      actualIncentive,
      isExcluded: false
    })
    
    totalMonthlyIncentive += actualIncentive
  }
  
  // 10. 제외 대상 근로자 정보 추가
  for (const employee of excludedEmployees) {
    employeeDetails.push({
      employeeId: employee.id,
      name: employee.name,
      severity: employee.severity,
      gender: employee.gender,
      monthlyWage: employee.monthlyWage,
      baseRate: 0,
      wageLimit: 0,
      actualIncentive: 0,
      isExcluded: true,
      excludeReason: getExcludeReason(employee)
    })
  }
  
  return {
    month,
    employeeCount,
    companyType,
    quotaRate,
    totalDisabledEmployees: employees.length,
    activeDisabledEmployees: activeEmployees.length,
    excludedEmployees: excludedEmployees.length,
    recognizedCount,
    incentiveBaseCount,
    incentivePaymentCount,
    employeeDetails,
    totalMonthlyIncentive
  }
}
```

---

## 6️⃣ 고용노동부 산정 예시 (2026년 1~3월)

### 📊 민간사업체 사례 (의무고용률 3.1%)

**기업 정보:**
- **상시근로자수**: 1월 80명, 2월 60명, 3월 100명
- **회사 구분**: 민간사업체
- **의무고용률**: 3.1%
- **전체 근로자수**: 240명
- **장애인 근로자**: 총 6명 (제외 인원 없음)
  - 홍길동: 지체 중증(남), 월급 1,500천원
  - 김경선: 지체 경증(여), 월급 2,000천원
  - 김명철: 지체 중증(남), 월급 800천원 (최저임금 미만)
  - 이민성: 지체 경증(남), 월급 2,000천원
  - 진동이: 지체 경증(남), 월급 1,500천원
  - 정숙이: 지체 경증(여), 월급 1,000천원 (최저임금 미만)

---

### 1월 계산 (상시근로자 80명)

```typescript
// 1. 지급 기준 인원
const baseCount = Math.ceil(80 × 0.031) = Math.ceil(2.48) = 3명

// 2. 장애인 근로자수
const totalDisabled = 6명
const excluded = 0명

// 3. 지급 인원
const paymentCount = 6 - 0 - 3 = 3명

// 4. 지급 기준 인원 (80 × 3.1% = 2.48 → 올림 → 3명)
장려금 지급 기준 인원: 3명

// 5. 초과 인원
초과 인원 = 6 - 3 = 3명

// 6. 근로자별 장려금
홍길동(중증 남): MIN(700,000, 1,500,000×0.6) = MIN(700,000, 900,000) = 700,000원
김경선(경증 여): MIN(500,000, 2,000,000×0.6) = MIN(500,000, 1,200,000) = 500,000원
김명철(중증 남): MIN(700,000, 800,000×0.6) = MIN(700,000, 480,000) = 480,000원

// 7. 1월 장려금
1월 장려금 = 700,000 + 500,000 + 480,000 = 1,680,000원
```

**1월 결과: 1,680,000원**

---

### 2월 계산 (상시근로자 60명)

```typescript
// 1. 지급 기준 인원
const baseCount = Math.ceil(60 × 0.031) = Math.ceil(1.86) = 2명

// 2. 지급 인원
const paymentCount = 6 - 0 - 2 = 4명

// 3. 근로자별 장려금
홍길동(중증 남): 700,000원
김경선(경증 여): 500,000원
김명철(중증 남): 480,000원
이민성(경증 남): MIN(350,000, 2,000,000×0.6) = MIN(350,000, 1,200,000) = 350,000원

// 4. 2월 장려금
2월 장려금 = 700,000 + 500,000 + 480,000 + 350,000 = 2,030,000원
```

**2월 결과: 2,030,000원**

---

### 3월 계산 (상시근로자 100명)

```typescript
// 1. 지급 기준 인원
const baseCount = Math.ceil(100 × 0.031) = Math.ceil(3.1) = 4명

// 2. 지급 인원
const paymentCount = 6 - 0 - 4 = 2명

// 3. 근로자별 장려금
홍길동(중증 남): 700,000원
김경선(경증 여): 500,000원

// 4. 3월 장려금
3월 장려금 = 700,000 + 500,000 = 1,200,000원
```

**3월 결과: 1,200,000원**

---

### 분기 합계
```typescript
1분기(1월~3월) 장려금 합계 = 1,680,000 + 2,030,000 + 1,200,000 = 4,910,000원
```

---

## 7️⃣ 주요 체크포인트

### ✅ 계산 시 주의사항

1. **지급 기준 인원은 올림 (ceil)**
   ```typescript
   // ❌ 잘못된 계산 (내림)
   const baseCount = Math.floor(80 × 0.031) = 2명
   
   // ✅ 올바른 계산 (올림)
   const baseCount = Math.ceil(80 × 0.031) = 3명
   ```

2. **월임금액 60% 상한 적용 필수**
   ```typescript
   // ❌ 단가만 적용 (잘못됨)
   const incentive = 700000
   
   // ✅ 단가와 월급 60% 비교 (올바름)
   const incentive = Math.min(700000, monthlyWage × 0.6)
   ```

3. **장애인 근로자 2명 미만 시 지급 불가**
   ```typescript
   if (totalDisabledEmployees < 2) {
     return 0  // 장려금 지급 불가
   }
   ```

4. **제외 대상 구분 필수**
   ```typescript
   // 고용보험 미가입, 최저임금 미달 등 제외
   const eligibleCount = totalCount - excludedCount
   ```

5. **인정 수 계산 (중증 2배)**
   ```typescript
   // 부담금 계산 시: 중증 60시간 이상 2배
   // 장려금 계산 시: 실제 고용 인원 기준 (인정수 아님!)
   ```

---

## 8️⃣ 부담금 vs 장려금 비교

| 구분 | 부담금 | 장려금 |
|------|--------|--------|
| **대상** | 의무고용 미달 시 | 의무고용 초과 시 |
| **기준 인원 계산** | 내림 (floor) | **올림 (ceil)** |
| **인원 산정** | 인정수 (중증 2배) | **실제 고용 인원** |
| **성별 구분** | 없음 | **있음 (여성 우대)** |
| **월급 상한** | 없음 | **60% 상한** |
| **지급 기간** | 매월 부과 | 매월 지급 (무제한) |

---

## 9️⃣ 구현 체크리스트

### ✅ 필수 구현 항목

- [ ] 의무고용률 구분 (민간 3.1% / 공공 3.8%)
- [ ] 지급 기준 인원 올림 (ceil) 적용
- [ ] 성별 구분 지급 단가 (남/여, 경증/중증)
- [ ] 월임금액 60% 상한 적용
- [ ] 장애인 근로자 2명 이상 검증
- [ ] 고용보험 가입 여부 확인
- [ ] 최저임금 충족 여부 확인
- [ ] 제외 대상 구분 로직
- [ ] 근로자별 상세 계산
- [ ] 월별 합계 계산

---

## 🎯 다음 단계: 코드 구현

이제 이 로직을 기반으로:
1. **employment-calculator.ts** 수정
2. **dashboard.ts** API 업데이트
3. **프론트엔드 UI** 수정
4. **AWS 배포**

진행하시겠습니까?

---

**작성일:** 2026-02-22  
**작성자:** Jangpyosa Development Team  
**문서 버전:** 2.0 (고용노동부 공식 자료 기반)  
**참고:** 한국장애인고용공단 e-신고 시스템
