# 장표사 시스템 ID 체계 정리

## 📋 현재 ID 체계 분석 (2026-02-27)

### 1️⃣ **Company ID** (기업 ID)
모든 기업의 최상위 ID

```
테이블: Company
필드: id (TEXT, PRIMARY KEY)
타입: 
  - BUYER: 고용의무기업 (바이어)
  - SUPPLIER: 표준사업장

buyerType (BUYER인 경우만):
  - PRIVATE_COMPANY: 민간기업
  - PUBLIC_INSTITUTION: 공공기관
  - GOVERNMENT: 국가/지자체/교육청
```

#### 현재 등록된 기업:
| Company ID | 기업명 | Type | Buyer Type |
|------------|--------|------|------------|
| `cmlu4go9a000510vpggruiy9v` | 행복한표준사업장 | SUPPLIER | - |
| `cmlu4gobz000910vpj1izl197` | 주식회사 페마연 | BUYER | PRIVATE_COMPANY |
| `cmlu4gokt000h10vp9paz1nwl` | 공공기관1 | BUYER | PUBLIC_INSTITUTION |
| `cmlu4gop3000l10vpcorl01s2` | 공공기관2 | BUYER | PUBLIC_INSTITUTION |
| `cmlu4gose000p10vpecg64uct` | 교육청1 | BUYER | GOVERNMENT |
| `cmlu4gov8000t10vpfm0p3ryw` | 지자체1 | BUYER | GOVERNMENT |

---

### 2️⃣ **BuyerProfile ID** (고용의무기업 프로필 ID)
Company 테이블의 BUYER 기업에 대한 상세 프로필

```
테이블: BuyerProfile
필드: id (TEXT, PRIMARY KEY)
관계: companyId -> Company.id (1:1)
용도: 
  - 전체 직원 수 (employeeCount)
  - 등록된 장애인 직원 수 (disabledCount)
  - 연도별 직원 수 (yearlyEmployeesJson)
  - 부담금 면제 여부 (hasLevyExemption)
```

#### 현재 등록된 BuyerProfile:
| BuyerProfile ID | Company ID | 기업명 | 직원수 | 장애인수 |
|-----------------|------------|--------|--------|----------|
| `cmlu4gobz000a10vplc93ruqy` | `cmlu4gobz000910vpj1izl197` | 주식회사 페마연 | 1,000 | 15 |
| `cmlu4gokt000i10vpyowza6ci` | `cmlu4gokt000h10vp9paz1nwl` | 공공기관1 | 1,000 | 34 |
| `cmlu4gop3000m10vpp7ohwgfj` | `cmlu4gop3000l10vpcorl01s2` | 공공기관2 | 1,000 | 41 |
| `cmlu4gose000q10vpofzoyqu8` | `cmlu4gose000p10vpecg64uct` | 교육청1 | 1,000 | 49 |
| `cmlu4gov8000u10vpwrh3ynf8` | `cmlu4gov8000t10vpfm0p3ryw` | 지자체1 | 1,000 | 57 |
| `buyer_happystandard` | `cmlu4go9a000510vpggruiy9v` | 행복한표준사업장 | 0 | 0 |

⚠️ **주의**: 표준사업장도 BuyerProfile을 가지고 있음 (향후 구조 개선 필요)

---

### 3️⃣ **DisabledEmployee ID** (장애인 직원 ID)
등록된 장애인 직원의 고유 ID

```
테이블: DisabledEmployee
필드: id (TEXT, PRIMARY KEY)
관계: buyerId -> BuyerProfile.id
핵심 필드:
  - name: 직원명
  - phone: 전화번호 (User 테이블 연동 키)
  - severity: SEVERE (중증) / MILD (경증)
  - hireDate: 입사일
  - resignDate: 퇴사일 (NULL이면 재직중)
  - monthlyWorkHours: 월간 근로시간
  - monthlySalary: 월 급여
```

