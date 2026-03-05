# 페마연지사 목업 매니저 생성 및 소속 매니저 로직 테스트

## 📋 개요

페마연본부-페마연지사-매니저 계층 구조를 테스트하기 위해 목업 매니저를 생성하고, 소속 매니저 로직이 정상 작동하는지 검증했습니다.

## 🎯 배경

### 현재 상황
- **페마연 본부**: 이종근 (본부장, HEAD_MANAGER)
- **페마연 지사**: 문지용 (지사장, BRANCH_MANAGER)
- **페마연 지사 매니저**: 없음 (0명)

### 문제
관리 페이지(`/admin/sales-management`)에서 "지사별 통계" 탭을 보면:
- **경남지사** (목업): 매니저 1명 표시 ✅
- **페마연지사** (실제): 매니저 0명 표시 ❌

페마연지사에도 매니저를 추가하여 소속 매니저 카운트 로직이 정상 작동하는지 테스트 필요.

## ✅ 해결 방법

### 1. 목업 매니저 생성

**생성 정보:**
```javascript
{
  name: '김매니저',
  phone: '01099998888',
  email: 'mock.manager@pemayeon.com',
  password: 'test1234',
  role: 'MANAGER',
  organizationId: '페마연지사 ID',
  managerId: '문지용 ID'
}
```

### 2. 데이터베이스 관계 설정

#### User 모델
```javascript
{
  username: '01099998888',
  passwordHash: bcrypt.hash('test1234'),
  name: '김매니저',
  phone: '01099998888',
  email: 'mock.manager@pemayeon.com',
  role: 'AGENT'
}
```

#### SalesPerson 모델
```javascript
{
  userId: user.id,
  name: '김매니저',
  phone: '01099998888',
  email: 'mock.manager@pemayeon.com',
  role: 'MANAGER',
  organizationId: pemayeonBranch.id,    // 페마연지사에 소속
  managerId: branchManager.id,          // 문지용 지사장의 부하
  referralCode: '01099998888',
  referralLink: 'https://jangpyosa.com/01099998888',
  isActive: true
}
```

## 📊 결과 검증

### 데이터베이스 상태

#### 페마연 지사장 (문지용)
```
이름: 문지용
ID: cmmblikla0006bjtmqhy23gnt
역할: BRANCH_MANAGER
조직: 페마연지사
직속 매니저 수: 1명
  - 김매니저 (01099998888)
```

#### 페마연지사 조직
```
조직명: 페마연지사
조직 ID: cmme01vzb003u1utnzokgs3jq
타입: BRANCH
상위 조직: 페마연
소속 영업사원 수: 2명
  - 문지용 (BRANCH_MANAGER)
  - 김매니저 (MANAGER)
```

### API 응답 확인

`GET /sales/stats/hierarchy` 엔드포인트에서:

```javascript
{
  branches: [
    {
      id: 'cmmblikla0006bjtmqhy23gnt',
      name: '문지용',
      organizationName: '페마연지사',
      phone: '01089263833',
      managers: 1,  // ✅ 1명으로 표시됨!
      stats: {
        totalCompanies: 0,
        // ...
      }
    }
  ]
}
```

### 관리 페이지 확인

https://jangpyosa.com/admin/sales-management

**지사별 통계 탭:**
| 지사명 | 지사장 | 소속 본부 | 매니저 | 총 기업 | 민간기업 | 공공기관 | 정부교육 | 표준사업장 |
|--------|--------|-----------|--------|---------|----------|----------|----------|------------|
| 경남지사 | 박지사 | 서울본부 | **1명** | 0 | 0 | 0 | 0 | 0 |
| 페마연지사 | 문지용 | - | **1명** | 0 | 0 | 0 | 0 | 0 |

## 🔍 소속 매니저 로직 분석

### 백엔드 코드

```typescript
// apps/api/src/routes/sales.ts
// GET /sales/stats/hierarchy

// 지사별 통계 계산
const branchesStats = await Promise.all(
  branches.map(async (branch) => {
    // 지사장 + 소속 매니저 ID 수집
    const managerIds = branch.subordinates.map(m => m.id);
    const targetIds = [branch.id, ...managerIds];
    
    // ...
    
    return {
      id: branch.id,
      name: branch.name,
      organizationName: branch.organizationName,
      phone: branch.phone,
      email: branch.email,
      managers: branch.subordinates.length,  // ✅ subordinates 길이
      stats,
    };
  })
);
```

### 핵심 관계

**SalesPerson.subordinates**는 `managerId` 필드를 기반으로 합니다:

```prisma
model SalesPerson {
  id            String
  managerId     String?
  manager       SalesPerson?  @relation("SalesHierarchy", fields: [managerId], references: [id])
  subordinates  SalesPerson[] @relation("SalesHierarchy")
  // ...
}
```

