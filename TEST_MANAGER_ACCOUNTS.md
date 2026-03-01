# 🧪 테스트 매니저 계정 3개

## 📋 계정 정보

### 1️⃣ 김영희
- **아이디**: 01012345001
- **비밀번호**: manager123
- **이메일**: kim@jangpyosa.com
- **생년월일**: 900101 (1990년 1월 1일생)
- **역할**: MANAGER
- **추천인 링크**: https://jangpyosa.com/01012345001

### 2️⃣ 이철수
- **아이디**: 01012345002
- **비밀번호**: manager123
- **이메일**: lee@jangpyosa.com
- **생년월일**: 850505 (1985년 5월 5일생)
- **역할**: MANAGER
- **추천인 링크**: https://jangpyosa.com/01012345002

### 3️⃣ 박민수
- **아이디**: 01012345003
- **비밀번호**: manager123
- **이메일**: park@jangpyosa.com
- **생년월일**: 920815 (1992년 8월 15일생)
- **역할**: MANAGER
- **추천인 링크**: https://jangpyosa.com/01012345003

---

## 🔗 로그인 페이지
https://jangpyosa.com/admin/sales

---

## 🎯 등업 테스트 시나리오

### 단계별 등업 구조
```
MANAGER (매니저)
   ↓ 등업
BRANCH_MANAGER (지사장)
   ↓ 등업
HEAD_MANAGER (본부장)
```

### 테스트 시나리오 예시

#### 시나리오 1: 김영희를 지사장으로 등업
1. 슈퍼어드민으로 로그인
2. 영업 관리 → 매니저 목록으로 이동
3. 김영희 선택
4. "지사장으로 등업" 버튼 클릭
5. 등업 사유 입력: "우수 실적 달성"
6. 확인

**예상 결과**:
- 김영희의 `role`이 `MANAGER` → `BRANCH_MANAGER`로 변경
- `promotedAt` 날짜 기록
- `promotedBy` 슈퍼어드민 ID 기록
- 지사 배정 가능

#### 시나리오 2: 이철수를 본부장으로 등업
1. 먼저 이철수를 지사장으로 등업
2. 다시 본부장으로 등업
3. 본부 배정

#### 시나리오 3: 박민수에게 지사 배정
1. 슈퍼어드민으로 로그인
2. 지사 목록에서 지사 선택
3. 박민수를 해당 지사에 배정
4. 박민수의 `branchId` 설정

---

## 📊 데이터베이스 확인 방법

### SalesPerson 테이블 확인
```sql
SELECT 
  name, 
  phone, 
  role, 
  promotedAt, 
  isActive,
  totalReferrals,
  totalRevenue
FROM SalesPerson
WHERE phone IN ('01012345001', '01012345002', '01012345003');
```

### User 테이블 확인
```sql
SELECT 
  name, 
  phone, 
  email, 
  role, 
  birthDate,
  branchId
FROM User
WHERE phone IN ('01012345001', '01012345002', '01012345003');
```

---

## ⚠️ 주의사항

1. **비밀번호 변경**: 테스트 후 필요시 비밀번호 변경 가능
2. **실적 데이터**: 테스트를 위해 `totalReferrals`, `totalRevenue` 등을 수동으로 업데이트 가능
3. **등업 권한**: 등업은 슈퍼어드민만 가능
4. **지사 배정**: 등업 전에 지사를 먼저 생성해야 함

---

## 🔧 등업 API 엔드포인트 (구현 필요)

```
POST /api/sales/promote
{
  "salesPersonId": "...",
  "newRole": "BRANCH_MANAGER" | "HEAD_MANAGER",
  "reason": "등업 사유",
  "branchId": "..." (지사장인 경우 필수)
}
```

---

## 📝 등업 기능 구현 체크리스트

- [ ] 슈퍼어드민 전용 등업 UI
- [ ] 매니저 → 지사장 등업
- [ ] 지사장 → 본부장 등업
- [ ] 등업 이력 기록 (promotedAt, promotedBy)
- [ ] 지사 배정 기능
- [ ] 등업 후 권한 변경 확인
- [ ] 등업 알림 (선택사항)

---

## 🎉 생성 완료!

총 **3개의 테스트 매니저 계정**이 생성되었습니다.

**로그인 테스트**: https://jangpyosa.com/admin/sales
