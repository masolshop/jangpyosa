# 🏗️ 장표사 ID 시스템 아키텍처

## 📋 문서 정보
- **작성일**: 2026-02-27
- **목적**: 시스템 전체 ID 구조 및 관계 명세
- **대상**: 신규 개발자, 시스템 아키텍트

---

## 🎯 핵심 개념

### 기본 원칙

1. **단일 진실 공급원 (Single Source of Truth)**
   - 모든 데이터는 하나의 정확한 출처를 가짐
   - 중복 데이터 최소화

2. **명확한 관계 계층**
   - Company (회사) → BuyerProfile/SupplierProfile (역할) → DisabledEmployee (직원)
   - User (계정) → 각 엔티티 연결

3. **타입 독립성**
   - Company.type은 주요 사업 분류일 뿐
   - 기능(Profile)은 독립적으로 존재

---

## 🗺️ 전체 시스템 맵

```
┌─────────────────────────────────────────────────────────────┐
│                         Company (회사)                       │
│  id: cuid (최상위 통합 ID)                                   │
│  bizNo: 사업자번호 (unique)                                  │
│  type: BUYER | SUPPLIER                                     │
│  ownerUserId: User.id (대표자)                               │
└─────────────┬───────────────────────────┬───────────────────┘
              │                           │
              ↓ 1:1                      ↓ 1:1 (optional)
┌─────────────────────────┐   ┌──────────────────────────┐
│   BuyerProfile          │   │   SupplierProfile        │
│   (고용의무 프로필)      │   │   (공급자 프로필)         │
│                         │   │                          │
│ id: cuid                │   │ id: cuid                 │
│ companyId: Company.id   │   │ companyId: Company.id    │
│ employeeCount: Int      │   │ region: String           │
│ disabledCount: Int      │   │ industry: String         │
└─────────┬───────────────┘   └─────────┬────────────────┘
          │ 1:N                         │ 1:N
          ↓                             ↓
┌─────────────────────┐       ┌─────────────────────┐
│ DisabledEmployee    │       │ Product             │
│ (장애인 직원)        │       │ (제품)               │
│                     │       │                     │
│ id: cuid            │       │ id: cuid            │
│ buyerId: BP.id      │       │ supplierId: SP.id   │
│ name: String        │       │ name: String        │
│ severity: SEVERE/MILD│       │ price: Int          │
└──────────┬──────────┘       └─────────────────────┘
           │ 1:1 (optional)
           ↑
    ┌──────────────┐
    │   User       │
    │   (로그인)    │
    │              │
    │ id: cuid     │
    │ phone: String│
    │ role: EMPLOYEE│
    │ employeeId: DE.id │
    └──────────────┘
```

---

## 🔑 Entity별 상세 명세

### 1. Company (회사)

**역할**: 시스템 최상위 엔티티, 모든 비즈니스의 기본 단위

#### Schema
```prisma
model Company {
  id                String           @id @default(cuid())
  name              String           // 회사명
  bizNo             String           @unique  // 사업자등록번호
  representative    String?          // 대표자명
  type              String           // "BUYER" or "SUPPLIER"
  buyerType         String?          // PRIVATE_COMPANY | PUBLIC_INSTITUTION | EDUCATION | LOCAL_GOVERNMENT
  isVerified        Boolean          @default(false)
  ownerUserId       String           @unique
  
  // Relations
  ownerUser         User             @relation("CompanyOwner")
  members           User[]           @relation("CompanyMembers")
  buyerProfile      BuyerProfile?
  supplierProfile   SupplierProfile?
}
```

#### 필드 설명
- **id**: 회사 고유 ID (cuid) - **모든 관계의 기준점**
- **bizNo**: 사업자등록번호 - 법적 식별자
- **type**: 회사 주요 유형
  - `BUYER`: 고용의무기업 (일반 기업, 공공기관 등)
  - `SUPPLIER`: 표준사업장
- **buyerType**: BUYER 전용 세부 분류
  - `PRIVATE_COMPANY`: 민간 기업
  - `PUBLIC_INSTITUTION`: 공공기관
  - `EDUCATION`: 교육청
  - `LOCAL_GOVERNMENT`: 지자체
