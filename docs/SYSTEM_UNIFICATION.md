# 🔧 장표사 시스템 통일 작업 완료

## 📋 작업 일시
- **날짜**: 2026-02-27
- **작업**: 기업 ID 및 데이터 연동 통일

## 🎯 문제점 및 해결

### 문제 1: SupplierProfile.disabledEmployees 참조 오류
**문제**: 
- API에서 `SupplierProfile.disabledEmployees`를 조회하려 했으나 해당 필드 없음
- 스키마상 장애인 직원은 `BuyerProfile.disabledEmployees`에만 존재

**해결**:
```typescript
// ❌ 기존
supplierProfile: {
  include: { disabledEmployees: {...} }  // 존재하지 않는 필드!
}

// ✅ 수정
supplierProfile: {
  select: { id: true }  // 기본 정보만
}

// 장애인 직원은 항상 BuyerProfile에서만 조회
const employees = company.buyerProfile?.disabledEmployees || [];
```

### 문제 2: 표준사업장의 이중 정체성
**이해**:
- 표준사업장(행복한표준사업장)은 **SUPPLIER type + BuyerProfile + SupplierProfile** 모두 보유
- BuyerProfile: 고용의무 대상 (장애인 직원 고용)
- SupplierProfile: 공급자 기능 (제품 판매, 계약)

**정리 원칙**:
```
Company.type = BUYER → 고용의무기업 (민간/공공/교육/지자체)
  └─ BuyerProfile (필수)
      └─ DisabledEmployee[] (장애인 직원 목록)

Company.type = SUPPLIER → 표준사업장
  ├─ BuyerProfile (있으면 고용의무 대상)
  │   └─ DisabledEmployee[] (장애인 직원 목록)
  └─ SupplierProfile (필수)
      └─ Products[], Contracts[] (공급자 기능)
```

## ✅ 통일된 데이터 구조

### 1. Company ID 중심 설계
- **Company.id** (cuid)를 모든 관계의 기준점으로 사용
- `BuyerProfile.companyId` = `Company.id`
- `SupplierProfile.companyId` = `Company.id`

### 2. 장애인 직원 연결
- **DisabledEmployee.buyerId** → **BuyerProfile.id**
- 모든 장애인 직원은 BuyerProfile을 통해서만 관리
- Type(BUYER/SUPPLIER) 무관하게 동일한 로직

### 3. 사용자 인증
- **User.phone** + **User.username** 둘 다 지원
- `User.employeeId` → `DisabledEmployee.id` 연결로 직원 계정 관리

## 📊 현재 시스템 현황

### 회사 데이터
| 회사명 | Type | BuyerProfile | SupplierProfile | 장애인 직원 | 상태 |
|--------|------|--------------|-----------------|------------|------|
| 페마연 | BUYER | ✅ | ❌ | 15명 | ✅ 정상 |
| 공공기관1 | BUYER | ✅ | ❌ | 12명 | ✅ 정상 |
| 교육청1 | BUYER | ✅ | ❌ | 10명 | ✅ 정상 |
| 지자체1 | BUYER | ✅ | ❌ | 10명 | ✅ 정상 |
| 행복한표준사업장 | SUPPLIER | ✅ | ✅ | 15명 | ✅ 정상 |

### 데이터 통계
- **총 회사**: 5개
- **총 장애인 직원**: 62명 (모두 BuyerProfile 연결)
- **로그인 계정 연동**: 16명
- **미연동 직원**: 46명

## 🚀 수정된 API 엔드포인트

### 1. GET /api/calculators/company/:companyId/employees
**기능**: 특정 회사의 장애인 직원 목록 조회

**응답 예시** (페마연):
```json
{
  "ok": true,
  "company": {
    "id": "cmlu4gobz000910vpj1izl197",
    "name": "주식회사 페마연",
    "type": "BUYER",
    "buyerType": "PRIVATE_COMPANY"
  },
  "profile": {
    "employeeCount": 1000,
    "disabledCount": 15
  },
  "employees": [
    {
      "id": "emp_pemayeon_06",
      "name": "김민지",
      "severity": "SEVERE",
      "monthlyWorkHours": 75,
      "recognizedCount": 2
    }
    // ... 15명
  ],
  "summary": {
    "totalEmployees": 15,
    "severeCount": 8,
    "mildCount": 7,
    "recognizedCount": 23
  }
}
```

