# 2026년 장애인고용개선장려금 계산 로직 정정

## 🚨 현재 구현 문제점

### 1. 장려금 지급 대상 오류
**현재 코드:**
```typescript
// ❌ 모든 초과 인원에 장려금 지급
const incentive = Math.max(0, recognizedCount - obligatedCount) × 350,000
```

**문제:**
- 경증장애인도 장려금 지급 대상에 포함됨 (잘못됨)
- 100인 이상 기업도 장려금 지급 대상에 포함됨 (잘못됨)
- 의무고용률 달성 기업도 장려금 지급 (잘못됨)

### 2. 장려금 단가 오류
**현재 코드:**
```typescript
// ❌ 고정 단가 350,000원
const INCENTIVE_UNIT_PRICE = 350000
```

**문제:**
- 성별 구분 없음 (여성 중증 450,000원 미반영)
- 월급여액 60% 상한 미적용
- 타 지원금과의 중복 조정 로직 없음

### 3. 지급 기간 제한 없음
**현재 코드:**
```typescript
// ❌ 지급 기간 제한 없음
```

**문제:**
- 12개월 제한 미적용
- 근로자별 지급 개월 수 추적 없음
- 재고용 12개월 제한 미적용

---

## ✅ 2026년 장애인고용개선장려금 정확한 계산 로직

### 📋 법적 근거
- **「장애인고용촉진 및 직업재활법」 제30조의3(고용장려금)**
- **2026년 장애인고용개선장려금 시행지침**

---

## 1️⃣ 지급 대상 (4가지 조건 모두 충족 필수)

### ✅ 조건 1: 사업주 규모
```typescript
// 상시근로자 50~99명 미만 기업만 해당
const isEligibleEmployer = (employeeCount: number): boolean => {
  return employeeCount >= 50 && employeeCount < 100
}
```

### ✅ 조건 2: 의무고용률 미달 여부
```typescript
// 해당 월에 의무고용률 미달 사업주여야 함
const isQuotaNonCompliant = (recognizedCount: number, obligatedCount: number): boolean => {
  return recognizedCount < obligatedCount
}
```

### ✅ 조건 3: 중증장애인만 해당
```typescript
// 경증장애인은 장려금 지급 대상 아님
const isEligibleForIncentive = (employee: Employee): boolean => {
  return employee.severity === 'SEVERE' // 중증장애인만
}
```

### ✅ 조건 4: 지급 제외 대상 아님
```typescript
// 다음 경우 지급 제외:
const isExcluded = (employee: Employee): boolean => {
  // 1. 최저임금 미달자 (감액 승인 없는 경우)
  if (!employee.meetsMinimumWage && !employee.hasWageReductionApproval) {
    return true
  }
  
  // 2. 4대보험 미가입자
  if (!employee.hasEmploymentInsurance || !employee.hasIndustrialInsurance) {
    return true
  }
  
  // 3. 12개월 이내 재고용자
  if (employee.isReHiredWithin12Months) {
    return true
  }
  
  // 4. 공공일자리사업 참여자
  if (employee.isPublicJobProgram) {
    return true
  }
  
  return false
}
```

---

## 2️⃣ 장려금 단가 (성별 구분)

### 💰 기본 단가
```typescript
// 2026년 기준
const INCENTIVE_BASE_RATES = {
  SEVERE_MALE: 350000,    // 남성 중증장애인
  SEVERE_FEMALE: 450000   // 여성 중증장애인
}

const getBaseIncentiveRate = (employee: Employee): number => {
  if (employee.severity !== 'SEVERE') return 0
  
  return employee.gender === 'FEMALE' 
    ? INCENTIVE_BASE_RATES.SEVERE_FEMALE 
    : INCENTIVE_BASE_RATES.SEVERE_MALE
}
```

### 📊 월급여액 60% 상한 적용
```typescript
const calculateMonthlyIncentive = (employee: Employee): number => {
  const baseRate = getBaseIncentiveRate(employee)
  if (baseRate === 0) return 0
  
  // 최저임금 산입 범위 월급여액의 60%
  const wageLimit = employee.monthlyWageForMinimumWage * 0.6
  
  // 기본 단가와 월급여 60% 중 낮은 금액
  return Math.min(baseRate, wageLimit)
}
```

---

## 3️⃣ 타 지원금 중복 조정