- **ownerUserId**: 회사 대표자/최초 생성자 User ID

#### 관계
- `1:1` BuyerProfile (optional)
- `1:1` SupplierProfile (optional)
- `1:N` User (members)

#### 실제 데이터 예시

**예시 1: 민간 기업 (페마연)**
```json
{
  "id": "cmlu4gobz000910vpj1izl197",
  "name": "주식회사 페마연",
  "bizNo": "2668101215",
  "type": "BUYER",
  "buyerType": "PRIVATE_COMPANY",
  "ownerUserId": "cmlu4gobz000810vp2g2pjq94"
}
```

**예시 2: 표준사업장**
```json
{
  "id": "cmlu4go9a000510vpggruiy9v",
  "name": "행복한표준사업장",
  "bizNo": "1234567890",
  "type": "SUPPLIER",
  "buyerType": null,
  "ownerUserId": "cmlu4go9a000410vp3hkqwmnc"
}
```

---

### 2. BuyerProfile (고용의무 프로필)

**역할**: 장애인 고용의무 대상 기업의 고용 현황 관리

#### Schema
```prisma
model BuyerProfile {
  id                  String               @id @default(cuid())
  companyId           String               @unique
  employeeCount       Int                  @default(0)  // 전체 상시근로자 수
  disabledCount       Int                  @default(0)  // 장애인 직원 수
  
  company             Company              @relation(fields: [companyId], references: [id])
  disabledEmployees   DisabledEmployee[]
  monthlyData         MonthlyEmployeeData[]
}
```

#### 필드 설명
- **id**: BuyerProfile 고유 ID (cuid)
- **companyId**: Company.id 참조 (1:1 관계, unique)
- **employeeCount**: 전체 상시근로자 수 (부담금 계산 기준)
- **disabledCount**: 현재 재직 중인 장애인 직원 수

#### 관계
- `N:1` Company
- `1:N` DisabledEmployee

#### 중요 사항
⚠️ **모든 장애인 직원 데이터는 BuyerProfile을 통해서만 접근 가능**

#### 실제 데이터 예시

```json
{
  "id": "cmlu4gobz000a10vplc93ruqy",
  "companyId": "cmlu4gobz000910vpj1izl197",  // 페마연
  "employeeCount": 1000,
  "disabledCount": 15
}
```

---

### 3. DisabledEmployee (장애인 직원)

**역할**: 개별 장애인 직원 정보 관리

#### Schema
```prisma
model DisabledEmployee {
  id                     String           @id @default(cuid())
  buyerId                String           // BuyerProfile.id 참조
  name                   String
  phone                  String?
  registrationNumber     String?          // 주민등록번호 앞 6자리
  severity               String           // "SEVERE" or "MILD"
  gender                 String
  birthDate              DateTime?
  hireDate               DateTime
  resignDate             DateTime?
  monthlySalary          Int
  hasEmploymentInsurance Boolean          @default(true)
  meetsMinimumWage       Boolean          @default(true)
  monthlyWorkHours       Int?             // 월 근로시간
  
  buyer                  BuyerProfile     @relation(fields: [buyerId], references: [id])
}
```

#### 필드 설명
- **id**: 직원 고유 ID (cuid 또는 custom ID)
- **buyerId**: BuyerProfile.id 참조 ⚠️ **Company.id가 아님!**
- **severity**: 장애 정도
  - `SEVERE`: 중증 (인정 배수 2.0)
  - `MILD`: 경증 (인정 배수 1.0)
- **monthlyWorkHours**: 월 근로시간 (60시간 이상 시 인정)

#### 관계
- `N:1` BuyerProfile
- `1:1` User (optional, employeeId로 연결)

#### 인정 계산 로직
```typescript
function calculateRecognizedCount(emp: DisabledEmployee): number {
  if (emp.severity === 'SEVERE' && emp.monthlyWorkHours >= 60) {
    return 2.0;  // 중증 + 60시간 이상
  }
  return 1.0;  // 기타
}
```

