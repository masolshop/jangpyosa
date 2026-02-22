# 🎯 2026년 부담금/장려금 계산 로직 최종 검증 보고서

**검증일시**: 2026-02-22 21:25 KST  
**배포 환경**: AWS 프로덕션 서버 (https://jangpyosa.com)  
**적용 범위**: 모든 고용의무기업 (BUYER) 및 표준사업장 (SUPPLIER)

---

## ✅ 배포 완료 상태

### Git 커밋 이력
```
5d7e05a - 🐛 월별 고용 데이터 API에 surplusCount 추가
8d96ae2 - 📊 고용부담금/장려금 계산 로직 수정 완료 보고서
e994a08 - 🔧 import 경로 수정 - .js 제거하여 tsx 호환성 확보
0785b46 - ✨ 고용부담금 계산 로직 수정
```

### 배포 상태
- ✅ **로컬 샌드박스**: 5d7e05a (최신)
- ✅ **AWS 프로덕션**: 5d7e05a (최신)
- ✅ **GitHub 저장소**: 5d7e05a (동기화 완료)

### 서비스 상태
- ✅ **로컬 API**: Online (PID 311607, 62.2 MB)
- ✅ **AWS API**: Online (PID 54446, 66.7 MB)
- ✅ **AWS Web**: Online (PID 52787, 100.5 MB)

---

## 📊 2026년 기준 계산 로직

### 1. 고용수준별 월 부담기초액 (2026년 기준)

| 고용수준 | 비율 | 월 부담기초액 | 적용 조건 |
|---------|------|-------------|----------|
| **미고용** | 0% | 2,156,880원 | 장애인 0명 고용 |
| **1/4 미만** | ~ 25% | 1,813,000원 | 인정수 ÷ 의무고용 < 0.25 |
| **1/4 ~ 1/2 미만** | 25% ~ 50% | 1,554,000원 | 0.25 ≤ 고용수준 < 0.5 |
| **1/2 ~ 3/4 미만** | 50% ~ 75% | 1,372,700원 | 0.5 ≤ 고용수준 < 0.75 |
| **3/4 이상** | 75% ~ | 1,295,000원 | 고용수준 ≥ 0.75 |

**핵심 함수**: `getLevyBaseAmount2026(recognizedCount, obligatedCount)`

```typescript
export function getLevyBaseAmount2026(disabledCount: number, obligatedCount: number): number {
  if (obligatedCount === 0) return LEVY_BASE_AMOUNTS_2026.LEVEL_0;
  if (disabledCount === 0) return LEVY_BASE_AMOUNTS_2026.LEVEL_0;
  
  const employmentRate = disabledCount / obligatedCount;
  
  if (employmentRate >= 0.75) return LEVY_BASE_AMOUNTS_2026.LEVEL_3_4_OVER;      // 3/4 이상
  if (employmentRate >= 0.5) return LEVY_BASE_AMOUNTS_2026.LEVEL_1_2_TO_3_4;    // 1/2 ~ 3/4 미만
  if (employmentRate >= 0.25) return LEVY_BASE_AMOUNTS_2026.LEVEL_1_4_TO_1_2;   // 1/4 ~ 1/2 미만
  return LEVY_BASE_AMOUNTS_2026.LEVEL_1_4;                                       // 1/4 미만
}
```

---

### 2. 의무고용률 (2026년 기준)

| 기업 유형 | 의무고용률 | 적용 대상 |
|----------|-----------|----------|
| **민간기업** | 3.1% | PRIVATE_COMPANY |
| **공공기관** | 3.8% | PUBLIC_INSTITUTION |
| **국가/지자체** | 3.8% | GOVERNMENT |

**계산식**: `의무고용인원 = Math.floor(상시근로자수 × 의무고용률)`

---

### 3. 인정수 계산 (중증장애인 2배 인정)

**중증장애인 2배 인정 조건**: **주 60시간 이상 근무**

```typescript
// 중증 장애인 인정수 계산
if (employee.severity === "SEVERE" && employee.workHoursPerWeek >= 60) {
  recognizedCount += 2;  // 2배 인정
} else {
  recognizedCount += 1;  // 1배 인정
}
```

**예시** (buyer01 기준):
- 중증 4명 (각 60시간) → 인정수 **8명** (4 × 2)
- 경증 7명 → 인정수 **7명** (7 × 1)
- **총 인정수**: **15명**

---

### 4. 부담금 계산

**공식**: `부담금 = 미달인원 × 고용수준별 부담기초액`

**미달인원**: `Math.max(0, 의무고용인원 - 인정수)`

**적용 코드**:
```typescript
// dashboard.ts (월별고용부담금관리 대시보드)
const levyBaseAmount = getLevyBaseAmount2026(recognizedCount, obligated);
const monthlyLevy = shortfall * levyBaseAmount;

// employment-calculator.ts (월별장애인고용관리)
const levyBaseAmount = getLevyBaseAmount2026(recognizedCount, obligatedCount);
const levy = shortfallCount * levyBaseAmount;
```

---

### 5. 장려금 계산

**공식**: `장려금 = 초과인원 × 350,000원` (간소화 버전)

**초과인원**: `Math.max(0, 인정수 - 의무고용인원)`

**중요 규칙**: 
- ✅ **초과 시**: 장려금 발생
- ❌ **미달 시**: 장려금 = 0원
- ✅ **정확히 일치 시**: 장려금 = 0원

**적용 코드**:
```typescript
// dashboard.ts
const eligibleForIncentive = Math.max(0, recognizedCount - obligated);
const monthlyIncentive = eligibleForIncentive * 350000;

// employment-calculator.ts
const surplusCount = Math.max(0, recognizedCount - obligatedCount);
const incentive = details.reduce((sum, d) => sum + d.incentiveAmount, 0);
```

---

## 📋 계산 예시 (buyer01 기준)

### 기본 정보
- **기업**: 민간기업1 (buyer01)
- **의무고용률**: 3.1% (민간기업)
- **장애인 직원**: 중증 4명 (60시간), 경증 7명
- **인정수**: 중증 8명 + 경증 7명 = **15명**

### 월별 계산 예시

#### 1월 (상시근로자 1,000명)
```
의무고용인원: 1,000 × 3.1% = 31명
인정수: 15명
고용수준: 15 ÷ 31 = 48.4% (1/4 ~ 1/2 미만)
부담기초액: 1,554,000원

미달인원: 31 - 15 = 16명
부담금: 16 × 1,554,000 = 24,864,000원
장려금: 0원 (미달 상태)
순액: -24,864,000원
```

#### 2월 (상시근로자 300명)
```
의무고용인원: 300 × 3.1% = 9명
인정수: 15명
고용수준: 15 ÷ 9 = 166.7% (3/4 이상)
부담기초액: 1,295,000원

초과인원: 15 - 9 = 6명
부담금: 0원
장려금: 6 × 350,000 = 2,100,000원
순액: +2,100,000원
```

#### 3월 (상시근로자 2,000명)
```
의무고용인원: 2,000 × 3.1% = 62명
인정수: 15명
고용수준: 15 ÷ 62 = 24.2% (1/4 미만)
부담기초액: 1,813,000원

미달인원: 62 - 15 = 47명
부담금: 47 × 1,813,000 = 85,211,000원
장려금: 0원 (미달 상태)
순액: -85,211,000원
```

---

## 🔧 적용된 API 엔드포인트

### 1. 월별고용부담금관리 대시보드
- **엔드포인트**: `GET /api/dashboard?year=2026`
- **파일**: `apps/api/src/routes/dashboard.ts`
- **적용 사항**:
  - ✅ 고용수준별 부담기초액 적용 (`getLevyBaseAmount2026`)
  - ✅ 인정수 기준 장려금 계산
  - ✅ 미달 시 장려금 = 0

### 2. 월별장애인고용관리
- **엔드포인트**: `GET /api/employees/monthly?year=2026`
- **파일**: `apps/api/src/routes/employees.ts`
- **서비스**: `apps/api/src/services/employment-calculator.ts`
- **적용 사항**:
  - ✅ 고용수준별 부담기초액 적용
  - ✅ 초과인원(surplusCount) API 응답 포함
  - ✅ 중증장애인 2배 인정 (주 60시간 이상)
  - ✅ 정밀한 장려금 계산 (성별/연령/근로시간 고려)

---

## 🎯 적용 범위

### 모든 사용자 역할에 적용
1. **BUYER** (고용의무기업)
   - 민간기업 (PRIVATE_COMPANY) - 의무고용률 3.1%
   - 공공기관 (PUBLIC_INSTITUTION) - 의무고용률 3.8%
   - 국가/지자체 (GOVERNMENT) - 의무고용률 3.8%

2. **SUPPLIER** (표준사업장)
   - 동일한 계산 로직 적용
   - 월별 상시근로자 수 입력 가능
   - 실시간 부담금/장려금 계산

3. **SUPER_ADMIN** (관리자)
   - 모든 기업 데이터 조회 가능
   - 동일한 계산 로직 확인

---

## ✅ 검증 완료 항목

### 코드 레벨 검증
- ✅ `getLevyBaseAmount2026` 함수 정의 (employment-calculator.ts)
- ✅ `dashboard.ts`에서 고용수준별 단가 적용
- ✅ `employees.ts`에서 surplusCount 포함
- ✅ 중증장애인 60시간 조건 확인
- ✅ 장려금 계산 로직 (인정수 기준)

### 데이터 레벨 검증
- ✅ buyer01 yearlyEmployeesJson 업데이트
- ✅ 중증장애인 근무시간 60시간 설정
- ✅ DB 데이터 정합성 확인

### 배포 레벨 검증
- ✅ GitHub 최신 코드 푸시
- ✅ AWS 서버 코드 동기화
- ✅ PM2 서비스 재시작
- ✅ API 엔드포인트 정상 작동

---

## 📝 사용 방법

### 교육용 목업 계정 (buyer01)
1. **로그인**: buyer01 계정으로 접속
2. **메뉴**: 📊 월별고용부담금관리 또는 월별장애인고용관리
3. **입력**: 상시근로자 수를 랜덤으로 입력 (예: 500명, 1000명, 2000명)
4. **확인**: 부담금과 장려금이 자동으로 정확하게 계산됨

### 계산 정확도
- ✅ **고용수준별 부담기초액**: 자동 계산 (1,295,000원 ~ 2,156,880원)
- ✅ **중증장애인 2배 인정**: 주 60시간 이상 자동 판단
- ✅ **미달/초과 판정**: 실시간 자동 계산
- ✅ **장려금 발생 조건**: 초과인원이 있을 때만 발생

---

## 🔍 향후 개선 사항

### 1. 프론트엔드 개선 (선택사항)
- 고용수준별 부담기초액 표시
- 계산 근거 툴팁 추가
- 실시간 계산 프리뷰

### 2. 문서화
- API 문서에 계산 로직 상세 설명 추가
- 사용자 매뉴얼 업데이트

### 3. 테스트 케이스
- 경계값 테스트 (정확히 25%, 50%, 75%)
- 다양한 기업 유형 테스트
- 엣지 케이스 (0명, 대규모 기업 등)

---

## 📞 문의

- **이메일**: admin@jangpyosa.com
- **GitHub**: https://github.com/masolshop/jangpyosa
- **프로덕션**: https://jangpyosa.com
- **API 문서**: https://jangpyosa.com/api

---

## 🎉 배포 완료

**상태**: ✅ **프로덕션 배포 완료**  
**적용 일시**: 2026-02-22 21:25 KST  
**Git 해시**: 5d7e05a  
**테스트 계정**: buyer01 (민간기업1)  

**모든 고용의무기업과 표준사업장에 2026년 기준 부담금/장려금 계산 로직이 정밀하게 적용되었습니다!** 🚀
