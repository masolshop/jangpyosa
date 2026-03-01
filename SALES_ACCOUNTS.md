# 영업 계정 정보

## 📋 본부/지사 계정 로그인 정보

모든 본부/지사 계정의 **비밀번호는 전화번호와 동일**합니다.

### 🏢 본부 계정

| 이름 | 역할 | 전화번호 | 비밀번호 |
|-----|-----|---------|---------|
| 페마연 | HEAD_MANAGER | 01098949091 | 01098949091 |

### 🏪 지사 계정

| 이름 | 역할 | 전화번호 | 비밀번호 |
|-----|-----|---------|---------|
| 주렁지사 | BRANCH_MANAGER | 01089263833 | 01089263833 |

---

## 🔐 로그인 방법

### 본부/지사 로그인 페이지
```
URL: https://jangpyosa.com/admin/sales
```

### 전화번호 형식 지원
다음 모든 형식으로 로그인 가능합니다:
- ✅ `01098949091` (기본 형식)
- ✅ `1098949091` (0 생략)
- ✅ `010-9894-9091` (하이픈 포함)
- ✅ `010 9894 9091` (공백 포함)

**예시:**
- ID: `01098949091`, `1098949091`, `010-9894-9091` 모두 로그인 가능
- PW: `01098949091` (전화번호와 동일)

---

## 🔧 비밀번호 재설정 방법

슈퍼어드민이 비밀번호를 재설정해야 할 경우:

```bash
# SSH로 서버 접속
ssh -i ~/.ssh/aws_key.pem ubuntu@43.201.0.129

# 비밀번호 재설정 스크립트 실행
cd ~/jangpyosa/apps/api
node << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  const phone = '01098949091'; // 재설정할 전화번호
  const newPassword = '01098949091'; // 새 비밀번호
  
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { phone },
    data: { passwordHash }
  });
  
  console.log('✅ 비밀번호 재설정 완료');
  await prisma.$disconnect();
}

resetPassword();
EOF
```

---

## 📊 계정 활성화 상태

- 본부/지사 생성 시 **자동으로 활성화** (`isActive: true`)
- 매니저 회원가입 시 **슈퍼어드민 승인 필요** (`isActive: false` → 승인 후 `true`)

---

## 🧪 로그인 테스트

### 본부 계정 테스트
```
1. https://jangpyosa.com/admin/sales 접속
2. 다음 형식으로 로그인 시도:
   - ID: 01098949091, PW: 01098949091 ✅
   - ID: 1098949091, PW: 01098949091 ✅
   - ID: 010-9894-9091, PW: 01098949091 ✅
3. 로그인 성공 → 대시보드 페이지로 이동
```

### 지사 계정 테스트
```
1. https://jangpyosa.com/admin/sales 접속
2. 지사 전화번호로 로그인:
   - ID: 01089263833, PW: 01089263833 ✅
   - ID: 1089263833, PW: 01089263833 ✅
   - ID: 010-8926-3833, PW: 01089263833 ✅
3. 로그인 성공 → 대시보드 페이지로 이동
```

---

## 🎯 정리

✅ **모든 본부/지사 계정의 비밀번호는 전화번호와 동일**  
✅ **전화번호 형식 상관없이 로그인 가능** (하이픈, 공백, 0 생략 모두 지원)  
✅ **본부/지사는 생성 시 자동 활성화**  
✅ **슈퍼어드민 페이지에서 비밀번호 수정 가능**