#### 실제 데이터 예시

```json
{
  "id": "emp_pemayeon_06",
  "buyerId": "cmlu4gobz000a10vplc93ruqy",  // 페마연 BuyerProfile.id
  "name": "김민지",
  "phone": "010-1234-5678",
  "severity": "SEVERE",
  "gender": "FEMALE",
  "birthDate": "1992-03-15T00:00:00Z",
  "hireDate": "2021-07-01T00:00:00Z",
  "monthlyWorkHours": 75,
  "monthlySalary": 774000
}
```

---

### 4. User (사용자 계정)

**역할**: 로그인 인증 및 권한 관리

#### Schema
```prisma
model User {
  id                String    @id @default(cuid())
  phone             String    @unique
  username          String?   @unique  // 기업 담당자 전용 ID
  email             String?
  passwordHash      String
  name              String
  role              String    // BUYER | SUPPLIER | EMPLOYEE | SUPER_ADMIN
  
  // 기업 소속
  companyId         String?
  isCompanyOwner    Boolean   @default(false)
  
  // 직원 계정 전용
  employeeId        String?   @unique  // DisabledEmployee.id
  companyBizNo      String?
  
  company           Company?  @relation("CompanyMembers")
  ownedCompany      Company?  @relation("CompanyOwner")
}
```

#### 역할별 특징

**BUYER / SUPPLIER (기업 담당자)**
```json
{
  "id": "cmlu4gobz000810vp2g2pjq94",
  "phone": "010-9999-0000",
  "username": "pemayeon_admin",
  "role": "BUYER",
  "companyId": "cmlu4gobz000910vpj1izl197",
  "isCompanyOwner": true,
  "employeeId": null
}
```

**EMPLOYEE (장애인 직원)**
```json
{
  "id": "cmm3z01sx00006kbxrq82mlhn",
  "phone": "010-1234-5678",
  "username": null,  // 직원은 username 없음
  "role": "EMPLOYEE",
  "companyId": "cmlu4gobz000910vpj1izl197",
  "employeeId": "emp_pemayeon_06",  // 핵심 연결!
  "companyBizNo": "2668101215"
}
```

#### 로그인 로직
```typescript
// 기업 담당자 로그인
if (user.role === 'BUYER' || user.role === 'SUPPLIER') {
  // 회사 정보 조회
  const company = await prisma.company.findUnique({
    where: { id: user.companyId }
  });
}

// 직원 로그인
if (user.role === 'EMPLOYEE') {
  // 직원 정보 조회
  const employee = await prisma.disabledEmployee.findUnique({
    where: { id: user.employeeId }
  });
}
```

---

### 5. SupplierProfile (공급자 프로필)

**역할**: 표준사업장의 제품/서비스 공급 기능 관리

#### Schema
```prisma
model SupplierProfile {
  id                    String      @id @default(cuid())
  companyId             String      @unique
  region                String?
  industry              String?
  approved              Boolean     @default(false)
  minContractAmount     Int?
  maxContractAmount     Int?
  
  company               Company     @relation(fields: [companyId], references: [id])
  products              Product[]
  contractRequests      ContractRequest[]
}
```

#### 중요 사항
⚠️ **SupplierProfile에는 장애인 직원 정보 없음**
- 장애인 직원 데이터는 항상 BuyerProfile에만 존재
- 표준사업장이라도 직원 정보는 BuyerProfile을 통해 관리

#### 실제 데이터 예시

```json
{
  "id": "cmlu4go9b000810vpu3ww9sic",
  "companyId": "cmlu4go9a000510vpggruiy9v",  // 행복한표준사업장
  "region": "서울",
  "industry": "제조업",
  "approved": true
}
```

---

## 🔗 ID 연결 흐름도

### 시나리오 1: 민간 기업 (BUYER)

