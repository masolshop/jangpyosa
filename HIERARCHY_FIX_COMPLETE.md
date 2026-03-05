# 전체 본부-지사-매니저 연동 검증 및 수정

## 📋 개요

슈퍼어드민 대시보드(`/admin/sales-management`)에서 본부-지사-매니저 연동이 제대로 표시되지 않는 문제를 전체적으로 검증하고 수정했습니다.

## 🐛 발견된 문제

### 1. 지사별 통계 탭
**문제**: 페마연지사의 소속 본부가 "-"로 표시됨

**원인**: 
- 페마연지사 조직의 `parentId`는 정상 (페마연 본부로 연결)
- **페마연지사 지사장(문지용)의 `managerId`가 `null`** ❌

**영향**:
- 백엔드 API에서 지사 통계 계산 시 `manager` 관계를 참조
- `managerId`가 없으면 상위 본부 정보를 가져올 수 없음

### 2. 매니저별 통계 탭
**문제**: 김매니저의 소속 지사가 공백으로 표시됨

**원인**: 
- 김매니저의 `organizationId`는 정상 (페마연지사로 연결)
- 김매니저의 `managerId`도 정상 (문지용 지사장으로 연결)
- **프론트엔드 표시 로직 문제일 가능성** (백엔드 데이터는 정상)

## ✅ 해결 방법

### 전체 계층 구조 검증 스크립트 작성

`scripts/fix-all-hierarchy.cjs` 스크립트로 다음을 검증하고 자동 수정:

#### 1단계: 전체 조직 구조 확인
```javascript
// Organization 모델
- parentId: 지사 → 본부 연결
- subOrganizations: 본부의 하위 지사들
- salesPeople: 조직 소속 영업사원들
```

#### 2단계: 지사의 parentId 검증 및 수정
```javascript
// 본부에 연결되지 않은 지사 찾기
branches.filter(b => !b.parentId)

// 지사장의 상위 매니저(본부장)를 통해 본부 찾기
branchManager.manager.organization → headquarter
```

#### 3단계: 전체 영업사원 구조 확인
```javascript
// SalesPerson 모델
- organizationId: 소속 조직
- managerId: 상위 매니저 (부하 관계)
- subordinates: 직속 부하들
```

#### 4단계: organizationId 누락 검증 및 수정
```javascript
// 조직에 소속되지 않은 영업사원 찾기
salesPeople.filter(sp => !sp.organizationId)

// 역할별 자동 매칭
- HEAD_MANAGER: 핸드폰 번호로 본부 조직 찾기
- BRANCH_MANAGER: 핸드폰 번호로 지사 조직 찾기
- MANAGER: 상위 매니저의 조직으로 설정
```

#### 5단계: managerId 누락 검증 및 수정
```javascript
// 상위 매니저 없는 영업사원 찾기
managers.filter(m => !m.managerId)
branchManagers.filter(bm => !bm.managerId)

// 자동 매칭
- MANAGER: 같은 조직의 지사장/본부장 찾기
- BRANCH_MANAGER: 상위 본부의 본부장 찾기
```

#### 6단계: 최종 검증
- 통계 출력 및 미매칭 항목 확인

## 📊 실행 결과

### 발견된 문제
```
⚠️  지사장 수정:

📝 문지용
  조직: 페마연지사
  본부장 발견: 이종근
  ✅ managerId 업데이트 완료
```

### 최종 통계
```
조직 수: 12개
  본부: 10개
  지사: 2개
    - parentId 있음: 2개 ✅
    - parentId 없음: 0개

영업사원 수: 14명
  본부장: 10명
    - organizationId 있음: 10명 ✅
  지사장: 2명
    - organizationId 있음: 2명 ✅
    - managerId 있음: 2명 ✅
  매니저: 2명
    - organizationId 있음: 2명 ✅
    - managerId 있음: 2명 ✅
```

## 🔍 계층 구조 이해

### 3가지 관계

#### 1. Organization.parentId (조직 계층)
```
페마연 본부 (HEADQUARTERS)
  ↓ parentId
페마연지사 (BRANCH)
```

**용도**: 조직 트리 구조

#### 2. SalesPerson.organizationId (조직 소속)
```
페마연 본부 (Organization)
  ← organizationId
이종근 (HEAD_MANAGER)

페마연지사 (Organization)
  ← organizationId
문지용 (BRANCH_MANAGER)
  ← organizationId
김매니저 (MANAGER)
```

**용도**: 어느 조직에 속해 있는가

#### 3. SalesPerson.managerId (관리 계층)
```
이종근 (HEAD_MANAGER)
  ↓ managerId
문지용 (BRANCH_MANAGER)
  ↓ managerId
김매니저 (MANAGER)
```

**용도**: 누구의 부하인가 (subordinates 관계)

### 완벽한 연동 조건