#### 각 기업별 장애인 직원 수:
| BuyerProfile ID | Company Name | 등록된 장애인 직원 수 |
|-----------------|--------------|---------------------|
| `cmlu4gokt000i10vpyowza6ci` | 공공기관1 | 12명 |
| `cmlu4gose000q10vpofzoyqu8` | 교육청1 | 10명 |
| `cmlu4gobz000a10vplc93ruqy` | 주식회사 페마연 | 15명 |
| `buyer_happystandard` | 행복한표준사업장 | 15명 |

---

### 4️⃣ **User ID와 employeeId 연동**
로그인 사용자 계정과 장애인 직원 정보를 연결

```
테이블: User
필드: 
  - id (TEXT, PRIMARY KEY): 사용자 고유 ID
  - employeeId (TEXT): DisabledEmployee.id 참조
  - phone (TEXT): DisabledEmployee.phone과 매칭
  - role: BUYER / EMPLOYEE / SUPER_ADMIN
```

#### employeeId 연동 상태 (2026-02-27 업데이트 완료):
| 기업명 | User 계정 | employeeId 연동 상태 |
|--------|-----------|---------------------|
| 공공기관1 | 3명 | ✅ 모두 정상 |
| 교육청1 | 3명 | ✅ 모두 정상 |
| 주식회사 페마연 | 5명 | ✅ 모두 정상 |
| 행복한표준사업장 | 5명 | ✅ 모두 정상 |

**총 16명의 EMPLOYEE 계정 모두 정상 연동됨**

---

## 🔗 ID 관계도

```
Company (기업)
  └─ id: cmlu4gobz000910vpj1izl197
      │
      ├─ BuyerProfile (고용의무기업 프로필)
      │   └─ id: cmlu4gobz000a10vplc93ruqy
      │       │
      │       ├─ DisabledEmployee (장애인 직원 #1)
      │       │   └─ id: cmm3z01sx00016kbx8fvi8wdu
      │       │       └─ phone: 01099990001
      │       │           │
      │       │           └─ User (로그인 계정)
      │       │               └─ id: user_emp_1
      │       │               └─ employeeId: cmm3z01sx00016kbx8fvi8wdu ✅
      │       │
      │       ├─ DisabledEmployee (장애인 직원 #2)
      │       │   └─ id: cmm3z01ts00036kbx5d6ts600
      │       │       └─ phone: 01099990002
      │       │           │
      │       │           └─ User (로그인 계정)
      │       │               └─ id: user_emp_2
      │       │               └─ employeeId: cmm3z01ts00036kbx5d6ts600 ✅
      │       │
      │       └─ ... (나머지 장애인 직원들)
      │
      └─ User (관리자 계정)
          └─ id: cmlu4gobz000810vp2g2pjq94
          └─ role: BUYER
          └─ companyId: cmlu4gobz000910vpj1izl197
```

---

## 🚨 주요 문제점 및 해결 상태

### ✅ 해결 완료:
1. **User.employeeId 불일치 문제**
   - 원인: User.employeeId가 DisabledEmployee.id와 불일치
   - 해결: 16개 계정 모두 phone 기준으로 재연동 완료
   - 상태: ✅ 모든 EMPLOYEE 계정 정상

2. **페마연 상세보기 버튼 문제**
   - 원인: employeeId 불일치로 API 오류
   - 해결: employeeId 업데이트 후 정상 작동
   - 상태: ✅ 15개 업무지시 목록 정상 표시

3. **BuyerProfile.disabledCount 불일치 문제**
   - 원인: BuyerProfile.disabledCount가 실제 DisabledEmployee 수와 불일치
   - 해결: 모든 BuyerProfile의 disabledCount를 실제 카운트로 동기화
   - 상태: ✅ 6개 기업 모두 정합성 확보

---

## 📊 데이터 정합성 체크리스트

### Company → BuyerProfile
```sql
-- 모든 BUYER Company는 BuyerProfile을 가져야 함
SELECT c.id, c.name, bp.id AS buyerProfileId
FROM Company c
LEFT JOIN BuyerProfile bp ON c.id = bp.companyId
WHERE c.type = 'BUYER';
```
✅ 정상: 모든 BUYER 기업이 BuyerProfile 보유