```
페마연 (Company)
  id: cmlu4gobz000910vpj1izl197
  type: BUYER
  bizNo: 2668101215
    │
    ├─ ownerUserId ──────────────┐
    │                            ↓
    │                     User (관리자)
    │                       id: cmlu4gobz000810vp2g2pjq94
    │                       role: BUYER
    │                       phone: 010-9999-0000
    │
    └─ BuyerProfile
         id: cmlu4gobz000a10vplc93ruqy
         companyId: cmlu4gobz000910vpj1izl197
         employeeCount: 1000
         disabledCount: 15
           │
           └─ disabledEmployees[]
                ├─ DisabledEmployee #1
                │    id: emp_pemayeon_06
                │    buyerId: cmlu4gobz000a10vplc93ruqy
                │    name: 김민지
                │       ↑
                │       └─ User (직원)
                │            id: cmm3z01sx00006kbxrq82mlhn
                │            role: EMPLOYEE
                │            employeeId: emp_pemayeon_06
                │
                ├─ DisabledEmployee #2
                │    id: emp_pemayeon_07
                │    name: 이정호
                │    (로그인 계정 없음)
                │
                └─ ... (총 15명)
```

### 시나리오 2: 표준사업장 (SUPPLIER + 양쪽 프로필)

```
행복한표준사업장 (Company)
  id: cmlu4go9a000510vpggruiy9v
  type: SUPPLIER
  bizNo: 1234567890
    │
    ├─ BuyerProfile (고용의무)
    │    id: cmlu4go9a000610vp8plo7t4m
    │    companyId: cmlu4go9a000510vpggruiy9v
    │    disabledCount: 15
    │      │
    │      └─ disabledEmployees[]
    │           ├─ DisabledEmployee #1
    │           ├─ DisabledEmployee #2
    │           └─ ... (총 15명)
    │
    └─ SupplierProfile (공급자 기능)
         id: cmlu4go9b000810vpu3ww9sic
         companyId: cmlu4go9a000510vpggruiy9v
           │
           └─ products[]
                ├─ Product #1 (청소 서비스)
                ├─ Product #2 (인쇄물 제작)
                └─ ...
```

---

## 🎓 개발자 참고 사항

### Query Pattern 가이드

#### ✅ 올바른 패턴

**1. 회사 + 직원 정보 조회**
```typescript
const company = await prisma.company.findUnique({
  where: { id: companyId },
  include: {
    buyerProfile: {
      include: {
        disabledEmployees: {
          where: { resignDate: null },  // 재직 중인 직원만
          orderBy: { hireDate: 'asc' }
        }
      }
    },
    supplierProfile: true  // 기본 정보만
  }
});

// 직원 데이터 추출 (타입 무관)
const employees = company.buyerProfile?.disabledEmployees || [];
```

**2. 특정 직원 상세 조회**
```typescript
const employee = await prisma.disabledEmployee.findUnique({
  where: { id: employeeId },
  include: {
    buyer: {
      include: {
        company: true
      }
    }
  }
});

// 회사 정보 접근
const companyName = employee.buyer.company.name;
```

**3. 직원 계정 생성**
```typescript
// 1단계: DisabledEmployee 생성
const employee = await prisma.disabledEmployee.create({
  data: {
    buyerId: buyerProfileId,  // ⚠️ Company.id가 아님!
    name: "홍길동",
    severity: "SEVERE",
    // ...
  }
});

// 2단계: User 계정 생성
const user = await prisma.user.create({
  data: {
    phone: "010-1234-5678",
    role: "EMPLOYEE",
    companyId: companyId,
    employeeId: employee.id,  // 핵심 연결!
    // ...
  }
});
```

#### ❌ 잘못된 패턴

```typescript
// ❌ SupplierProfile에서 직원 조회 시도
const employees = company.supplierProfile?.disabledEmployees;
// → undefined! SupplierProfile에는 disabledEmployees 관계 없음

// ❌ Company.id로 직접 DisabledEmployee 조회
const employees = await prisma.disabledEmployee.findMany({
  where: { buyerId: companyId }
});
// → buyerId는 BuyerProfile.id여야 함!

// ❌ Type 기반 조건문
if (company.type === 'BUYER') {
  employees = company.buyerProfile.disabledEmployees;
} else {
  employees = company.supplierProfile.disabledEmployees;  // 오류!
}
// → SUPPLIER 타입도 BuyerProfile 가질 수 있음!
```

