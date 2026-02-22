# ✅ 고용장려금 계산 로직 완전 통일 완료

## 📅 최종 배포 정보
- **배포일시**: 2026-02-22 22:15 KST
- **커밋**: 9894ed6
- **배포 환경**: AWS 프로덕션 (jangpyosa.com)

---

## 🎯 발견된 문제

### ❌ 백엔드와 프론트엔드 계산 로직 불일치

**백엔드 (employment-calculator.ts):**
```typescript
// ✅ 경증/중증 모두 60% 상한 적용
const wageLimit = employee.monthlySalary * 0.6;
const incentiveRate = Math.min(baseIncentive, wageLimit);
```

**프론트엔드 (incentive-annual/page.tsx) - 수정 전:**
```typescript
// ❌ 중증만 60% 상한 적용
let amount = rate;
if (w.severity === "SEVERE") {
  amount = Math.min(rate, w.monthlySalary * 0.6);
}
```

**문제:**
- 경증 장애인은 60% 상한 없이 전액 지급
- 고용노동부 기준과 불일치
- 백엔드와 프론트엔드 계산 결과 상이

---

## ✅ 수정 완료

### 프론트엔드 계산 로직 통일

```typescript
// ✅ 경증/중증 모두 60% 상한 적용
const amount = Math.min(rate, w.monthlySalary * 0.6);
```

---

## 📊 계산 로직 비교 (최종)

### 1️⃣ 지급 단가 (완전 동일)

**백엔드:**
```typescript
const INCENTIVE_RATES_2026 = {
  SEVERE: { MALE: 700000, FEMALE: 900000 },
  MILD: { MALE: 350000, FEMALE: 500000 }
};
```

**프론트엔드:**
```typescript
const INCENTIVE_RATES_2026 = {
  MILD_M: 350000,
  MILD_F: 500000,
  SEVERE_M: 700000,
  SEVERE_F: 900000,
};
```

### 2️⃣ 월임금 60% 상한 (완전 동일)

**백엔드:**
```typescript
const baseRate = getBaseIncentiveRate(severity, gender);
const wageLimit = monthlySalary * 0.6;
const actualIncentive = Math.min(baseRate, wageLimit);
```

**프론트엔드:**
```typescript
let rate = INCENTIVE_RATES_2026[...]; // 성별/중증도별 단가
const amount = Math.min(rate, w.monthlySalary * 0.6);
```

### 3️⃣ 의무고용률 (완전 동일)

**백엔드:**
```typescript
function getQuotaRate(companyType: string): number {
  if (companyType === "PUBLIC" || ...) return 0.038;  // 3.8%
  return 0.031;  // 3.1%
}
```

**프론트엔드:**
```typescript
const quotaRate = companyType === "PRIVATE" ? 0.031 : 0.038;
```

### 4️⃣ 지급 기준 인원 (완전 동일)

**백엔드 & 프론트엔드 공통:**
```typescript
const baseCount = Math.ceil(employees * quotaRate);  // 올림
```

---

## 🧪 테스트 케이스

### 경증 남성, 월급 2,000,000원

**백엔드 계산:**
```
단가: 350,000원
60% 상한: 2,000,000 × 0.6 = 1,200,000원
실지급: MIN(350,000, 1,200,000) = 350,000원 ✅
```

**프론트엔드 계산 (수정 전):**
```
단가: 350,000원
60% 상한: 미적용
실지급: 350,000원 ✅ (우연히 일치)
```

**프론트엔드 계산 (수정 후):**
```
단가: 350,000원
60% 상한: 2,000,000 × 0.6 = 1,200,000원
실지급: MIN(350,000, 1,200,000) = 350,000원 ✅
```

### 경증 여성, 월급 800,000원

**백엔드 계산:**
```
단가: 500,000원
60% 상한: 800,000 × 0.6 = 480,000원
실지급: MIN(500,000, 480,000) = 480,000원 ✅
```

**프론트엔드 계산 (수정 전):**
```
단가: 500,000원
60% 상한: 미적용
실지급: 500,000원 ❌ (20,000원 차이!)
```

