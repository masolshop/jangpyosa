# 본부/지사 로그인 기능 가이드

## ✅ 현재 상태

본부/지사 생성 시 **자동으로 로그인 계정이 생성**됩니다!

### 작동 방식:
1. 슈퍼어드민이 본부/지사 생성
2. 입력한 정보:
   - 이름
   - 전화번호 (핸드폰)
   - 이메일 (선택)
   - 비밀번호
3. 시스템이 자동으로:
   - **User 계정 생성** (role: EMPLOYEE)
   - **SalesPerson 레코드 생성** (role: HEAD_MANAGER 또는 BRANCH_MANAGER)
   - 비밀번호 해시 저장
   - `isActive=true` 설정 (바로 로그인 가능)

---

## 🔐 로그인 방법

### 본부장/지사장 로그인 페이지:
**URL:** https://jangpyosa.com/admin/sales

### 로그인 정보:
- **아이디:** 생성 시 입력한 핸드폰 번호 (예: 01012345678)
- **비밀번호:** 생성 시 입력한 비밀번호

---

## 🧪 테스트 시나리오

### 1단계: 본부 생성 (슈퍼어드민)
1. https://jangpyosa.com/admin/sales-management 접속
2. **[조직도 보기]** 탭
3. **➕ 본부 생성** 버튼 클릭
4. 정보 입력:
   ```
   이름: 테스트본부
   전화번호: 01099999999
   이메일: test@example.com (선택)
   비밀번호: test1234
   ```
5. **생성** 버튼 클릭
6. ✅ "본부장 생성이 완료되었습니다" 메시지 확인

### 2단계: 생성된 계정으로 로그인
1. **새 시크릿 창** 열기 (Ctrl+Shift+N)
2. https://jangpyosa.com/admin/sales 접속
3. 로그인 정보 입력:
   ```
   아이디: 01099999999
   비밀번호: test1234
   ```
4. **로그인** 버튼 클릭
5. ✅ 대시보드로 리다이렉트 확인

### 3단계: 대시보드 확인
로그인 성공 시 이동:
- **URL:** https://jangpyosa.com/admin/sales/dashboard
- **표시 정보:**
  - 본인 이름
  - 역할 (본부장 또는 지사장)
  - 추천 링크
  - 소속 정보

---

## 🎯 역할별 로그인

### 본부장 (HEAD_MANAGER)
- 생성 방법: **➕ 본부 생성** 버튼
- 로그인 페이지: https://jangpyosa.com/admin/sales
- 권한:
  - 자신의 대시보드 확인
  - 소속 지사/매니저 조회
  - 추천 고객 관리

### 지사장 (BRANCH_MANAGER)
- 생성 방법: 본부 카드에서 **➕ 지사 생성** 버튼
- 로그인 페이지: https://jangpyosa.com/admin/sales
- 권한:
  - 자신의 대시보드 확인
  - 소속 매니저 조회
  - 추천 고객 관리

### 매니저 (MANAGER)
- 생성 방법: 회원가입 페이지에서 직접 가입
- 로그인 페이지: https://jangpyosa.com/admin/sales
- 권한:
  - 자신의 대시보드 확인
  - 추천 고객 관리

---

## 🔒 보안

### 비밀번호
- **최소 길이:** 6자
- **해싱:** bcrypt (자동)
- **저장:** 해시만 DB에 저장

### 인증
- **JWT 토큰:** 로그인 시 발급
- **유효기간:** 30일
- **저장 위치:** localStorage (manager_auth_token)

### 권한
- **role 기반:** HEAD_MANAGER, BRANCH_MANAGER, MANAGER
- **isActive 확인:** 비활성 계정은 로그인 차단

---

## ⚠️ 주의사항

### 1. 핸드폰 번호 중복 불가
- 동일한 핸드폰 번호로 여러 계정 생성 불가
- 에러: "이미 등록된 핸드폰번호입니다"

### 2. 비밀번호 분실
- 현재 비밀번호 찾기 기능 없음
- 해결: 슈퍼어드민이 수정 기능으로 비밀번호 변경

### 3. 계정 비활성화
- 슈퍼어드민이 "비활성화" 버튼 클릭 시
- 로그인 차단: "비활성 상태의 계정입니다"

---

## 🛠️ 기술 구현

### 백엔드 (POST /sales/people/create)
```typescript
// User 생성
const user = await prisma.user.create({
  data: {
    phone: normalizedPhone,
    name,
    email: email || undefined,
    passwordHash,  // bcrypt 해시
    role: 'EMPLOYEE',
    privacyAgreed: true,
    privacyAgreedAt: new Date(),
  },
});

// SalesPerson 생성
const salesPerson = await prisma.salesPerson.create({
  data: {
    userId: user.id,
    name,
    phone: normalizedPhone,
    email: email || undefined,
    role,  // HEAD_MANAGER 또는 BRANCH_MANAGER
    managerId,
    referralCode,
    referralLink,
    // isActive는 schema default(true)
  },
});
```

### 로그인 인증 (POST /sales/auth/login)
```typescript
// 1. User 찾기
const user = await prisma.user.findUnique({
  where: { phone },
});

// 2. 비밀번호 확인
const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

// 3. SalesPerson 확인
const salesPerson = await prisma.salesPerson.findUnique({
  where: { userId: user.id },
});

// 4. isActive 확인
if (!salesPerson.isActive) {
  return res.status(403).json({ 
    error: '비활성 상태의 계정입니다' 
  });
}

// 5. JWT 토큰 발급
const token = jwt.sign({ userId, salesPersonId, role }, JWT_SECRET, { 
  expiresIn: '30d' 
});
```

---

## 📝 체크리스트

### 본부/지사 생성 후:
- [ ] 생성 완료 메시지 확인
- [ ] 조직도에서 카드 확인
- [ ] 새 시크릿 창에서 로그인 시도
- [ ] 핸드폰 번호와 비밀번호로 로그인
- [ ] 대시보드로 리다이렉트 확인
- [ ] 본인 정보 표시 확인

### 로그인 실패 시 확인:
- [ ] 핸드폰 번호 정확한지
- [ ] 비밀번호 정확한지 (6자 이상)
- [ ] isActive=true 인지 (슈퍼어드민 확인)
- [ ] 콘솔 에러 확인 (F12)

---

## 🚀 빠른 테스트

```bash
# 1. 본부 생성 (슈퍼어드민)
이름: 테스트본부
핸드폰: 01099999999
이메일: test@test.com
비밀번호: test123456

# 2. 로그인 시도
URL: https://jangpyosa.com/admin/sales
ID: 01099999999
PW: test123456

# 3. 성공 시
→ https://jangpyosa.com/admin/sales/dashboard
→ "테스트본부님 환영합니다!" 표시
```

---

## ✅ 결론

**본부/지사 생성 = 로그인 계정 자동 생성!**

별도의 설정 없이 생성 시 입력한 핸드폰 번호와 비밀번호로 바로 로그인 가능합니다! 🎉
