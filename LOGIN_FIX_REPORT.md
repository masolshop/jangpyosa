# 🔧 로그인 에러 수정 완료

## 📋 문제 상황

**USER_TYPE_MISMATCH 에러 발생**

사용자가 로그인 페이지에서 "부담금기업" 버튼을 선택하고 핸드폰+비밀번호 입력 후 로그인 시도 시:

```
❌ 로그인 실패: USER_TYPE_MISMATCH
선택하신 회원 유형과 일치하지 않습니다. (계정 유형: BUYER)
```

### 원인 분석

1. **백엔드 검증 로직** (`apps/api/src/routes/auth.ts` 63-69번 라인)
   - 프론트엔드에서 `userType` 파라미터를 전송
   - 백엔드가 `user.role !== body.userType` 검증
   - 불일치 시 403 에러 반환

2. **프론트엔드 검증 로직** (`apps/web/src/app/login/page.tsx` 51-55번 라인)
   - API 응답 후 추가로 `out.user.role !== userType` 검증
   - 불일치 시 에러 메시지 표시 및 로그인 중단

3. **UX 문제점**
   - 사용자는 자신이 어떤 유형으로 가입했는지 기억하지 못할 수 있음
   - 3개 버튼 중 잘못된 버튼 선택 시 로그인 불가
   - 혼란스러운 에러 메시지

---

## ✅ 해결 방안

### **옵션 A (채택): 유형 체크 완전 제거**

핸드폰 번호와 비밀번호만으로 로그인 가능하도록 변경

**장점:**
- ✅ UX 단순화 (버튼 선택 불필요)
- ✅ 에러 가능성 제거
- ✅ 가입한 유형으로 자동 로그인
- ✅ 사용자 혼란 방지

**단점:**
- 회원 유형 버튼이 UI에 남아있지만 실제로는 동작하지 않음 (추후 제거 가능)

---

## 🔨 구현 내용

### 1. 백엔드 수정 (`apps/api/src/routes/auth.ts`)

**변경 전:**
```typescript
// 회원 유형 검증 (선택된 경우)
if (body.userType && user.role !== "SUPER_ADMIN") {
  if (user.role !== body.userType) {
    return res.status(403).json({ 
      error: "USER_TYPE_MISMATCH",
      message: `선택하신 회원 유형과 일치하지 않습니다. (계정 유형: ${user.role})`
    });
  }
}
```

**변경 후:**
```typescript
// ✅ 회원 유형 검증 제거 (핸드폰+비밀번호만 검증)
// 사용자는 가입한 유형으로 자동 로그인됨
// userType 파라미터는 무시됨
```

### 2. 프론트엔드 수정 (`apps/web/src/app/login/page.tsx`)

#### 2-1. 로그인 함수 수정

**변경 전:**
```typescript
async function onLogin() {
  if (!userType) {
    setMsg("회원 유형을 선택해주세요");
    return;
  }
  // ...
  // 선택한 유형과 실제 유형이 일치하는지 확인
  if (out.user.role !== userType && out.user.role !== "SUPER_ADMIN") {
    setMsg(`선택하신 회원 유형(${getUserTypeLabel(userType)})과 일치하지 않습니다.`);
    return;
  }
}
```

**변경 후:**
```typescript
async function onLogin() {
  // ✅ 유형 선택 필수 제거 - 핸드폰+비밀번호만 검증
  
  // ✅ 유형 불일치 검증 제거 - 가입된 유형으로 자동 로그인
  
  // 선택한 유형과 다르면 안내 메시지 표시
  if (userType && userType !== out.user.role && out.user.role !== "SUPER_ADMIN") {
    setMsg(`✅ ${getUserTypeLabel(out.user.role)} 계정으로 로그인되었습니다`);
  } else {
    setMsg("✅ 로그인 성공!");
  }
}
```

#### 2-2. 버튼 활성화 조건 수정

**변경 전:**
```typescript
<button
  disabled={loading || !phone || !password || !userType}
>
```

**변경 후:**
```typescript
<button
  disabled={loading || !phone || !password}
>
```

#### 2-3. 안내 문구 수정

**변경 전:**
```
• 회원가입 시 선택한 회원 유형을 선택해주세요
• 매니저: 지사 관리 및 회원 관리
• 표준사업장: 상품 등록 및 계약 관리
• 부담금기업: 상품 구매 및 계약 요청
```

**변경 후:**
```
• 회원 유형 버튼은 선택하지 않아도 로그인 가능합니다
• 핸드폰 번호와 비밀번호만으로 자동 로그인됩니다
• 가입하신 유형(매니저/표준사업장/부담금기업)으로 자동 접속됩니다
• 회원가입 시 선택한 유형은 변경할 수 없습니다
```

---

## 🧪 테스트 시나리오

### 시나리오 1: 올바른 버튼 선택
1. "부담금기업" 버튼 클릭
2. 부담금기업 계정 핸드폰+비밀번호 입력
3. **결과:** ✅ 로그인 성공! → `/catalog` 페이지 이동

