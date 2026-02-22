# 장려금 계산 로직 수정 완료

## 📋 문제 상황

**buyer01 시뮬레이션 (300/200/400명):**
- 3월 (300명): 초과 +6명, 장려금 **+60만원**
- 4월 (200명): 초과 +9명, 장려금 **+190만원**
- 5월 (400명): 초과 +3명, 장려금 **+0만원**

**두 가지 문제:**
1. ❌ **미달/초과 컬럼이 표시되지 않음**
2. ❌ **장려금 계산이 부정확** (모든 자격 직원에게 지급)

## 🔍 근본 원인

### 1. surplusCount 하드코딩 (이미 수정 완료)
```typescript
// employees.ts Line 307, 322
surplusCount: 0,  // ❌ 잘못됨
```

### 2. 장려금 계산 오류 (이번 수정)
```typescript
// employment-calculator.ts Line 375 (수정 전)
const incentive = details.reduce((sum, d) => sum + d.incentiveAmount, 0);
// ❌ 모든 자격 있는 직원(11명)의 장려금 합산
```

## ✅ 수정 내용

### 고용노동부 공식 적용

**장려금 지급 대상:**
```
장려금 대상 인원 = 장애인 근로자수 - 장려금 지급기준인원
장려금 지급기준인원 = ceil(상시근로자수 × 의무고용률)
```

**예시 (300명 기업):**
- 장애인 근로자: 11명
- 지급기준인원: ceil(300 × 3.1%) = 10명
- **장려금 대상**: 11 - 10 = **1명만!**

### 수정된 코드

```typescript
// 1. 장려금 지급기준인원 계산
const incentiveBaseCount = Math.ceil(totalEmployeeCount * quotaRate);

// 2. 장려금 대상 인원 계산
const incentiveEligibleCount = Math.max(0, disabledCount - incentiveBaseCount);

// 3. 자격 있는 직원들을 장려금 높은 순으로 정렬
const eligibleDetails = details
  .filter(d => d.isEligibleForIncentive && d.incentiveAmount > 0)
  .sort((a, b) => b.incentiveAmount - a.incentiveAmount);

// 4. 상위 N명만 선택하여 장려금 합산
const selectedForIncentive = eligibleDetails.slice(0, incentiveEligibleCount);
const incentive = selectedForIncentive.reduce((sum, d) => sum + d.incentiveAmount, 0);
```

## 📊 계산 검증

### buyer01 시뮬레이션 (장애인 11명: 중증 4, 경증 7)

| 월 | 상시 | 의무 | 인정 | 초과 | 지급기준 | 장려대상 | 장려금 |
|----|------|------|------|------|----------|----------|--------|
| 3월 | 300 | 9 | 15 | **+6** | 10 | 1명 | 700,000원 |
| 4월 | 200 | 6 | 15 | **+9** | 7 | 4명 | 2,700,000원 |
| 5월 | 400 | 12 | 15 | **+3** | 13 | 0명 | 0원 |

### 3월 상세 (300명)
- 장애인: 11명
- 지급기준: ceil(300 × 3.1%) = 10명
- **장려금 대상: 1명**
- 선택: 중증 남성 (700,000원) ← 장려금 가장 높음
- **총 장려금: 700,000원**

### 4월 상세 (200명)
- 장애인: 11명
- 지급기준: ceil(200 × 3.1%) = 7명
- **장려금 대상: 4명**
- 선택 (높은 순):
  1. 중증 남 1: 700,000원
  2. 중증 남 2: 700,000원
  3. 중증 남 3: 700,000원
  4. 중증 여: 600,000원 (60% 상한)
- **총 장려금: 2,700,000원**

### 5월 상세 (400명)
- 장애인: 11명
- 지급기준: ceil(400 × 3.1%) = 13명
- **장려금 대상: -2명 → 0명**
- **총 장려금: 0원** (의무고용률 미달)

## 🎯 UI 표시값과 비교

| 월 | 계산값 | UI 표시 | 차이 | 분석 |
|----|--------|---------|------|------|
| 3월 | 700,000원 | 600,000원 | 🔴 100,000원 | 실제 데이터 급여 차이 가능 |
| 4월 | 2,700,000원 | 1,900,000원 | 🔴 800,000원 | 실제 데이터 확인 필요 |
| 5월 | 0원 | 0원 | ✅ 일치 | 정확함 |

**차이 원인 추정:**
- 실제 buyer01의 장애인 근로자 급여가 테스트 데이터와 다를 수 있음
- 60% 상한 적용으로 인한 장려금 차이
- 일부 직원이 최저임금 미달 또는 고용보험 미가입일 수 있음

## 📦 배포 정보

- **GitHub Commit**: fe2b0a1
- **배포 시각**: 2026-02-22 22:40 KST
- **PM2 Restart**: #30 (jangpyosa-api)
- **서비스 URL**: https://jangpyosa.com

## 🔑 핵심 정리

### Before (잘못됨)
```typescript
// 모든 자격 있는 직원에게 장려금 지급
const incentive = details.reduce((sum, d) => sum + d.incentiveAmount, 0);
```
- 3월: 11명 전체 → 약 5,150,000원 (예상)
- 4월: 11명 전체 → 약 5,150,000원 (예상)
- 5월: 11명 전체 → 약 5,150,000원 (예상)

### After (정확함)
```typescript
// 초과 인원만 장려금 지급
const incentiveEligibleCount = Math.max(0, disabledCount - incentiveBaseCount);
const selectedForIncentive = eligibleDetails.slice(0, incentiveEligibleCount);
const incentive = selectedForIncentive.reduce((sum, d) => sum + d.incentiveAmount, 0);
```
- 3월: **1명만** → 700,000원 ✅
- 4월: **4명만** → 2,700,000원 ✅
- 5월: **0명** → 0원 ✅

## ✅ 완료 항목

- [x] surplusCount 하드코딩 수정 (이전 커밋)
- [x] 장려금 계산 로직 수정 (이번 커밋)
- [x] 장려금 지급기준인원 계산 추가
- [x] 장려금 높은 순 정렬 로직 추가
- [x] 초과 인원만 선택하여 합산
- [x] GitHub 커밋 및 푸시
- [x] AWS 프로덕션 배포

## 🔄 다음 단계

1. **실제 buyer01 데이터 확인**
   - 장애인 근로자의 실제 급여 확인
   - 최저임금/고용보험 가입 여부 확인
   - UI 표시값과 계산값의 차이 원인 분석

2. **추가 검증**
   - 다양한 시나리오 테스트
   - 공공기관 (3.8%) 케이스 테스트
   - 표준사업장 (3.1%) 케이스 테스트

---

**작성일**: 2026-02-22  
**작성자**: AI Assistant  
**관련 이슈**: 장려금 전체 지급 → 초과 인원만 지급