### 2. GET /api/calculators/companies/list
**기능**: 전체 BUYER 및 SUPPLIER 회사 목록

**응답 예시**:
```json
{
  "ok": true,
  "total": 5,
  "companies": [
    {
      "id": "cmlu4gobz000910vpj1izl197",
      "name": "주식회사 페마연",
      "type": "BUYER",
      "buyerType": "PRIVATE_COMPANY",
      "employeeCount": 1000,
      "disabledCount": 15,
      "actualDisabledCount": 15
    }
    // ... 5개 회사
  ]
}
```

## 🔧 코드 수정 내역

### apps/api/src/routes/calculators.ts

#### 수정 1: company/:companyId/employees
```typescript
// BuyerProfile만 disabledEmployees 조회
const company = await prisma.company.findUnique({
  include: {
    buyerProfile: {
      include: {
        disabledEmployees: { orderBy: { hireDate: 'asc' } }
      }
    },
    supplierProfile: true  // 기본 정보만
  }
});

const employees = company.buyerProfile?.disabledEmployees || [];
```

#### 수정 2: companies/list
```typescript
// SupplierProfile에서 employeeCount 제거
supplierProfile: {
  select: { id: true }  // 최소 정보만
}
```

## 📝 개발자 가이드

### 새로운 기능 개발 시 주의사항

1. **장애인 직원 조회**
   ```typescript
   // ✅ 올바른 방법
   const employees = company.buyerProfile?.disabledEmployees;
   
   // ❌ 잘못된 방법
   const employees = company.supplierProfile?.disabledEmployees; // 없음!
   ```

2. **표준사업장 체크**
   ```typescript
   // 표준사업장인지 확인
   const isSupplier = company.type === 'SUPPLIER';
   
   // 고용의무 대상인지 확인 (BUYER 또는 BuyerProfile 있는 SUPPLIER)
   const hasEmploymentObligation = company.buyerProfile !== null;
   ```

3. **회사 타입 표시**
   ```typescript
   const displayType = 
     company.type === 'SUPPLIER' && company.buyerProfile
       ? '표준사업장 (고용의무 대상)'
       : company.type === 'SUPPLIER'
       ? '표준사업장'
       : '고용의무기업';
   ```

## ✅ 배포 완료

### AWS 서버
- **URL**: https://jangpyosa.com
- **배포 일시**: 2026-02-27
- **상태**: ✅ 정상 작동

### 테스트 결과
```bash
# 페마연 직원 데이터
curl https://jangpyosa.com/api/calculators/company/cmlu4gobz000910vpj1izl197/employees
# ✅ Success: 15명 데이터 반환

# 전체 회사 목록
curl https://jangpyosa.com/api/calculators/companies/list
# ✅ Success: 5개 회사 데이터 반환

# 부담금 계산 V2
curl -X POST https://jangpyosa.com/api/calculators/levy-v2 \
  -d '{"totalEmployeeCount":300,"recognizedCount":3,"companyType":"PRIVATE_COMPANY"}'
# ✅ Success: 5,823,576원/월
```

## 📚 관련 문서
- [ID 시스템 아키텍처](./ID_SYSTEM_ARCHITECTURE.md)
- [회사-직원 ID 매핑](../COMPANY_EMPLOYEE_ID_MAPPING.md)
- [2026년 부담금 계산 로직](./2026_LEVY_CALCULATION_LOGIC.md)
- [부담금 V2 구현](./LEVY_V2_IMPLEMENTATION.md)

## 🎯 다음 단계
1. ✅ **완료**: API 엔드포인트 통일
2. ✅ **완료**: AWS 배포 및 테스트
3. ⏳ **대기**: 프론트엔드 화면 연동 확인
4. ⏳ **대기**: 미연동 직원(46명) 계정 생성 여부 결정
5. ⏳ **대기**: 월별 시뮬레이션 실제 데이터 연동

---

**작성자**: AI Assistant  
**최종 업데이트**: 2026-02-27