### 🔄 다른 지원금 차감
```typescript
// 고용보험·산재보험·사회적기업법 등 타 지원금이 있는 경우
const adjustForOtherSupports = (
  incentiveAmount: number,
  otherSupportAmount: number
): number => {
  // 차액만 지급 (타 지원금이 더 크거나 같으면 0원)
  return Math.max(0, incentiveAmount - otherSupportAmount)
}

// 예시:
// 장려금 단가 350,000원
// 고용촉진장려금 300,000원 수령 중
// → 실제 지급액: 350,000 - 300,000 = 50,000원
```

---

## 4️⃣ 지급 기간 제한

### ⏱️ 최대 12개월 제한
```typescript
interface IncentivePaymentRecord {
  employeeId: string
  startMonth: string      // 최초 지급 개시월 (YYYY-MM)
  monthsPaid: number      // 누적 지급 개월 수
  remainingMonths: number // 잔여 지급 가능 개월 수
}

const MAX_INCENTIVE_MONTHS = 12

const canReceiveIncentive = (
  employee: Employee,
  currentMonth: string,
  paymentRecords: IncentivePaymentRecord[]
): boolean => {
  const record = paymentRecords.find(r => r.employeeId === employee.id)
  
  if (!record) {
    // 최초 지급 - 가능
    return true
  }
  
  // 12개월 초과 시 지급 불가
  if (record.monthsPaid >= MAX_INCENTIVE_MONTHS) {
    return false
  }
  
  return true
}
```

### 📅 지급 개시 시점
```typescript
// 상시근로자로 전환된 월 또는 그 전월부터 지급
const getIncentiveStartMonth = (employee: Employee): string => {
  // 1. 당해 월 16일 이상 임금 지급일수가 있는 경우
  // 2. 월 근로시간 60시간 이상 (중증장애인 제외)
  
  // 위 조건을 충족한 최초 월 또는 그 전월
  return employee.regularEmploymentMonth
}
```

---

## 5️⃣ 초과 인원 산정 방식

### 📐 장려금 산정 기준 인원
```typescript
// ⚠️ 주의: 장려금 산정 시 의무고용인원 계산 방식이 다름
const calculateIncentiveQuota = (employeeCount: number, quotaRate: number): number => {
  // 소수점 이하 올림 (부담금과 다름!)
  return Math.ceil(employeeCount * quotaRate)
}

// 예시:
// 상시근로자 55명, 의무고용률 3.1%
// 부담금 의무인원: Math.floor(55 × 0.031) = 1명
// 장려금 의무인원: Math.ceil(55 × 0.031) = 2명  ← 올림!
```

### 🎯 초과 인원 계산
```typescript
const calculateExcessForIncentive = (
  employeeCount: number,
  severeDisabledCount: number, // 중증장애인만 카운트
  quotaRate: number
): number => {
  const incentiveQuota = Math.ceil(employeeCount * quotaRate)
  const excessCount = severeDisabledCount - incentiveQuota
  
  // 초과 인원만 해당 (미달 시 0)
  return Math.max(0, excessCount)
}
```

---

## 6️⃣ 월별 장려금 계산 로직

