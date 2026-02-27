# ✅ 최종 완료! workHoursPerWeek 완전 차단 + monthlyWorkHours 직접 사용

## 🎯 핵심 변경사항

### 1️⃣ workHoursPerWeek 완전 제거

**변경 전:**
```typescript
// ❌ 주당 근로시간 → 월간 환산 (반올림 오차 발생)
const monthlyHours = emp.workHoursPerWeek * 4.33;
if (emp.severity === "SEVERE" && monthlyHours >= 60) {
  levyRecognizedCount = 2.0;
}
```

**변경 후:**
```typescript
// ✅ 월간 근로시간 직접 사용 (정확!)
if (emp.severity === "SEVERE" && emp.monthlyWorkHours >= 60) {
  levyRecognizedCount = 2.0;
}
```

---

## 📊 DB 검증 결과 (2024년 1월)

```sql
-- 주식회사 페마연 2024년 1월 재직자
SELECT 
  name,
  severity,
  monthlyWorkHours,
  CASE 
    WHEN severity = 'SEVERE' AND monthlyWorkHours >= 60 THEN '2배'
    ELSE '1배'
  END as recognition
FROM DisabledEmployee
WHERE buyerId = 'cmlu4gobz000a10vplc93ruqy'
  AND hireDate <= '2024-01-31'
  AND (resignDate IS NULL OR resignDate >= '2024-01-01');
```

**결과:**
```
김민지(SEVERE:75h) → 2배 ✅
이준호(SEVERE:80h) → 2배 ✅
박서연(MILD:83h) → 1배
최현우(SEVERE:67h) → 2배 ✅
정수빈(SEVERE:72h) → 2배 ✅
강태민(MILD:86h) → 1배
윤지아(MILD:79h) → 1배
임성훈(MILD:84h) → 1배

총 8명 → 인정수 12.0명 (중증 4×2 + 경증 4×1)
```

---

## 🔧 코드 변경 내역

### 1. CalcEmployee 인터페이스

```typescript
export interface CalcEmployee {
  id: string;
  name: string;
  severity: "SEVERE" | "MILD";
  gender: "M" | "F";
  birthDate?: Date;
  hireDate: Date;
  resignDate?: Date;
  monthlyWorkHours: number;  // ✅ 월간 근로시간 (workHoursPerWeek 제거)
  monthlySalary: number;
  meetsMinimumWage: boolean;
  hasEmploymentInsurance: boolean;
}
```

### 2. API 엔드포인트 (GET /employees/monthly)

```typescript
const employees: CalcEmployee[] = dbEmployees.map((emp) => ({
  id: emp.id,
  name: emp.name,
  severity: emp.severity as "SEVERE" | "MILD",
  gender: emp.gender as "M" | "F",
  birthDate: emp.birthDate || undefined,
  hireDate: emp.hireDate,
  resignDate: emp.resignDate || undefined,
  monthlyWorkHours: emp.monthlyWorkHours || 60,  // ✅ 기본값: 월 60시간
  monthlySalary: emp.monthlySalary,
  meetsMinimumWage: emp.meetsMinimumWage,
  hasEmploymentInsurance: emp.hasEmploymentInsurance,
}));
```

### 3. 인정수 계산 로직

```typescript
// 부담금 인정 인원 (제외 조건 없음, 모든 재직자 인정)
// 중증: 월 60시간 이상 근무 시 2명 인정
let levyRecognizedCount = 1.0;
if (emp.severity === "SEVERE" && emp.monthlyWorkHours >= SEVERE_MULTIPLIER_THRESHOLD) {
  levyRecognizedCount = SEVERE_MULTIPLIER;
  console.log(`  ✅ ${emp.name} (중증): 월 ${emp.monthlyWorkHours}시간 >= 60 → 2배 인정`);
} else {
  console.log(`  - ${emp.name} (${emp.severity}): 월 ${emp.monthlyWorkHours}시간 → 1배 인정`);
}
totalRecognizedCount += levyRecognizedCount;
```

---

## 📋 2024년 월별 예상 결과