**프론트엔드 계산 (수정 후):**
```
단가: 500,000원
60% 상한: 800,000 × 0.6 = 480,000원
실지급: MIN(500,000, 480,000) = 480,000원 ✅
```

### 중증 남성, 월급 1,500,000원

**백엔드 & 프론트엔드 (수정 전/후 모두 동일):**
```
단가: 700,000원
60% 상한: 1,500,000 × 0.6 = 900,000원
실지급: MIN(700,000, 900,000) = 700,000원 ✅
```

---

## 📁 수정된 파일

### `/apps/web/src/app/calculators/incentive-annual/page.tsx`

**변경 라인: 291-295**

**수정 전:**
```typescript
// 중증 장애인: min(단가, 임금 × 60%)
let amount = rate;
if (w.severity === "SEVERE") {
  amount = Math.min(rate, w.monthlySalary * 0.6);
}
```

**수정 후:**
```typescript
// 고용노동부 기준: 경증/중증 모두 지급단가와 월임금 60% 중 낮은 금액 적용
const amount = Math.min(rate, w.monthlySalary * 0.6);
```

---

## 🎯 최종 검증

### ✅ 백엔드 (employment-calculator.ts)
- [x] 지급 단가: 경증 남35/여50, 중증 남70/여90
- [x] 60% 상한: 경증/중증 모두 적용
- [x] 의무고용률: 민간 3.1% / 공공 3.8%
- [x] 지급 기준: ceil(상시근로자 × 의무고용률)

### ✅ 프론트엔드 (incentive-annual/page.tsx)
- [x] 지급 단가: 경증 남35/여50, 중증 남70/여90
- [x] 60% 상한: 경증/중증 모두 적용 ← **수정 완료**
- [x] 의무고용률: 민간 3.1% / 공공 3.8%
- [x] 지급 기준: ceil(상시근로자 × 의무고용률)

---

## 🚀 배포 현황

### ✅ GitHub
- **저장소**: masolshop/jangpyosa
- **브랜치**: main
- **커밋**: 9894ed6
- **상태**: ✅ 푸시 완료

### ✅ AWS 프로덕션
- **서버**: https://jangpyosa.com
- **웹**: ✅ 온라인 (PM2 restart #87)
- **API**: ✅ 온라인 (PM2 restart #28)
- **배포시각**: 2026-02-22 22:15 KST

---

## 📌 중요 변경사항 요약

### 🎯 핵심 수정 1가지

**월임금 60% 상한을 경증/중증 모두 적용**
- 이전: 중증만 60% 상한 적용
- 수정: 경증/중증 모두 60% 상한 적용
- 근거: 고용노동부 공식 (지급단가와 월임금액의 60% 중 낮은 금액 적용)

---

## ✅ 결론

**이제 백엔드와 프론트엔드의 고용장려금 계산 로직이 100% 동일합니다!**

### 계산 로직 일치 확인

| 항목 | 백엔드 | 프론트엔드 | 일치 |
|------|--------|------------|------|
| 지급 단가 | 경증 남35/여50, 중증 남70/여90 | 경증 남35/여50, 중증 남70/여90 | ✅ |
| 60% 상한 | 경증/중증 모두 적용 | 경증/중증 모두 적용 | ✅ |
| 의무고용률 | 민간 3.1%, 공공 3.8% | 민간 3.1%, 공공 3.8% | ✅ |
| 지급 기준 | ceil(상시근로자 × 의무고용률) | ceil(상시근로자 × 의무고용률) | ✅ |
| 표준사업장 | 민간기업 (3.1%) | 민간기업 (3.1%) | ✅ |

**모든 항목이 완벽하게 일치합니다!** 🎉

---

**배포 완료 시각**: 2026-02-22 22:15 KST  
**담당**: Jangpyosa Development Team  
**서비스 URL**: https://jangpyosa.com  
**계산기 URL**: https://jangpyosa.com/calculators/incentive-annual