### 🧮 완전한 계산 함수
```typescript
interface MonthlyIncentiveCalculation {
  month: string
  employeeCount: number
  quotaRate: number
  incentiveQuota: number // 올림 적용
  severeDisabledCount: number
  excessCount: number
  eligibleEmployees: Employee[]
  monthlyIncentive: number
  details: EmployeeIncentiveDetail[]
}

interface EmployeeIncentiveDetail {
  employeeId: string
  name: string
  gender: string
  baseRate: number
  wageLimit: number
  otherSupports: number
  actualPayment: number
  monthsPaid: number
  remainingMonths: number
}

const calculateMonthlyIncentive = (
  month: string,
  employees: Employee[],
  employeeCount: number,
  quotaRate: number,
  paymentRecords: IncentivePaymentRecord[]
): MonthlyIncentiveCalculation => {
  
  // 1. 사업주 규모 확인 (50~99명)
  if (!isEligibleEmployer(employeeCount)) {
    return { ...zeroResult, reason: '지급 대상 사업주 아님 (50~99명 미만 아님)' }
  }
  
  // 2. 장려금 의무인원 계산 (올림 적용!)
  const incentiveQuota = Math.ceil(employeeCount * quotaRate)
  
  // 3. 중증장애인 카운트
  const severeEmployees = employees.filter(e => 
    e.severity === 'SEVERE' && 
    isActiveInMonth(e, month) &&
    !isExcluded(e)
  )
  
  // 4. 의무고용률 미달 확인
  if (severeEmployees.length >= incentiveQuota) {
    return { ...zeroResult, reason: '의무고용률 달성 (장려금 미지급)' }
  }
  
  // 5. 초과 인원 산정 (중증장애인만)
  const excessCount = Math.max(0, severeEmployees.length - incentiveQuota)
  
  if (excessCount === 0) {
    return { ...zeroResult, reason: '초과 인원 없음' }
  }
  
  // 6. 근로자별 장려금 계산
  const details: EmployeeIncentiveDetail[] = []
  let totalIncentive = 0
  
  for (const employee of severeEmployees) {
    // 6-1. 지급 가능 여부 확인 (12개월 제한)
    if (!canReceiveIncentive(employee, month, paymentRecords)) {
      continue
    }
    
    // 6-2. 기본 단가 (성별 구분)
    const baseRate = getBaseIncentiveRate(employee)
    
    // 6-3. 월급여액 60% 상한
    const wageLimit = employee.monthlyWageForMinimumWage * 0.6
    
    // 6-4. 타 지원금 차감
    const otherSupports = employee.otherSupportsAmount || 0
    const netIncentive = Math.min(baseRate, wageLimit) - otherSupports
    const actualPayment = Math.max(0, netIncentive)
    
    // 6-5. 지급 기록 업데이트
    const record = paymentRecords.find(r => r.employeeId === employee.id)
    const monthsPaid = record ? record.monthsPaid + 1 : 1
    const remainingMonths = MAX_INCENTIVE_MONTHS - monthsPaid
    
    details.push({
      employeeId: employee.id,
      name: employee.name,
      gender: employee.gender,
      baseRate,
      wageLimit,
      otherSupports,
      actualPayment,
      monthsPaid,
      remainingMonths
    })
    
    totalIncentive += actualPayment
  }
  
  return {
    month,
    employeeCount,
    quotaRate,
    incentiveQuota,
    severeDisabledCount: severeEmployees.length,
    excessCount,
    eligibleEmployees: severeEmployees,
    monthlyIncentive: totalIncentive,
    details
  }
}
```

---

## 7️⃣ 실제 적용 예시

### 📊 Case 1: 장려금 지급 대상 (50~99명 기업, 미달)

**기업 정보:**
- 상시근로자: 70명
- 의무고용률: 3.1%
- 중증장애인: 3명 (남성 2명, 여성 1명)
- 경증장애인: 1명

**계산:**
```typescript
// 1. 장려금 의무인원 (올림!)
const incentiveQuota = Math.ceil(70 × 0.031) = 3명

// 2. 초과 인원 (중증만 카운트)
const excessCount = 3 - 3 = 0명

// 3. 장려금
장려금 = 0원 (초과 인원 없음)
```

**결과:** ❌ 장려금 미지급 (초과 인원 없음)

---

### 📊 Case 2: 장려금 지급 (초과 고용)

**기업 정보:**
- 상시근로자: 55명
- 의무고용률: 3.1%
- 중증장애인: 4명 (남성 3명, 여성 1명)
  - 남성 A: 월급여 2,500,000원, 타 지원금 없음
  - 남성 B: 월급여 1,800,000원, 고용촉진장려금 200,000원
  - 남성 C: 월급여 2,200,000원, 타 지원금 없음
  - 여성 D: 월급여 2,800,000원, 타 지원금 없음

**계산:**
```typescript
// 1. 장려금 의무인원 (올림!)
const incentiveQuota = Math.ceil(55 × 0.031) = 2명

// 2. 초과 인원
const excessCount = 4 - 2 = 2명

// 3. 근로자별 장려금
// 남성 A:
baseRate = 350,000원
wageLimit = 2,500,000 × 0.6 = 1,500,000원
actual = MIN(350,000, 1,500,000) - 0 = 350,000원

// 남성 B:
baseRate = 350,000원
wageLimit = 1,800,000 × 0.6 = 1,080,000원
actual = MIN(350,000, 1,080,000) - 200,000 = 150,000원

// 남성 C:
baseRate = 350,000원
wageLimit = 2,200,000 × 0.6 = 1,320,000원
actual = MIN(350,000, 1,320,000) - 0 = 350,000원

// 여성 D:
baseRate = 450,000원
wageLimit = 2,800,000 × 0.6 = 1,680,000원
actual = MIN(450,000, 1,680,000) - 0 = 450,000원

// 4. 월 장려금 합계
월 장려금 = 350,000 + 150,000 + 350,000 + 450,000 = 1,300,000원
```

**결과:** ✅ 월 1,300,000원 지급 (최대 12개월)

---

### 📊 Case 3: 장려금 미지급 (100명 이상 기업)

**기업 정보:**
- 상시근로자: 1,000명 ← 100명 이상
- 의무고용률: 3.1%
- 중증장애인: 50명 (초과 고용 중)