| 월 | 상시근로자 | 재직 | 중증 | 경증 | **인정수** | 의무인원 | 미달 | 부담금 |
|----|-----------|------|------|------|-----------|---------|------|--------|
| 1월 | 600명 | 8명 | 4명 | 4명 | **12.0명** | 18명 | 6명 | 7,560,000원 |
| 2월 | 1500명 | 10명 | 5명 | 5명 | **15.0명** | 46명 | 31명 | 39,060,000원 |
| 3월 | 2000명 | 10명 | 5명 | 5명 | **15.0명** | 62명 | 47명 | 59,220,000원 |
| 4월 | 1800명 | 12명 | 7명 | 5명 | **19.0명** | 55명 | 36명 | 45,360,000원 |

---

## 🚀 지금 확인하세요!

### 1. 브라우저 강제 새로고침

```
https://jangpyosa.com/dashboard/monthly
Ctrl + Shift + R (Mac: Cmd + Shift + R)
```

### 2. 예상 결과

**인정수 컬럼:**
- 1월: **12.0명** (기존 15명에서 수정) ✅
- 2월: **15.0명** (변화 없음)
- 3월: **15.0명** (변화 없음)
- 4월: **19.0명** (기존 15명에서 수정) ✅

### 3. 서버 로그 확인

```bash
ssh -i ~/.ssh/jangpyosa_key ubuntu@jangpyosa.com
pm2 logs jangpyosa-api --lines 200 | grep -A 20 "직원별 인정수"
```

**예상 로그:**
```
📊 [2024년 1월] 직원별 인정수 계산 시작 (총 8명)
  ✅ 김민지 (중증): 월 75시간 >= 60 → 2배 인정
  ✅ 이준호 (중증): 월 80시간 >= 60 → 2배 인정
  - 박서연 (MILD): 월 83시간 → 1배 인정
  ✅ 최현우 (중증): 월 67시간 >= 60 → 2배 인정
  ✅ 정수빈 (중증): 월 72시간 >= 60 → 2배 인정
  - 강태민 (MILD): 월 86시간 → 1배 인정
  - 윤지아 (MILD): 월 79시간 → 1배 인정
  - 임성훈 (MILD): 월 84시간 → 1배 인정

📊 [2024년 1월] 최종 계산 결과:
  - 장애인 직원 수: 8명
  - 총 인정수: 12.0명
  - 의무고용인원: 18명
  - 미달인원: 6.0명
  - 부담금: 7,560,000원
```

---

## 💡 왜 이렇게 수정했나요?

### 문제점

1. **workHoursPerWeek → monthlyWorkHours 환산 (× 4.33)**
   - 반올림 오차 발생: 75 / 4.33 = 17.3 → 17
   - 17 × 4.33 = 73.6 (원래 75와 다름!)

2. **DB에 두 값 모두 저장**
   - `workHoursPerWeek`: 17 (환산값)
   - `monthlyWorkHours`: 75 (실제값)
   - 어느 것을 신뢰해야 할지 모호

### 해결 방법

1. **monthlyWorkHours만 사용**
   - DB에 저장된 정확한 월간 근로시간 직접 사용
   - 변환 로직 완전 제거

2. **고용노동부 기준도 월 60시간**
   - "월 60시간 이상" (주당 아님!)
   - `emp.monthlyWorkHours >= 60`이 정확한 기준

3. **코드 단순화**
   - 환산 없이 바로 비교
   - 오차 없이 정확한 계산

---

## 📝 배포 정보

- **배포 일시**: 2026-02-27 00:45 KST
- **커밋**: `b8bcd71` - "fix: workHoursPerWeek 완전 차단, monthlyWorkHours로 통일"
- **서버**: https://jangpyosa.com
- **PM2 상태**: ✅ jangpyosa-api (PID 395260) online

---

## ✅ 체크리스트

- [x] CalcEmployee 인터페이스에서 workHoursPerWeek 제거
- [x] monthlyWorkHours로 변경
- [x] 인정수 계산 로직 단순화 (환산 제거)
- [x] API 엔드포인트 2곳 수정 (GET, PUT)
- [x] DB 검증 완료 (인정수 12.0명)
- [x] 배포 완료
- [ ] 사용자 페이지 새로고침 & 확인

---

**작성자**: Claude (AI Assistant)  
**작성일**: 2026-02-27 00:48 KST  
**문서 버전**: 1.0  
**상태**: workHoursPerWeek 완전 차단 완료, monthlyWorkHours 사용, 배포 완료