---

### Type 체크 가이드

```typescript
// ✅ 고용의무 대상 여부
const hasEmploymentObligation = company.buyerProfile !== null;

// ✅ 표준사업장 여부
const isSupplier = company.type === 'SUPPLIER';

// ✅ 표준사업장 + 고용의무 대상
const isStandardWorkplace = 
  company.type === 'SUPPLIER' && 
  company.buyerProfile !== null;

// ✅ 직원 데이터 유무
const hasEmployees = 
  company.buyerProfile?.disabledEmployees.length > 0;
```

---

### UI 표시 로직

```typescript
function getCompanyTypeLabel(company: Company): string {
  if (company.type === 'SUPPLIER' && company.buyerProfile) {
    return '표준사업장 (고용의무 대상)';
  }
  
  if (company.type === 'SUPPLIER') {
    return '표준사업장';
  }
  
  // BUYER
  switch (company.buyerType) {
    case 'PRIVATE_COMPANY':
      return '민간 기업';
    case 'PUBLIC_INSTITUTION':
      return '공공기관';
    case 'EDUCATION':
      return '교육청';
    case 'LOCAL_GOVERNMENT':
      return '지자체';
    default:
      return '고용의무기업';
  }
}
```

---

## 📊 시스템 통계 (2026-02-27)

### 전체 현황

```
Company: 5개
├─ BUYER: 4개
│  ├─ 민간 기업: 1개 (페마연)
│  ├─ 공공기관: 1개
│  ├─ 교육청: 1개
│  └─ 지자체: 1개
│
└─ SUPPLIER: 1개 (행복한표준사업장)
   ├─ BuyerProfile: ✅
   └─ SupplierProfile: ✅

BuyerProfile: 5개 (모든 Company가 보유)
├─ 1:1 Company 연결: 100%
└─ DisabledEmployee 연결: 62명

DisabledEmployee: 62명
├─ 재직 중: 62명
├─ 퇴사: 0명
└─ User 계정 연동: 16명 (25.8%)

User: 21명
├─ BUYER: 5명 (회사 관리자)
├─ EMPLOYEE: 16명 (직원 계정)
└─ SUPER_ADMIN: 0명
```

---

## 🔒 데이터 무결성 규칙

### 필수 제약 조건

1. **Company ↔ BuyerProfile**
   - `BuyerProfile.companyId` MUST reference valid `Company.id`
   - Relationship: 1:1 (optional)

2. **BuyerProfile ↔ DisabledEmployee**
   - `DisabledEmployee.buyerId` MUST reference valid `BuyerProfile.id`
   - Relationship: 1:N

3. **User ↔ DisabledEmployee (EMPLOYEE 역할)**
   - `User.employeeId` MUST reference valid `DisabledEmployee.id` when role = EMPLOYEE
   - Relationship: 1:1 (optional)

4. **Company ↔ User (Owner)**
   - `Company.ownerUserId` MUST reference valid `User.id`
   - Relationship: 1:1

### Cascade 규칙

```prisma
// Company 삭제 시
Company delete → BuyerProfile cascade delete → DisabledEmployee cascade delete

// BuyerProfile 삭제 시
BuyerProfile delete → DisabledEmployee cascade delete

// DisabledEmployee 삭제 시
DisabledEmployee delete → User.employeeId set null
```

---

## 📚 관련 문서

1. [ID 불일치 근본 원인 분석](./ID_MISMATCH_ROOT_CAUSE_ANALYSIS.md) - 문제 해결 과정
2. [시스템 통일 작업 완료](./SYSTEM_UNIFICATION.md) - 최근 수정 사항
3. [회사-직원 ID 매핑](../COMPANY_EMPLOYEE_ID_MAPPING.md) - 실제 데이터 예시

---

**작성자**: AI Assistant  
**최종 업데이트**: 2026-02-27  
**상태**: ✅ 완료