### BuyerProfile → DisabledEmployee
```sql
-- BuyerProfile.disabledCount와 실제 등록 직원 수 일치 여부
SELECT 
  bp.id,
  bp.disabledCount AS declared_count,
  COUNT(de.id) AS actual_count,
  CASE 
    WHEN bp.disabledCount = COUNT(de.id) THEN '✅ 일치'
    ELSE '❌ 불일치'
  END AS status
FROM BuyerProfile bp
LEFT JOIN DisabledEmployee de ON bp.id = de.buyerId
GROUP BY bp.id, bp.disabledCount;
```
✅ **정상**: 모든 BuyerProfile의 disabledCount가 실제 DisabledEmployee 수와 일치
- 공공기관1: 12명 ✅
- 공공기관2: 0명 ✅
- 교육청1: 10명 ✅
- 주식회사 페마연: 15명 ✅
- 지자체1: 0명 ✅
- 행복한표준사업장: 15명 ✅

### DisabledEmployee → User (employeeId)
```sql
-- 전화번호 기준 employeeId 연동 여부
SELECT 
  de.phone,
  de.name AS de_name,
  u.name AS user_name,
  u.employeeId,
  CASE 
    WHEN u.employeeId = de.id THEN '✅ 정상'
    WHEN u.employeeId IS NULL THEN '❌ NULL'
    WHEN u.employeeId != de.id THEN '❌ 불일치'
    ELSE '❓ 알수없음'
  END AS status
FROM DisabledEmployee de
LEFT JOIN User u ON de.phone = u.phone
WHERE u.role = 'EMPLOYEE';
```
✅ 정상: 16개 계정 모두 정상 연동

---

## 🎯 권장 사항

### 1. BuyerProfile.disabledCount 자동 계산
현재는 수동 입력이지만, 실제 DisabledEmployee 테이블 카운트와 동기화 필요

```typescript
// 추천: DisabledEmployee 추가/삭제 시 자동 업데이트
async function syncDisabledCount(buyerId: string) {
  const count = await prisma.disabledEmployee.count({
    where: { buyerId, resignDate: null }
  });
  
  await prisma.buyerProfile.update({
    where: { id: buyerId },
    data: { disabledCount: count }
  });
}
```

### 2. User.employeeId 자동 연동
회원가입 또는 장애인 직원 등록 시 전화번호 기준 자동 연동

```typescript
// 추천: 장애인 직원 등록 시 User 자동 생성/연동
async function createDisabledEmployeeWithUser(data: CreateEmployeeData) {
  const employee = await prisma.disabledEmployee.create({ data });
  
  // 해당 전화번호로 User가 있으면 employeeId 연동
  await prisma.user.updateMany({
    where: { phone: data.phone },
    data: { employeeId: employee.id }
  });
  
  return employee;
}
```

### 3. 표준사업장 구조 개선
현재 SUPPLIER도 BuyerProfile을 가지고 있음 → SupplierProfile 분리 고려

---

## 📝 업데이트 이력

- **2026-02-27 10:00**: 최초 작성
- **2026-02-27 10:30**: User.employeeId 16개 계정 연동 완료
- **2026-02-27 10:45**: 데이터 정합성 체크 완료
- **2026-02-27 11:00**: BuyerProfile.disabledCount 전체 동기화 완료 ✅
  - 공공기관1: 34명 → 12명
  - 공공기관2: 41명 → 0명
  - 교육청1: 49명 → 10명
  - 주식회사 페마연: 15명 (변경 없음)
  - 지자체1: 57명 → 0명
  - 행복한표준사업장: 0명 → 15명

---

## 🎉 최종 검증 결과 (2026-02-27 11:00)

### 전체 시스템 데이터 정합성: ✅ 정상

| 검증 항목 | 상태 | 비고 |
|-----------|------|------|
| Company → BuyerProfile 관계 | ✅ 정상 | 6개 기업 모두 BuyerProfile 보유 |
| BuyerProfile.disabledCount 정합성 | ✅ 정상 | 6개 기업 모두 실제 카운트와 일치 |
| User.employeeId 연동 상태 | ✅ 정상 | 16개 계정 모두 정상 연동 |

**모든 기업별 장애인 직원 ID 연동이 완벽하게 완료되었습니다!** 🎊