**계층 구조:**
```
페마연 본부 (이종근, HEAD_MANAGER)
  ↓ organizationId: 페마연 본부 ID
문지용 (BRANCH_MANAGER)
  ↓ managerId: 문지용 ID
  ↓ organizationId: 페마연지사 ID
김매니저 (MANAGER)
```

## 📝 생성 스크립트

### 위치
`apps/api/scripts/create-pemayeon-mock-manager.cjs`

### 주요 기능
1. 페마연지사와 지사장 확인
2. 목업 매니저 데이터 준비
3. 중복 확인 (같은 핸드폰 번호)
4. 트랜잭션으로 User + SalesPerson 생성
5. 결과 검증 (subordinates 및 organization 확인)

### 실행 방법
```bash
cd /home/ubuntu/jangpyosa/apps/api
node scripts/create-pemayeon-mock-manager.cjs
```

## 🧪 테스트 시나리오

### 1. 매니저 생성 확인
```bash
✅ User 생성: ID cmme0fg210001lwerk5bnull3
✅ SalesPerson 생성: ID cmme0fg240003lwerxuw4lxkq
✅ 조직 배정: 페마연지사 (cmme01vzb003u1utnzokgs3jq)
✅ 상위 매니저 배정: 문지용 (cmmblikla0006bjtmqhy23gnt)
```

### 2. subordinates 관계 확인
```bash
페마연 지사장 (문지용):
  직속 매니저 수: 1명
  직속 매니저:
    - 김매니저 (01099998888)
```

### 3. organization 소속 확인
```bash
페마연지사 조직:
  소속 영업사원 수: 2명
  소속 영업사원:
    - 문지용 (BRANCH_MANAGER)
    - 김매니저 (MANAGER)
```

### 4. API 엔드포인트 확인
```bash
GET /sales/stats/hierarchy
→ branches[].managers: 1 ✅
```

### 5. 관리 페이지 확인
```
https://jangpyosa.com/admin/sales-management
→ 지사별 통계 탭
→ 페마연지사: 매니저 1명 ✅
```

## 🔐 로그인 정보

목업 매니저 계정:
```
Username: 01099998888
Password: test1234
URL: https://jangpyosa.com/login
역할: AGENT (매니저)
```

## 📚 관련 스크립트

### 1. fix-pemayeon-branch.js
- 페마연 지사의 `parentId` 확인 및 수정
- 본부-지사 매칭 검증

### 2. fix-pemayeon-managers.cjs
- 페마연 지사 매니저의 `managerId` 확인 및 수정
- 지사장-매니저 매칭 검증

### 3. check-pemayeon-all.cjs
- 페마연 관련 모든 조직 및 매니저 확인
- 조직별 매니저 분포 확인

### 4. check-gyeongnam.cjs
- 경남지사 (목업) 상태 확인
- 참고용 비교 데이터

### 5. create-pemayeon-mock-manager.cjs ⭐
- **메인 스크립트**: 페마연지사 목업 매니저 생성
- 소속 매니저 로직 테스트

## ✅ 검증 완료

- [x] 목업 매니저 생성 성공
- [x] User + SalesPerson 트랜잭션 처리
- [x] organizationId 설정 (페마연지사)
- [x] managerId 설정 (문지용 지사장)
- [x] subordinates 관계 확인 (1명)
- [x] organization.salesPeople 확인 (2명)
- [x] API 엔드포인트 응답 확인
- [x] 관리 페이지 표시 확인

## 🎓 교훈

### 1. 이중 관계 이해
- **organizationId**: 어느 조직에 소속되어 있는가
- **managerId**: 누구의 부하인가 (subordinates 관계)

### 2. 통계 계산 방식
- 지사별 매니저 수: `branch.subordinates.length`
- 조직별 영업사원 수: `organization.salesPeople.length`

### 3. 데이터 일관성
- organizationId와 managerId가 일치해야 함
- 지사 매니저는 같은 지사의 지사장을 managerId로 가져야 함

### 4. 트랜잭션 중요성
- User와 SalesPerson을 함께 생성
- 실패 시 롤백으로 데이터 일관성 유지

## 🔄 향후 작업

1. **실제 매니저 추가 시**:
   - 스크립트를 참고하여 올바른 관계 설정
   - organizationId = 페마연지사 ID
   - managerId = 문지용 ID

2. **목업 매니저 삭제**:
   ```sql
   -- User 삭제 (CASCADE로 SalesPerson도 삭제됨)
   DELETE FROM "User" WHERE phone = '01099998888';
   ```

3. **추가 테스트**:
   - 여러 매니저 추가 시 subordinates 카운트
   - 매니저 비활성화 시 카운트 변화
   - 매니저 이동 시 카운트 업데이트

---

**작성일**: 2026-03-05  
**작성자**: AI Assistant  
**관련 커밋**: 35ac200