**결과:** ❌ 장려금 미지급 (50~99명 미만 기업만 해당)

---

## 8️⃣ 주의사항

### ⚠️ 부담금과 장려금의 차이점

| 구분 | 부담금 | 장려금 |
|------|--------|--------|
| **대상 기업** | 50명 이상 모든 기업 | **50~99명 미만만** |
| **대상 장애인** | 중증 + 경증 | **중증만** |
| **의무인원 계산** | 내림 (floor) | **올림 (ceil)** |
| **미달 시** | 부담금 부과 | 장려금 미지급 |
| **초과 시** | 부담금 0원 | **장려금 지급** |
| **지급 기간** | 매월 부과 | **최대 12개월** |
| **성별 구분** | 없음 | **여성 중증 우대** |

---

## 9️⃣ 구현 체크리스트

### ✅ 필수 구현 사항

- [ ] 사업주 규모 검증 (50~99명)
- [ ] 의무고용률 미달 확인
- [ ] 중증장애인만 카운트
- [ ] 지급 제외 대상 검증
- [ ] 성별 구분 단가 적용
- [ ] 월급여액 60% 상한 적용
- [ ] 타 지원금 중복 조정
- [ ] 12개월 지급 기간 제한
- [ ] 근로자별 지급 이력 추적
- [ ] 의무인원 올림 (ceil) 적용
- [ ] 재고용 12개월 제한 적용

### 📝 필요한 데이터 필드

**Employee 테이블 추가 필드:**
```typescript
interface Employee {
  // 기존 필드...
  
  // 장려금 관련 추가 필드
  hasWageReductionApproval?: boolean      // 최저임금 감액 승인 여부
  hasIndustrialInsurance?: boolean        // 산재보험 가입 여부
  isReHiredWithin12Months?: boolean       // 12개월 이내 재고용 여부
  isPublicJobProgram?: boolean            // 공공일자리사업 참여 여부
  otherSupportsAmount?: number            // 타 지원금 월액
  monthlyWageForMinimumWage?: number      // 최저임금 산입 월급여액
  regularEmploymentMonth?: string         // 상시근로자 전환월 (YYYY-MM)
}
```

**IncentivePaymentRecord 테이블 (신규):**
```typescript
interface IncentivePaymentRecord {
  id: string
  employeeId: string
  companyId: string
  startMonth: string           // 최초 지급 개시월
  endMonth: string            // 지급 종료월 (12개월 후)
  monthsPaid: number          // 누적 지급 개월 수
  totalAmountPaid: number     // 누적 지급 금액
  isActive: boolean           // 지급 진행 중 여부
  terminationReason?: string  // 지급 중단 사유
  createdAt: Date
  updatedAt: Date
}
```

---

## 🎯 결론

### 현재 구현 vs. 올바른 구현

**현재 (잘못된 구현):**
```typescript
// ❌ 모든 기업, 모든 장애인, 무제한 지급
const incentive = Math.max(0, recognizedCount - obligatedCount) × 350000
```

**올바른 구현:**
```typescript
// ✅ 50~99명 기업, 중증만, 12개월 제한, 성별 구분
const incentive = calculateMonthlyIncentive({
  companySize: 50~99,
  targetDisability: 'SEVERE_ONLY',
  maxMonths: 12,
  maleRate: 350000,
  femaleRate: 450000,
  wageLimit: 'monthlyWage × 0.6',
  otherSupports: 'deduct',
  quotaCalculation: 'CEIL' // 올림!
})
```

---

## 📌 다음 단계

1. **데이터베이스 스키마 수정**
   - Employee 테이블에 필수 필드 추가
   - IncentivePaymentRecord 테이블 생성

2. **계산 로직 재구현**
   - `employment-calculator.ts` 전면 수정
   - 올바른 장려금 계산 함수 구현

3. **UI 수정**
   - 50~99명 기업만 장려금 표시
   - 근로자별 지급 현황 표시
   - 잔여 지급 가능 개월 수 표시

4. **테스트 케이스 작성**
   - 50~99명 기업 시나리오
   - 100명 이상 기업 시나리오 (장려금 0원)
   - 중증/경증 혼합 시나리오
   - 12개월 제한 시나리오

5. **문서 업데이트**
   - README.md 수정
   - API 문서 업데이트
   - 사용자 가이드 작성

---

**작성일:** 2026-02-22  
**작성자:** Jangpyosa Development Team  
**문서 버전:** 1.0  
**참고:** 2026년 장애인고용개선장려금 시행지침