```javascript
// 페마연 본부
{
  organization: {
    name: '페마연',
    type: 'HEADQUARTERS',
    parentId: null,
    subOrganizations: [페마연지사]
  },
  headManager: {
    name: '이종근',
    role: 'HEAD_MANAGER',
    organizationId: 페마연.id,
    managerId: null,
    subordinates: [문지용]
  }
}

// 페마연지사
{
  organization: {
    name: '페마연지사',
    type: 'BRANCH',
    parentId: 페마연.id,
    parent: 페마연
  },
  branchManager: {
    name: '문지용',
    role: 'BRANCH_MANAGER',
    organizationId: 페마연지사.id,
    managerId: 이종근.id,  // ✅ 수정됨!
    manager: 이종근,
    subordinates: [김매니저]
  }
}

// 매니저
{
  manager: {
    name: '김매니저',
    role: 'MANAGER',
    organizationId: 페마연지사.id,
    managerId: 문지용.id,
    manager: 문지용
  }
}
```

## 🎯 백엔드 API 로직

### GET /sales/stats/hierarchy

#### 지사별 통계
```typescript
// apps/api/src/routes/sales.ts (line 2285)

const branches = await prisma.salesPerson.findMany({
  where: {
    role: 'BRANCH_MANAGER',
    isActive: true,
  },
  include: {
    manager: {  // ✅ managerId로 상위 본부장 가져옴
      select: {
        id: true,
        name: true,
        organizationName: true,
      },
    },
    subordinates: {
      where: { isActive: true },
    },
  },
});
```

**문제**: `managerId`가 없으면 `manager`가 `null` → 소속 본부 표시 안 됨

#### 매니저별 통계
```typescript
// apps/api/src/routes/sales.ts (line 2306)

const managers = await prisma.salesPerson.findMany({
  where: {
    role: 'MANAGER',
    isActive: true,
  },
  include: {
    manager: {  // ✅ managerId로 상위 지사장/본부장 가져옴
      select: {
        id: true,
        name: true,
        role: true,
        organizationName: true,
      },
    },
  },
});
```

**문제**: `managerId`가 없으면 `manager`가 `null` → 소속 지사 표시 안 됨

## 📝 스크립트 사용법

### 실행
```bash
cd /home/ubuntu/jangpyosa/apps/api
node scripts/fix-all-hierarchy.cjs
```

### 기능
1. **전체 조직 및 영업사원 현황 출력**
   - 본부별, 지사별, 역할별 분류
   - 관계 매핑 상태 확인

2. **자동 수정**
   - 누락된 `parentId` 설정
   - 누락된 `organizationId` 설정
   - 누락된 `managerId` 설정

3. **최종 검증**
   - 모든 관계 설정 완료 여부 확인
   - 미매칭 항목 통계

## ✅ 검증 완료

### 데이터베이스
- [x] 모든 지사 `parentId` 설정 (2개/2개)
- [x] 모든 본부장 `organizationId` 설정 (10명/10명)
- [x] 모든 지사장 `organizationId` 설정 (2명/2명)
- [x] 모든 매니저 `organizationId` 설정 (2명/2명)
- [x] 모든 지사장 `managerId` 설정 (2명/2명)
- [x] 모든 매니저 `managerId` 설정 (2명/2명)

### 관리 페이지
**URL**: https://jangpyosa.com/admin/sales-management

#### 지사별 통계 탭
| 지사명 | 지사장 | 소속 본부 | 매니저 |
|--------|--------|-----------|--------|
| 강남지사 | 박지사 | 서울본부 ✅ | 1명 |
| 페마연지사 | 문지용 | **페마연** ✅ | 1명 |

#### 매니저별 통계 탭
| 매니저명 | 연락처 | 소속 본부 | 소속 지사 |
|----------|--------|-----------|-----------|
| 이매니저 | 010-3333-4444 | 서울본부 ✅ | 강남지사 ✅ |
| 김매니저 | 010-9999-8888 | 페마연 ✅ | **페마연지사** ✅ |

## 🎓 교훈

### 1. 3가지 관계를 모두 설정해야 함
- **Organization.parentId**: 조직 트리
- **SalesPerson.organizationId**: 조직 소속
- **SalesPerson.managerId**: 관리 계층

### 2. 백엔드는 managerId 의존
- 지사별 통계: `branch.manager` → 본부 정보
- 매니저별 통계: `manager.manager` → 지사/본부 정보

### 3. 자동화 스크립트 필요
- 수동 설정은 오류 발생 가능
- 전체 검증 및 자동 수정 스크립트 유지

### 4. 데이터 일관성
- 지사장은 반드시 `managerId` = 본부장 ID
- 매니저는 반드시 `managerId` = 지사장 ID
- 본부장은 `managerId` = null (최상위)

## 🔄 향후 작업

### 1. 새 본부/지사 생성 시
- Organization 생성
- SalesPerson 생성
- **3가지 관계 모두 설정**

### 2. 매니저 등업 시
- `role` 변경
- `organizationId` 업데이트
- **`managerId` 업데이트** (중요!)

### 3. 정기 검증
- 주기적으로 `fix-all-hierarchy.cjs` 실행
- 미매칭 항목 확인 및 수정

---

**작성일**: 2026-03-05  
**작성자**: AI Assistant  
**관련 커밋**: 710f92b