### 시나리오 2: 잘못된 버튼 선택
1. "표준사업장" 버튼 클릭
2. 부담금기업 계정 핸드폰+비밀번호 입력 (유형 불일치)
3. **결과:** ✅ 부담금기업 계정으로 로그인되었습니다 → `/catalog` 페이지 이동

### 시나리오 3: 버튼 선택 없음
1. 아무 버튼도 클릭하지 않음
2. 핸드폰+비밀번호 입력
3. **결과:** ✅ 로그인 성공! → 해당 유형의 기본 페이지 이동

### 시나리오 4: 잘못된 비밀번호
1. 핸드폰 번호 입력 (올바름)
2. 비밀번호 입력 (틀림)
3. **결과:** ❌ 로그인 실패: 핸드폰 번호 또는 비밀번호를 확인하세요

---

## 📊 테스트 계정

| 유형 | 핸드폰 번호 | 비밀번호 |
|------|-------------|----------|
| 슈퍼관리자 | 010-1234-5678 | admin1234 |
| 매니저 | 010-9876-5432 | agent1234 |
| 표준사업장 | 010-8888-9999 | test1234 |
| 부담금기업 | 010-5555-6666 | test1234 |

---

## 🚀 배포 정보

### Git 커밋
```
[main 0c6973e] Fix: Remove USER_TYPE_MISMATCH error - Allow login with phone+password only

- Backend: Remove userType validation in auth.ts
- Frontend: Remove mandatory userType selection
- Auto-login to registered account type regardless of button selection
- Update UI guidance to reflect new behavior
- Fixes #issue where users couldn't login due to type mismatch

Changes:
- apps/api/src/routes/auth.ts: Remove userType check (line 62-70)
- apps/web/src/app/login/page.tsx: Remove userType requirement, update messages

2 files changed, 24 insertions(+), 28 deletions(-)
```

### 서비스 URL
- **메인:** https://3000-i9nss1cey8kihvk6alb7i-02b9cc79.sandbox.novita.ai/
- **로그인:** https://3000-i9nss1cey8kihvk6alb7i-02b9cc79.sandbox.novita.ai/login
- **API:** http://localhost:4000

### PM2 상태
```
┌────┬──────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┐
│ id │ name             │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │
├────┼──────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┤
│ 0  │ jangpyosa-api    │ default     │ N/A     │ fork    │ 14293    │ online │ 0    │ online    │ 0%       │
│ 1  │ jangpyosa-web    │ default     │ N/A     │ fork    │ 14300    │ online │ 0    │ online    │ 0%       │
└────┴──────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┘
```

---

## 🔮 향후 개선 사항

### 1. UI 단순화 (권장)
현재 회원 유형 버튼 3개가 표시되지만 실제로는 동작하지 않음

**옵션 A: 버튼 제거**
```typescript
// 회원 유형 선택 섹션 전체 제거
// 핸드폰 번호 + 비밀번호 입력만 표시
```

**옵션 B: 버튼을 안내용 뱃지로 변경**
```typescript
<div>
  <p>💡 가입하신 유형(매니저/표준사업장/부담금기업)으로 자동 로그인됩니다</p>
  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
    <span>👔 매니저</span>
    <span>🏭 표준사업장</span>
    <span>🏢 부담금기업</span>
  </div>
</div>
```

### 2. "내 계정 유형 확인" 기능 추가
사용자가 자신의 계정 유형을 확인할 수 있는 기능

```typescript
// 비밀번호 찾기 페이지에 추가
<a href="/check-account-type">
  내 계정 유형 확인하기
</a>

// 핸드폰 번호 입력 시 계정 유형 표시 (비밀번호 노출 없이)
// 예: "010-5555-6666은 부담금기업 계정입니다"
```

### 3. 로그인 시 환영 메시지 개선
```typescript
// 로그인 성공 후
setMsg(`✅ ${user.name}님, ${getUserTypeLabel(user.role)} 계정으로 로그인되었습니다`);

// 예: "✅ 홍길동님, 부담금기업 계정으로 로그인되었습니다"
```

---

## 📞 연락처

**문의:**
- 한국장애인고용공단: 1588-1519
- 장표사닷컴: https://3000-i9nss1cey8kihvk6alb7i-02b9cc79.sandbox.novita.ai/

**법적 근거:**
- 장애인고용촉진 및 직업재활법 제33조 (연계고용 부담금 감면)

---

## ✨ 결과 요약

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 로그인 필수 조건 | 핸드폰 + 비밀번호 + 유형 선택 | 핸드폰 + 비밀번호 |
| 유형 불일치 시 | ❌ 로그인 실패 | ✅ 자동 로그인 + 안내 메시지 |
| 에러 발생 가능성 | USER_TYPE_MISMATCH 에러 | 에러 없음 |
| UX 복잡도 | 높음 (3단계) | 낮음 (2단계) |
| 사용자 혼란도 | 높음 | 낮음 |

---

**완료일:** 2026-02-17  
**작업자:** AI Developer  
**프로젝트:** 장표사닷컴 (장애인표준사업장 연계고용 플랫폼)  
**커밋:** 43번째
